const { supabase } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// ─── UTILS ──────────────────────────────────────────────────────────────────

const generateId = (prefix) => `${prefix}_${Date.now()}`;
const isCancelledOrRejected = (request) =>
  request?.overall_status === "Cancelled" || request?.overall_status === "Rejected";

// ─── READ OPERATIONS (Kept for Frontend Compatibility) ──────────────────────

exports.getAllClassRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("class_requests")
      .select(`
        id, submitted_at, overall_status, process_status, student_id, participant_count, description,
        students(id, full_name, classes(name)),
        courses(id, name),
        course_sections(id, academic_year, semester, capacity, enrolled_count),
        teachers(id, full_name)
      `)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return sendSuccess(res, "get_all_class_requests", data);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error fetching class requests");
  }
};

exports.getAvailableCourses = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("course_sections")
      .select(`
        id, academic_year, semester, capacity, enrolled_count,
        courses!course_sections_course_id_fkey(id, name, credits)
      `)
      .order("id", { ascending: true });

    if (error) throw error;
    
    const availableCourses = (data || []).filter(section => section.enrolled_count < section.capacity);
    return sendSuccess(res, "get_available_courses", availableCourses);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error fetching available courses");
  }
};

exports.getParticipants = async (req, res) => {
  const { sectionId } = req.params;
  try {
    const { data, error } = await supabase
      .from("student_courses")
      .select(`
        student_id, registered_at,
        students(id, full_name, classes(name))
      `)
      .eq("section_id", sectionId);

    if (error) throw error;

    const participants = data.map((item) => ({
      studentId: item.student_id,
      fullName: item.students?.full_name,
      className: item.students?.classes?.name,
      registeredAt: item.registered_at,
    }));
    return sendSuccess(res, "get_participants", participants);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error fetching participants");
  }
};

// ─── WORKFLOW 1: CLASS OPENING REQUEST ─────────────────────────────────────

// Step 0 - Student submits request
exports.submitClassRequest = async (req, res) => {
  const { course_id, participant_count, description } = req.body;
  const student_id = req.user.userId;

  try {
    const validationErrors = [];
    if (!course_id) {
      validationErrors.push({
        field: "course_id",
        expected: "existing course id",
        actual: course_id ?? null,
      });
    }
    if (!participant_count || Number(participant_count) < 1) {
      validationErrors.push({
        field: "participant_count",
        expected: ">= 1",
        actual: participant_count ?? null,
      });
    }
    if (validationErrors.length > 0) {
      return sendError(res, 400, "INVALID_INPUT", "Invalid request payload", {
        errors: validationErrors,
      });
    }

    // 1. Verify student status
    const { data: student } = await supabase.from("students").select("status").eq("id", student_id).single();
    if (!student || student.status !== "Enrolled") {
      return sendError(res, 400, "STUDENT_NOT_ENROLLED", "Student status is not Enrolled");
    }

    // 2. Verify course exists
    const { data: course } = await supabase.from("courses").select("id, prerequisite").eq("id", course_id).single();
    if (!course) {
      return sendError(res, 404, "NOT_FOUND", "Course not found");
    }

    // 3. Verify no active enrollment
    const { data: enrollments } = await supabase.from("student_courses").select("grade").eq("student_id", student_id).eq("course_id", course_id);
    if (enrollments && enrollments.length > 0) {
      const activeOrPassed = enrollments.some(e => e.grade === null || e.grade >= 5.0);
      if (activeOrPassed) {
        return sendError(res, 400, "DUPLICATE_ENROLLMENT", "Student already has an active or passed enrollment for this course");
      }
    }

    // 4. Verify prerequisite
    if (course.prerequisite) {
      const { data: prereq } = await supabase.from("student_courses").select("grade").eq("student_id", student_id).eq("course_id", course.prerequisite).single();
      if (!prereq || prereq.grade === null || prereq.grade < 5.0) {
        return sendError(res, 400, "PREREQUISITE_NOT_MET", "Required prerequisite course not completed");
      }
    }

    const requestId = generateId("REQ");
    
    // Write
    const { error: insErr } = await supabase.from("class_requests").insert({
      id: requestId,
      submitted_at: new Date().toISOString().split("T")[0],
      overall_status: "Submitted",
      process_status: "0_Pending",
      student_id: student_id,
      course_id: course_id,
      participant_count: participant_count,
      description: description
    });

    if (insErr) throw insErr;

    const { data: newReq } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    return sendSuccess(res, "submit_class_request", newReq, ["class_requests"]);

  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error submitting class request");
  }
};

// Step 1 - Academic Affairs receives request
exports.receiveClassRequest = async (req, res) => {
  const { requestId } = req.params;
  const actorId = req.user.userId;

  try {
    const { data: request } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    if (!request) return sendError(res, 404, "NOT_FOUND", "Request not found");

    if (isCancelledOrRejected(request)) {
      return sendError(res, 400, "INVALID_OVERALL_STATUS", "Request has been Rejected or Cancelled");
    }

    if (request.process_status !== "0_Pending" || request.overall_status !== "Submitted") {
      return sendError(res, 400, "INVALID_PROCESS_STATUS", "Request is not in 0_Pending / Submitted state");
    }

    const { error: updErr } = await supabase.from("class_requests").update({ process_status: "1_AcademicReceived" }).eq("id", requestId);
    if (updErr) throw updErr;

    const { error: histErr } = await supabase.from("request_history").insert({
      id: generateId("HIST"), request_id: requestId, old_status: "0_Pending", new_status: "1_AcademicReceived",
      changed_at: new Date().toISOString().split("T")[0], changed_by: actorId
    });
    if (histErr) throw histErr;

    const { error: procErr } = await supabase.from("request_processing").insert({
      id: generateId("PROC"), request_id: requestId, processor_role: "AcademicAffairs", processed_by: actorId,
      processed_at: new Date().toISOString().split("T")[0], status: "Forwarded"
    });
    if (procErr) throw procErr;

    const { data: updatedReq } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    return sendSuccess(res, "receive_class_request", updatedReq, ["class_requests", "request_history", "request_processing"]);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error receiving request");
  }
};

// Step 2 - Department Head reviews
exports.reviewClassRequest = async (req, res) => {
  const { requestId } = req.params;
  const { decision, notes } = req.body;
  const actorId = req.user.userId;

  try {
    const { data: request } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    if (!request) return sendError(res, 404, "NOT_FOUND", "Request not found");

    if (isCancelledOrRejected(request)) {
      return sendError(res, 400, "INVALID_OVERALL_STATUS", "Request has been Rejected or Cancelled");
    }

    if (request.process_status !== "1_AcademicReceived") {
      return sendError(res, 400, "INVALID_PROCESS_STATUS", "Request is not in 1_AcademicReceived state");
    }

    if (decision === "approve") {
      const { error: reqErr } = await supabase.from("class_requests").update({ process_status: "2_DeptHeadReceived" }).eq("id", requestId);
      if (reqErr) throw reqErr;
      const { error: histErr } = await supabase.from("request_history").insert({
        id: generateId("HIST"), request_id: requestId, old_status: "1_AcademicReceived", new_status: "2_DeptHeadReceived",
        changed_at: new Date().toISOString().split("T")[0], changed_by: actorId, notes
      });
      if (histErr) throw histErr;
      const { error: procErr } = await supabase.from("request_processing").insert({
        id: generateId("PROC"), request_id: requestId, processor_role: "DepartmentHead", processed_by: actorId,
        processed_at: new Date().toISOString().split("T")[0], status: "Forwarded", notes
      });
      if (procErr) throw procErr;
    } else if (decision === "reject") {
      const { error: reqErr } = await supabase.from("class_requests").update({ process_status: "0_Pending", overall_status: "Rejected" }).eq("id", requestId);
      if (reqErr) throw reqErr;
      const { error: histErr } = await supabase.from("request_history").insert({
        id: generateId("HIST"), request_id: requestId, old_status: "1_AcademicReceived", new_status: "0_Pending",
        changed_at: new Date().toISOString().split("T")[0], changed_by: actorId, notes
      });
      if (histErr) throw histErr;
      const { error: procErr } = await supabase.from("request_processing").insert({
        id: generateId("PROC"), request_id: requestId, processor_role: "DepartmentHead", processed_by: actorId,
        processed_at: new Date().toISOString().split("T")[0], status: "Rejected", notes
      });
      if (procErr) throw procErr;
    } else {
      return sendError(res, 400, "INVALID_INPUT", "decision must be 'approve' or 'reject'");
    }

    const { data: updatedReq } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    return sendSuccess(res, "review_class_request", updatedReq, ["class_requests", "request_history", "request_processing"]);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error reviewing request");
  }
};

// Step 3 - Faculty Head final approval
exports.approveClassRequest = async (req, res) => {
  const { requestId } = req.params;
  const { decision, notes } = req.body;
  const actorId = req.user.userId;

  try {
    const { data: request } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    if (!request) return sendError(res, 404, "NOT_FOUND", "Request not found");

    if (isCancelledOrRejected(request)) {
      return sendError(res, 400, "INVALID_OVERALL_STATUS", "Request has been Rejected or Cancelled");
    }

    if (request.process_status !== "2_DeptHeadReceived") {
      return sendError(res, 400, "INVALID_PROCESS_STATUS", "Request is not in 2_DeptHeadReceived state");
    }

    if (decision === "approve") {
      const { error: reqErr } = await supabase.from("class_requests").update({ process_status: "4_WaitingOpen", overall_status: "Approved" }).eq("id", requestId);
      if (reqErr) throw reqErr;
      const { error: histErr } = await supabase.from("request_history").insert({
        id: generateId("HIST"), request_id: requestId, old_status: "2_DeptHeadReceived", new_status: "4_WaitingOpen",
        changed_at: new Date().toISOString().split("T")[0], changed_by: actorId, notes
      });
      if (histErr) throw histErr;
      const { error: procErr } = await supabase.from("request_processing").insert({
        id: generateId("PROC"), request_id: requestId, processor_role: "FacultyHead", processed_by: actorId,
        processed_at: new Date().toISOString().split("T")[0], status: "Approved", notes
      });
      if (procErr) throw procErr;
      // Proactively notify AcademicAffairs
      const { error: newsErr } = await supabase.from("news").insert({
        id: generateId("NEWS"), title: "New Section Ready to Open", content: `Request ${requestId} approved and waiting to be opened.`,
        posted_at: new Date().toISOString().split("T")[0], posted_by: actorId, audience: "All"
      });
      if (newsErr) throw newsErr;
    } else if (decision === "reject") {
      const { error: reqErr } = await supabase.from("class_requests").update({ overall_status: "Rejected" }).eq("id", requestId);
      if (reqErr) throw reqErr;
      const { error: histErr } = await supabase.from("request_history").insert({
        id: generateId("HIST"), request_id: requestId, old_status: "2_DeptHeadReceived", new_status: "0_Pending",
        changed_at: new Date().toISOString().split("T")[0], changed_by: actorId, notes
      });
      if (histErr) throw histErr;
      const { error: procErr } = await supabase.from("request_processing").insert({
        id: generateId("PROC"), request_id: requestId, processor_role: "FacultyHead", processed_by: actorId,
        processed_at: new Date().toISOString().split("T")[0], status: "Rejected", notes
      });
      if (procErr) throw procErr;
    } else {
      return sendError(res, 400, "INVALID_INPUT", "decision must be 'approve' or 'reject'");
    }

    const { data: updatedReq } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    return sendSuccess(res, "approve_class_request", updatedReq, ["class_requests", "request_history", "request_processing"]);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error approving request");
  }
};

// Step 4 - Open course section
exports.openCourseSection = async (req, res) => {
  const { requestId } = req.params;
  const { academic_year, semester, capacity, start_date, end_date } = req.body;

  try {
    const validationErrors = [];
    if (!academic_year) validationErrors.push({ field: "academic_year", expected: "non-empty", actual: academic_year ?? null });
    if (!semester) validationErrors.push({ field: "semester", expected: "non-empty", actual: semester ?? null });
    if (!capacity || Number(capacity) < 1) validationErrors.push({ field: "capacity", expected: ">= 1", actual: capacity ?? null });
    if (!start_date) validationErrors.push({ field: "start_date", expected: "valid date", actual: start_date ?? null });
    if (!end_date) validationErrors.push({ field: "end_date", expected: "valid date", actual: end_date ?? null });
    if (validationErrors.length > 0) {
      return sendError(res, 400, "INVALID_INPUT", "Invalid section parameters", { errors: validationErrors });
    }

    const { data: request } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    if (!request) return sendError(res, 404, "NOT_FOUND", "Request not found");

    if (isCancelledOrRejected(request)) {
      return sendError(res, 400, "INVALID_OVERALL_STATUS", "Request has been Rejected or Cancelled");
    }

    if (request.process_status !== "4_WaitingOpen" || request.overall_status !== "Approved") {
      return sendError(res, 400, "INVALID_PROCESS_STATUS", "Request is not in 4_WaitingOpen / Approved state");
    }

    const { data: existingSection } = await supabase.from("course_sections").select("id").eq("course_id", request.course_id).eq("academic_year", academic_year).eq("semester", semester).eq("status", "Active");
    if (existingSection && existingSection.length > 0) {
      return sendError(res, 400, "INVALID_INPUT", "A section for this course/year/semester is already Active");
    }

    const newSectionId = generateId("SEC");

    const { error: sectionErr } = await supabase.from("course_sections").insert({
      id: newSectionId, course_id: request.course_id, academic_year, semester, capacity,
      enrolled_count: 0, status: "Active", start_date, end_date, teacher_id: null
    });
    if (sectionErr) throw sectionErr;

    const { error: reqErr } = await supabase.from("class_requests").update({ section_id: newSectionId, process_status: "4_WaitingOpen" }).eq("id", requestId);
    if (reqErr) throw reqErr;

    const { data: updatedReq } = await supabase.from("class_requests").select("*").eq("id", requestId).single();
    return sendSuccess(res, "open_course_section", updatedReq, ["course_sections", "class_requests"]);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error opening course section");
  }
};

// ─── JOIN CLASS REQUEST (Frontend Compatibility) ───────────────────────────
// The prompt doesn't specify joining a request, but the UI needs it. We will just add a student to student_courses and increment participant_count.
exports.joinClassRequest = async (req, res) => {
  const { sectionId } = req.body;
  const studentId = req.user.userId;

  try {
    const { data: user } = await supabase.from("users").select("role").eq("id", studentId).single();
    if (!user || user.role !== "Student") {
      return sendError(res, 403, "UNAUTHORIZED", "Only students can join class requests");
    }

    const { data: existing } = await supabase.from("student_courses").select("*").eq("student_id", studentId).eq("section_id", sectionId).single();
    if (existing) {
      return sendError(res, 400, "DUPLICATE_ENROLLMENT", "Student already registered for this section");
    }

    const { data: section } = await supabase.from("course_sections").select("course_id").eq("id", sectionId).single();
    if (!section) return sendError(res, 404, "NOT_FOUND", "Class section not found");

    await supabase.from("student_courses").insert({
      student_id: studentId, course_id: section.course_id, section_id: sectionId, registered_at: new Date().toISOString().split("T")[0]
    });

    const { data: classReq } = await supabase.from("class_requests").select("id, participant_count").eq("section_id", sectionId).single();
    if (classReq) {
      await supabase.from("class_requests").update({ participant_count: classReq.participant_count + 1 }).eq("id", classReq.id);
    }

    return sendSuccess(res, "join_class_request", null, ["student_courses", "class_requests"]);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error joining class request");
  }
};
