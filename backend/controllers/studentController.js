const StudentModel = require("../models/studentModel");
const { supabase } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

exports.getAllStudents = async (req, res) => {
  try {
    const results = await StudentModel.getAllStudents();
    return sendSuccess(res, "get_all_students", results);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "INTERNAL_ERROR", "Query error");
  }
};

exports.getStudent = async (req, res) => {
  const studentId = req.params.id;
  try {
    const student = await StudentModel.getStudentById(studentId);
    if (!student) return sendError(res, 404, "NOT_FOUND", "Student not found");
    
    return sendSuccess(res, "get_student", {
      id: student.id,
      fullName: student.full_name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      birthDate: student.birth_date,
      gender: student.gender,
      enrollmentDate: student.enrollment_date,
      status: student.status,
      majorId: student.major_id,
      majorName: student.majors?.name,
      className: student.classes?.name,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "INTERNAL_ERROR", "Query error");
  }
};

exports.getStudentOverview = async (req, res) => {
  const studentId = req.params.id;
  try {
    const overview = await StudentModel.getStudentOverview(studentId);
    return sendSuccess(res, "get_student_overview", overview);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "INTERNAL_ERROR", "Query error");
  }
};

// ─── WORKFLOW 3: STUDENT COURSE ENROLLMENT ─────────────────────────────────

const checkScheduleConflict = (sched1, sched2) => {
  if (sched1.class_date !== sched2.class_date) return false;
  // Format is usually HH:mm or period numbers. Assume period_start and period_end are integers or strings that can be compared
  if (sched1.period_end < sched2.period_start || sched1.period_start > sched2.period_end) {
    return false;
  }
  return true;
};

exports.enrollInSection = async (req, res) => {
  const { sectionId } = req.body;
  const studentId = req.user.userId;

  try {
    // 1. Check section active and capacity
    const { data: section } = await supabase.from("course_sections").select("*, courses(prerequisite)").eq("id", sectionId).single();
    if (!section) return sendError(res, 404, "NOT_FOUND", "Section not found");
    if (section.status !== "Active") return sendError(res, 400, "SECTION_NOT_ACTIVE", "Section is not Active");
    if (section.enrolled_count >= section.capacity) return sendError(res, 400, "SECTION_FULL", "Section is full");

    // 2. Check student status
    const { data: student } = await supabase.from("students").select("status").eq("id", studentId).single();
    if (!student || student.status !== "Enrolled") return sendError(res, 400, "STUDENT_NOT_ENROLLED", "Student is not enrolled");

    // 3. Check not already enrolled in this section
    const { data: existingSectionEnrollment } = await supabase
      .from("class_enrollments")
      .select("status")
      .eq("student_id", studentId)
      .eq("section_id", sectionId)
      .single();
    if (existingSectionEnrollment) {
      return sendError(res, 400, "DUPLICATE_ENROLLMENT", "Already enrolled in this section");
    }

    // 4. Check not already enrolled in same course
    const { data: existingCourse } = await supabase.from("student_courses").select("grade").eq("student_id", studentId).eq("course_id", section.course_id);
    if (existingCourse && existingCourse.length > 0) {
      const activeOrPassed = existingCourse.some(c => c.grade === null || c.grade >= 5.0);
      if (activeOrPassed) return sendError(res, 400, "DUPLICATE_ENROLLMENT", "Already enrolled or passed this course");
    }

    // 5. Prerequisite
    if (section.courses?.prerequisite) {
      const { data: prereqRows } = await supabase
        .from("student_courses")
        .select("grade")
        .eq("student_id", studentId)
        .eq("course_id", section.courses.prerequisite);
      const hasPassedPrerequisite = (prereqRows || []).some((row) => row.grade !== null && row.grade >= 5.0);
      if (!hasPassedPrerequisite) {
        return sendError(res, 400, "PREREQUISITE_NOT_MET", "Prerequisite not met");
      }
    }

    // 6. Schedule conflict
    const { data: teacherSchedules } = await supabase.from("teacher_schedules").select("*").eq("section_id", sectionId);
    if (teacherSchedules && teacherSchedules.length > 0) {
      const { data: studentSchedules } = await supabase.from("student_schedules").select("*").eq("student_id", studentId);
      if (studentSchedules) {
        for (let ts of teacherSchedules) {
          for (let ss of studentSchedules) {
            if (checkScheduleConflict(ts, ss)) {
              return sendError(res, 400, "SCHEDULE_CONFLICT", "Schedule conflict detected");
            }
          }
        }
      }
    }

    // MANUAL TRANSACTION ROLLBACK LOGIC
    let rollbacks = [];
    try {
      const registeredAt = new Date().toISOString().split("T")[0];

      // A. student_courses
      const { error: err1 } = await supabase.from("student_courses").insert({ student_id: studentId, course_id: section.course_id, section_id: sectionId, registered_at: registeredAt });
      if (err1) throw err1;
      rollbacks.push(async () => await supabase.from("student_courses").delete().eq("student_id", studentId).eq("section_id", sectionId));

      // B. class_enrollments
      const { error: err2 } = await supabase.from("class_enrollments").insert({ student_id: studentId, section_id: sectionId, status: "Active", enrolled_at: registeredAt });
      if (err2) throw err2;
      rollbacks.push(async () => await supabase.from("class_enrollments").delete().eq("student_id", studentId).eq("section_id", sectionId));

      // Capacity re-check after write to reduce race window in high concurrency
      const { count: currentActiveCount, error: activeCountErr } = await supabase
        .from("class_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("section_id", sectionId)
        .eq("status", "Active");
      if (activeCountErr) throw activeCountErr;
      if ((currentActiveCount || 0) > section.capacity) {
        throw new Error("SECTION_FULL_AFTER_LOCKLESS_CHECK");
      }

      // C. Recalculate enrolled_count from active enrollments to preserve integrity
      const { count: activeCount, error: countErr } = await supabase
        .from("class_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("section_id", sectionId)
        .eq("status", "Active");
      if (countErr) throw countErr;

      const { error: err3 } = await supabase
        .from("course_sections")
        .update({ enrolled_count: activeCount || 0 })
        .eq("id", sectionId);
      if (err3) throw err3;
      rollbacks.push(async () => await supabase.from("course_sections").update({ enrolled_count: section.enrolled_count }).eq("id", sectionId));

      // D. Copy schedules
      if (teacherSchedules && teacherSchedules.length > 0) {
        const insertSchedules = teacherSchedules.map(ts => ({
          id: `SS_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          student_id: studentId,
          section_id: ts.section_id,
          class_date: ts.class_date,
          period_start: ts.period_start,
          period_end: ts.period_end,
          room: ts.room,
          session_type: ts.session_type
        }));
        const { error: err4 } = await supabase.from("student_schedules").insert(insertSchedules);
        if (err4) throw err4;
        rollbacks.push(async () => await supabase.from("student_schedules").delete().eq("student_id", studentId).eq("section_id", sectionId));
      }

      return sendSuccess(res, "enroll_in_section", null, ["student_courses", "class_enrollments", "course_sections", "student_schedules"]);

    } catch (txError) {
      console.error("Transaction failed, rolling back...", txError);
      for (let rollback of rollbacks.reverse()) {
        await rollback().catch(e => console.error("Rollback failed", e));
      }
      if (txError.message === "SECTION_FULL_AFTER_LOCKLESS_CHECK") {
        return sendError(res, 400, "SECTION_FULL", "Section is full");
      }
      return sendError(res, 500, "INTERNAL_ERROR", "Transaction failed during enrollment");
    }

  } catch (error) {
    console.error(error);
    return sendError(res, 500, "INTERNAL_ERROR", "Error enrolling in section");
  }
};
