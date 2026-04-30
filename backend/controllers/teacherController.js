const { supabase } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const generateId = (prefix) => `${prefix}_${Date.now()}`;

// ─── UTILITIES ──────────────────────────────────────────────────────────────

const checkScheduleConflict = (sched1, sched2) => {
  if (sched1.class_date !== sched2.class_date) return false;
  if (sched1.period_end < sched2.period_start || sched1.period_start > sched2.period_end) {
    return false;
  }
  return true;
};

// ─── WORKFLOW 2: TEACHER REGISTRATION & ASSIGNMENT ─────────────────────────

exports.registerTeaching = async (req, res) => {
  const { sectionId } = req.body;
  const teacherId = req.user.userId;

  try {
    // 1. Check section status
    const { data: section } = await supabase.from("course_sections").select("status").eq("id", sectionId).single();
    if (!section) return sendError(res, 404, "NOT_FOUND", "Section not found");
    if (section.status !== "Active" && section.status !== "NotOpen") {
      return sendError(res, 400, "SECTION_NOT_ACTIVE", "Section is not Active or NotOpen");
    }

    // 2. Check if already has an existing registration
    const { data: existingReg } = await supabase
      .from("teaching_registrations")
      .select("status")
      .eq("teacher_id", teacherId)
      .eq("section_id", sectionId)
      .maybeSingle();
    if (existingReg) {
      return sendError(res, 400, "DUPLICATE_ENROLLMENT", "Teacher already has a registration for this section");
    }

    // 3. Check schedule conflict
    // Get target section schedules (where teacher_id is null or assigned to this section)
    const { data: targetSchedules } = await supabase.from("teacher_schedules").select("*").eq("section_id", sectionId);
    if (targetSchedules && targetSchedules.length > 0) {
      // Get teacher's existing schedules
      const { data: existingSchedules } = await supabase.from("teacher_schedules").select("*").eq("teacher_id", teacherId);
      if (existingSchedules) {
        for (let target of targetSchedules) {
          for (let existing of existingSchedules) {
            // Ignore if it's the exact same record
            if (target.id === existing.id) continue;
            if (checkScheduleConflict(target, existing)) {
              return sendError(res, 400, "SCHEDULE_CONFLICT", "Schedule conflict detected");
            }
          }
        }
      }
    }

    const registrationId = generateId("TR");
    const { error: insErr } = await supabase.from("teaching_registrations").insert({
      id: registrationId,
      teacher_id: teacherId,
      section_id: sectionId,
      registered_at: new Date().toISOString().split("T")[0],
      status: "Pending"
    });

    if (insErr) throw insErr;

    const { data: newReg } = await supabase.from("teaching_registrations").select("*").eq("id", registrationId).single();
    return sendSuccess(res, "register_teaching", newReg, ["teaching_registrations"]);
  } catch (err) {
    console.error("Error in registerTeaching:", err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error registering teaching");
  }
};

exports.decideTeachingRegistration = async (req, res) => {
  const { registrationId } = req.params;
  const { decision, notes } = req.body;
  
  if (req.user.userRole !== "AcademicAffairs") {
    return sendError(res, 403, "UNAUTHORIZED", "Only AcademicAffairs can decide teaching registrations");
  }

  try {
    const { data: reg } = await supabase.from("teaching_registrations").select("*").eq("id", registrationId).single();
    if (!reg) return sendError(res, 404, "NOT_FOUND", "Registration not found");

    if (reg.status !== "Pending") {
      return sendError(res, 400, "INVALID_PROCESS_STATUS", "Registration is already processed");
    }

    if (decision === "approve") {
      const { error: regErr } = await supabase.from("teaching_registrations").update({ status: "Approved" }).eq("id", registrationId);
      if (regErr) throw regErr;
      
      const assignmentId = generateId("TA");
      const { error: assignmentErr } = await supabase.from("teacher_assignments").insert({
        id: assignmentId,
        teacher_id: reg.teacher_id,
        section_id: reg.section_id,
        assigned_at: new Date().toISOString().split("T")[0]
      });
      if (assignmentErr) throw assignmentErr;

      const { error: sectionErr } = await supabase.from("course_sections").update({ teacher_id: reg.teacher_id }).eq("id", reg.section_id);
      if (sectionErr) throw sectionErr;

      return sendSuccess(res, "decide_teaching_registration", { status: "Approved" }, ["teaching_registrations", "teacher_assignments", "course_sections"]);
    } else if (decision === "reject") {
      const { error: regErr } = await supabase.from("teaching_registrations").update({ status: "Rejected" }).eq("id", registrationId);
      if (regErr) throw regErr;
      return sendSuccess(res, "decide_teaching_registration", { status: "Rejected" }, ["teaching_registrations"]);
    } else {
      return sendError(res, 400, "INVALID_INPUT", "Decision must be approve or reject");
    }
  } catch (err) {
    console.error("Error in decideTeachingRegistration:", err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error deciding teaching registration");
  }
};

// ─── WORKFLOW 4: GRADE ENTRY ────────────────────────────────────────────────

exports.enterGrade = async (req, res) => {
  const { studentId, sectionId, grade } = req.body;
  const teacherId = req.user.userId;

  try {
    // 1. Verify caller is assigned teacher
    const { data: assignment } = await supabase.from("teacher_assignments").select("*").eq("teacher_id", teacherId).eq("section_id", sectionId).single();
    if (!assignment) {
      return sendError(res, 403, "UNAUTHORIZED", "Caller is not assigned to this section");
    }

    // 2. Verify enrollment active
    const { data: enrollment } = await supabase.from("class_enrollments").select("status").eq("student_id", studentId).eq("section_id", sectionId).single();
    if (!enrollment || enrollment.status !== "Active") {
      return sendError(res, 400, "INVALID_PROCESS_STATUS", "Enrollment is not Active");
    }

    // 3. Verify grade range
    if (grade < 0.0 || grade > 10.0) {
      return sendError(res, 400, "INVALID_GRADE", "Grade must be between 0.0 and 10.0");
    }

    // 4. Verify section status
    const { data: section } = await supabase.from("course_sections").select("status").eq("id", sectionId).single();
    if (!section || section.status === "NotOpen") {
      return sendError(res, 400, "SECTION_NOT_ACTIVE", "Section is NotOpen");
    }

    // Enter grade
    const { error: updErr } = await supabase.from("student_courses").update({ grade }).eq("student_id", studentId).eq("section_id", sectionId);
    if (updErr) throw updErr;

    // Post-condition: auto-complete enrollment if all sections graded
    // Wait, the prompt says "if all sections graded". Actually, it says:
    // EXISTS (SELECT 1 FROM student_courses sc WHERE sc.student_id = studentId AND sc.section_id = sectionId AND sc.grade IS NOT NULL)
    // So we just update the enrollment status for this specific section!
    await supabase.from("class_enrollments").update({ status: "Completed" }).eq("student_id", studentId).eq("section_id", sectionId);

    return sendSuccess(res, "enter_grade", { grade }, ["student_courses", "class_enrollments"]);
  } catch (err) {
    console.error("Error in enterGrade:", err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error entering grade");
  }
};

// ─── LEGACY COMPATIBILITY ──────────────────────────────────────────────────

exports.getClassCount = async (req, res) => {
  const teacherId = req.user.userId;
  try {
    const { count, error } = await supabase.from("classes").select("*", { count: "exact", head: true }).eq("advisor_id", teacherId);
    if (error) throw error;
    // Keep legacy response format if it wasn't standardized, but we use standard here
    return sendSuccess(res, "get_class_count", { classCount: count || 0 });
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error fetching class count");
  }
};

exports.getAvailableClassSections = async (req, res) => {
  // Legacy stub
  return sendSuccess(res, "get_available_sections", []);
};

exports.getApprovedClassSections = async (req, res) => {
  return sendSuccess(res, "get_approved_sections", []);
};

exports.createNewClassSections = async (req, res) => {
  return sendSuccess(res, "create_sections", []);
};

exports.getAvailableTimeSlots = async (req, res) => {
  return sendSuccess(res, "get_time_slots", []);
};
