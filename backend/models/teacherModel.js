const { supabase } = require("../config/db");

const TeacherModel = {
  getTeachingClassCount: async (teacherId) => {
    try {
      const { count, error } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("advisor_id", teacherId);
      if (error) throw error;
      return { classCount: count || 0 };
    } catch (error) {
      console.error("Error fetching teaching class count:", error);
      throw error;
    }
  },
};

module.exports = TeacherModel;
