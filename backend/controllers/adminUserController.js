const { supabase } = require("../config/db");

// ─── User Management ─────────────────────────────────────────────────────────

async function createUserWithDetail(userData) {
  if (!userData || typeof userData !== "object") {
    throw { success: false, message: "Missing or invalid userData" };
  }
  const { error } = await supabase.from("users").insert(userData);
  if (error) {
    if (error.code === "23505") {
      throw { success: false, message: "User ID already exists", error };
    }
    throw { success: false, message: "Error creating user", error };
  }
  return { success: true, message: "User created successfully" };
}

async function getUsersByType(type) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, role")
    .eq("role", type)
    .order("username");
  if (error) throw error;
  return data || [];
}

async function getUserById(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, role")
    .eq("id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data ? [data] : [];
}

async function updateUser(userId, userData) {
  if (!userData || typeof userData !== "object") {
    throw { success: false, message: "Missing or invalid userData" };
  }
  if (Object.keys(userData).length > 0) {
    const { error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId);
    if (error) throw { success: false, message: "Error updating user", error };
  }
  return { success: true, message: "User updated successfully" };
}

async function deleteUser(userId) {
  try {
    const { data: user, error: checkError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (checkError || !user) {
      throw { success: false, message: "User not found" };
    }

    const { role } = user;

    // Delete shared records
    await supabase.from("news").delete().eq("posted_by", userId);
    await supabase.from("request_history").delete().eq("changed_by", userId);
    await supabase.from("request_processing").delete().eq("processed_by", userId);

    if (role === "Student") {
      await supabase.from("student_schedules").delete().eq("student_id", userId);

      const { data: reqIds } = await supabase
        .from("class_requests")
        .select("id")
        .eq("student_id", userId);
      if (reqIds && reqIds.length > 0) {
        const ids = reqIds.map((r) => r.id);
        await supabase.from("request_history").delete().in("request_id", ids);
      }

      await supabase.from("class_requests").delete().eq("student_id", userId);
      await supabase.from("class_enrollments").delete().eq("student_id", userId);
      await supabase.from("student_courses").delete().eq("student_id", userId);
      await supabase.from("students").delete().eq("id", userId);
    } else if (["Teacher", "AcademicAffairs", "DepartmentHead", "FacultyHead"].includes(role)) {
      await supabase.from("teacher_schedules").delete().eq("teacher_id", userId);
      await supabase.from("classes").update({ advisor_id: null }).eq("advisor_id", userId);
      await supabase.from("course_sections").update({ teacher_id: null }).eq("teacher_id", userId);
      await supabase.from("teacher_assignments").delete().eq("teacher_id", userId);
      await supabase.from("teaching_registrations").delete().eq("teacher_id", userId);
      await supabase.from("teachers").delete().eq("id", userId);
    }

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);
    if (deleteError) throw deleteError;

    return { success: true, message: "User and related data deleted successfully" };
  } catch (error) {
    throw { success: false, message: error.message || "Error deleting user", error };
  }
}

// ─── Statistics ────────────────────────────────────────────────────────────

async function getStudentStats() {
  const results = {};

  const { count: totalCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });
  results.total = totalCount || 0;

  // By class
  const { data: studentsWithClass } = await supabase
    .from("students")
    .select("classes(name)");
  const classCounts = {};
  (studentsWithClass || []).forEach((s) => {
    const name = s.classes?.name;
    if (name) classCounts[name] = (classCounts[name] || 0) + 1;
  });
  results.byClass = Object.entries(classCounts)
    .map(([className, count]) => ({ class: className, count }))
    .sort((a, b) => b.count - a.count);

  // Registration status
  const { data: studentsWithSch } = await supabase
    .from("students")
    .select("id, student_schedules(id)");
  let registered = 0;
  let notRegistered = 0;
  (studentsWithSch || []).forEach((s) => {
    if (s.student_schedules && s.student_schedules.length > 0) registered++;
    else notRegistered++;
  });
  results.registrationStatus = [
    { status: "Registered", count: registered },
    { status: "Not Registered", count: notRegistered },
  ];

  // Recent class requests
  const { data: classReqs } = await supabase
    .from("class_requests")
    .select(`
      id, participant_count, description, overall_status, process_status, submitted_at,
      course_sections(courses!course_sections_course_id_fkey(name))
    `)
    .order("submitted_at", { ascending: false })
    .limit(5);

  results.classRequests = (classReqs || []).map((r) => ({
    id: r.id,
    courseName: r.course_sections?.courses?.name || null,
    participantCount: r.participant_count,
    description: r.description,
    status: r.overall_status,
    processStatus: r.process_status,
    requestDate: r.submitted_at,
  }));

  results.requestHistory = (classReqs || []).map((r) => {
    const d = new Date(r.submitted_at);
    const timeStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    return {
      action: "Class open request: " + (r.course_sections?.courses?.name || ""),
      time: timeStr,
    };
  });

  return results;
}

async function getTeacherStats() {
  const results = {};

  const { count: totalCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true });
  results.total = totalCount || 0;

  // Class count by semester
  const { data: sections } = await supabase
    .from("course_sections")
    .select("semester, academic_year");
  const semesterCounts = {};
  (sections || []).forEach((s) => {
    if (s.semester && s.academic_year) {
      const key = `Sem${s.semester}-${s.academic_year}`;
      semesterCounts[key] = (semesterCounts[key] || 0) + 1;
    }
  });
  results.classCountBySemester = Object.entries(semesterCounts)
    .map(([semester, count]) => ({ semester, count }))
    .sort((a, b) => b.semester.localeCompare(a.semester))
    .slice(0, 6);

  // Recent schedule
  const { data: schedule } = await supabase
    .from("teacher_schedules")
    .select(`
      class_date, period_start, period_end,
      teachers(full_name),
      course_sections(courses!course_sections_course_id_fkey(name))
    `)
    .order("class_date")
    .order("period_start")
    .limit(10);

  results.schedule = (schedule || []).map((t) => {
    const d = new Date(t.class_date);
    const dateStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    return {
      teacher: t.teachers?.full_name || null,
      time: `Period ${t.period_start}-${t.period_end} (${dateStr})`,
      subject: t.course_sections?.courses?.name || null,
    };
  });

  const d = new Date();
  results.approveHistory = [{
    action: "Approved class open request",
    time: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`,
  }];

  return results;
}

// ─── Class Requests (Admin) ────────────────────────────────────────────────

async function getClassRequests() {
  const { data, error } = await supabase
    .from("class_requests")
    .select(`
      id, participant_count, description, overall_status, process_status, submitted_at,
      students(full_name),
      course_sections(id, courses!course_sections_course_id_fkey(name))
    `)
    .order("submitted_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((r) => ({
    id: r.id,
    courseName: r.course_sections?.courses?.name || null,
    participantCount: r.participant_count,
    description: r.description,
    status: r.overall_status,
    processStatus: r.process_status,
    requestDate: r.submitted_at,
    requesterName: r.students?.full_name || null,
    sectionId: r.course_sections?.id || null,
    classCode: r.course_sections?.id || null,
  }));
}

async function updateClassRequestStatus(requestId, status) {
  const { error } = await supabase
    .from("class_requests")
    .update({ overall_status: status })
    .eq("id", requestId);
  if (error) throw error;
  return true;
}

async function getRequestHistory(requestId) {
  const { data, error } = await supabase
    .from("request_history")
    .select(`
      old_status, new_status, changed_at,
      users(role, students(full_name), teachers(full_name))
    `)
    .eq("request_id", requestId)
    .order("changed_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((r) => {
    let changedBy = "Unknown";
    if (r.users) {
      if (r.users.role === "Student") {
        changedBy = r.users.students?.full_name || changedBy;
      } else {
        changedBy = r.users.teachers?.full_name || changedBy;
      }
    }
    return {
      oldStatus: r.old_status,
      newStatus: r.new_status,
      changeDate: r.changed_at,
      changedBy,
    };
  });
}

module.exports = {
  createUserWithDetail,
  getUsersByType,
  getUserById,
  updateUser,
  deleteUser,
  getStudentStats,
  getTeacherStats,
  getClassRequests,
  updateClassRequestStatus,
  getRequestHistory,
};
