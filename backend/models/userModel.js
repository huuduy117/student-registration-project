const { supabase } = require("../config/db");

const findUserByUsername = async (username) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, password, role")
      .eq("username", username)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    if (!data) return null;

    // Fetch display name from students or teachers table depending on role
    let fullName = data.username;
    if (data.role === "Student") {
      const { data: student } = await supabase
        .from("students")
        .select("full_name")
        .eq("id", data.id)
        .single();
      if (student) fullName = student.full_name;
    } else if (["Teacher", "AcademicAffairs", "DepartmentHead", "FacultyHead"].includes(data.role)) {
      const { data: teacher } = await supabase
        .from("teachers")
        .select("full_name")
        .eq("id", data.id)
        .single();
      if (teacher) fullName = teacher.full_name;
    }

    return {
      id: data.id,
      username: data.username,
      password: data.password,
      role: data.role,
      fullName,
    };
  } catch (error) {
    console.error("Error finding user by username:", error);
    throw error;
  }
};

module.exports = { findUserByUsername };
