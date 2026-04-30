const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/adminUserController");
const { auth, authorize } = require("../middleware/auth");
const { supabase } = require("../config/db");

// Admin-only middleware
const adminAuth = [auth, authorize("Admin")];

const VALID_ROLES = ["Student", "Teacher", "Admin"];

// ─── User Management ─────────────────────────────────────────────────────────

// Add new user
router.post("/add-user", adminAuth, async (req, res) => {
  const { userData } = req.body;
  try {
    const result = await createUserWithDetail(userData);
    res.json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Get users by role type
router.get("/users", adminAuth, async (req, res) => {
  const { type } = req.query;

  if (!type || !VALID_ROLES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user role type. Valid roles: " + VALID_ROLES.join(", "),
    });
  }

  try {
    const results = await getUsersByType(type);
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// Get user by ID
router.get("/users/:id", adminAuth, async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await getUserById(userId);
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
});

// Update user
router.put("/users/:id", adminAuth, async (req, res) => {
  const userId = req.params.id;
  const { userData } = req.body;
  try {
    const result = await updateUser(userId, userData);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Error updating user",
      error: err,
    });
  }
});

// Delete user
router.delete("/users/:id", adminAuth, async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await deleteUser(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Error deleting user",
      error: err,
    });
  }
});

// ─── Statistics ───────────────────────────────────────────────────────────────

// Student statistics
router.get("/stats/students", adminAuth, async (req, res) => {
  try {
    const results = await getStudentStats();
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching student statistics" });
  }
});

// Teacher statistics
router.get("/stats/teachers", adminAuth, async (req, res) => {
  try {
    const results = await getTeacherStats();
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching teacher statistics" });
  }
});

// ─── Class Requests ───────────────────────────────────────────────────────────

// Get all class requests
router.get("/class-requests", adminAuth, async (req, res) => {
  try {
    const results = await getClassRequests();
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching class requests" });
  }
});

// Update class request status
router.put("/class-requests/:id/status", adminAuth, async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  try {
    await updateClassRequestStatus(requestId, status);
    res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating request status" });
  }
});

// Get request change history
router.get("/class-requests/:id/history", adminAuth, async (req, res) => {
  const requestId = req.params.id;

  try {
    const results = await getRequestHistory(requestId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching request history" });
  }
});

// ─── News (Admin Newsfeed) ────────────────────────────────────────────────────

// Get all news
router.get("/newsfeed", adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("id, title, content, posted_at, posted_by, audience, users(role, username, students(full_name), teachers(full_name))")
      .order("posted_at", { ascending: false });

    if (error) throw error;

    const results = data.map((n) => {
      let postedByName = n.users?.username;
      if (n.users?.role === "Student") {
        postedByName = n.users.students?.full_name || postedByName;
      } else if (n.users?.role) {
        postedByName = n.users.teachers?.full_name || postedByName;
      }
      return {
        id: n.id,
        title: n.title,
        content: n.content,
        postedAt: n.posted_at,
        postedBy: n.posted_by,
        audience: n.audience,
        postedByName,
      };
    });

    res.json(results);
  } catch (err) {
    console.error("Error fetching newsfeed:", err);
    res.status(500).json({ success: false, message: "Error fetching news" });
  }
});

// Create news
router.post("/newsfeed", adminAuth, async (req, res) => {
  const { title, content, recipient } = req.body;
  const postedBy = req.user.userId;
  const postedAt = new Date().toISOString().split("T")[0];
  const newsId = `NEWS${Date.now().toString().slice(-6)}`;

  // Map recipient to audience enum
  let audience = "All";
  if (recipient === "Student") audience = "Student";
  else if (recipient === "Teacher") audience = "Teacher";

  try {
    const { error } = await supabase.from("news").insert({
      id: newsId,
      title,
      content,
      posted_at: postedAt,
      posted_by: postedBy,
      audience,
    });

    if (error) throw error;

    res.status(201).json({ success: true, message: "News created successfully", newsId });
  } catch (err) {
    console.error("Error creating news:", err);
    res.status(500).json({ success: false, message: "Error creating news" });
  }
});

// Update news
router.put("/newsfeed/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { title, content, recipient } = req.body;

  let audience = "All";
  if (recipient === "Student") audience = "Student";
  else if (recipient === "Teacher") audience = "Teacher";

  try {
    const { data, error } = await supabase
      .from("news")
      .update({ title, content, audience })
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "News item not found" });
    }

    res.json({ success: true, message: "News updated successfully" });
  } catch (err) {
    console.error("Error updating news:", err);
    res.status(500).json({ success: false, message: "Error updating news" });
  }
});

// Delete news
router.delete("/newsfeed/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase.from("news").delete().eq("id", id).select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "News item not found" });
    }

    res.json({ success: true, message: "News deleted successfully" });
  } catch (err) {
    console.error("Error deleting news:", err);
    res.status(500).json({ success: false, message: "Error deleting news" });
  }
});

module.exports = router;
