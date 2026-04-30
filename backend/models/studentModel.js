const { supabase } = require("../config/db");

const StudentModel = {
  async getAllStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, email, phone, address, birth_date, gender, enrollment_date, status, major_id, class_id");
    if (error) throw error;
    return data;
  },

  async getStudentById(id) {
    const { data, error } = await supabase
      .from("students")
      .select(`
        id, full_name, email, phone, address, birth_date, gender,
        enrollment_date, status, major_id, class_id,
        majors(name),
        classes(name)
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getStudentOverview(id) {
    const { count: registeredCount, error: regError } = await supabase
      .from("student_courses")
      .select("*", { head: true, count: "exact" })
      .eq("student_id", id);
    if (regError) throw regError;

    const { count: completedCount, error: compError } = await supabase
      .from("student_courses")
      .select("*", { head: true, count: "exact" })
      .eq("student_id", id)
      .gte("grade", 5);
    if (compError) throw compError;

    const { data: courseSections, error: semError } = await supabase
      .from("student_courses")
      .select("course_sections(academic_year, semester)")
      .eq("student_id", id);
    if (semError) throw semError;

    const latestSection = (courseSections || []).reduce((latest, current) => {
      if (!current.course_sections) return latest;
      if (!latest) return current;
      const [yearA] = (latest.course_sections.academic_year || "").split("-");
      const [yearB] = (current.course_sections.academic_year || "").split("-");
      const semA = parseInt(latest.course_sections.semester || "0", 10);
      const semB = parseInt(current.course_sections.semester || "0", 10);
      if (yearB > yearA) return current;
      if (yearB === yearA && semB > semA) return current;
      return latest;
    }, null);

    return {
      registeredCredits: registeredCount || 0,
      completedCredits: completedCount || 0,
      currentSemester:
        latestSection && latestSection.course_sections
          ? `Semester ${latestSection.course_sections.semester} (${latestSection.course_sections.academic_year})`
          : "-",
    };
  },
};

module.exports = StudentModel;
