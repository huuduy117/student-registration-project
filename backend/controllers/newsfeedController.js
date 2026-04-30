const { supabase } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const generateId = (prefix) => `${prefix}_${Date.now()}`;

// ─── WORKFLOW 5: NEWS & ANNOUNCEMENTS ──────────────────────────────────────

exports.postNews = async (req, res) => {
  const { title, content, audience } = req.body;
  const actorId = req.user.userId;
  const role = req.user.userRole;

  try {
    if (!["Admin", "AcademicAffairs", "DepartmentHead", "FacultyHead"].includes(role)) {
      return sendError(res, 403, "UNAUTHORIZED", "Only administrative roles can post news");
    }

    if (!["Student", "Teacher", "All"].includes(audience)) {
      return sendError(res, 400, "INVALID_INPUT", "Audience must be Student, Teacher, or All");
    }

    const newsId = generateId("NEWS");

    const { error } = await supabase.from("news").insert({
      id: newsId,
      title,
      content,
      posted_at: new Date().toISOString().split("T")[0],
      posted_by: actorId,
      audience
    });

    if (error) throw error;

    const { data: newNews } = await supabase.from("news").select("*").eq("id", newsId).single();
    return sendSuccess(res, "post_news", newNews, ["news"]);
  } catch (err) {
    console.error("Error posting news:", err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error posting news");
  }
};

exports.getNewsFeed = async (req, res) => {
  const role = req.user.userRole;

  try {
    let query = supabase
      .from("news")
      .select(`
        id, title, content, posted_at, audience,
        users!news_posted_by_fkey(id, username, role)
      `)
      .order("posted_at", { ascending: false });

    // Apply audience retrieval rules
    if (role === "Student") {
      query = query.in("audience", ["Student", "All"]);
    } else if (["Teacher", "DepartmentHead", "FacultyHead"].includes(role)) {
      query = query.in("audience", ["Teacher", "All"]);
    }
    // Admin & AcademicAffairs get all news

    const { data, error } = await query;
    if (error) throw error;

    return sendSuccess(res, "get_news_feed", data);
  } catch (err) {
    console.error("Error fetching news:", err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error fetching news");
  }
};

// Legacy support for frontend compatibility
exports.getNewsById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
    if (error) throw error;
    if (!data) return sendError(res, 404, "NOT_FOUND", "News item not found");
    return sendSuccess(res, "get_news_by_id", data);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error fetching news item");
  }
};

exports.deleteNews = async (req, res) => {
  const { id } = req.params;
  const role = req.user.userRole;
  try {
    if (!["Admin", "AcademicAffairs", "DepartmentHead", "FacultyHead"].includes(role)) {
      return sendError(res, 403, "UNAUTHORIZED", "Not authorized to delete news");
    }
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) throw error;
    return sendSuccess(res, "delete_news", null, ["news"]);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error deleting news item");
  }
};

exports.updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content, audience } = req.body;
  const role = req.user.userRole;
  try {
    if (!["Admin", "AcademicAffairs", "DepartmentHead", "FacultyHead"].includes(role)) {
      return sendError(res, 403, "UNAUTHORIZED", "Not authorized to update news");
    }
    const { error } = await supabase.from("news").update({ title, content, audience }).eq("id", id);
    if (error) throw error;
    return sendSuccess(res, "update_news", null, ["news"]);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "INTERNAL_ERROR", "Error updating news item");
  }
};
