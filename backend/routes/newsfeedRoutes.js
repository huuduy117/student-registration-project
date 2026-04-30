const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const newsfeedController = require("../controllers/newsfeedController");

const STAFF_ROLES = ["AcademicAffairs", "Teacher", "DepartmentHead", "FacultyHead", "Admin"];

// Workflow 5: News & Announcements

// Get all newsfeed items (audience filtered inside controller)
router.get("/", auth, newsfeedController.getNewsFeed);

// Get newsfeed item by ID
router.get("/:id", auth, newsfeedController.getNewsById);

// Create a new news item (staff only)
router.post("/", auth, authorize(...STAFF_ROLES), newsfeedController.postNews);

// Update a news item
router.put("/:id", auth, authorize(...STAFF_ROLES), newsfeedController.updateNews);

// Delete a news item
router.delete("/:id", auth, authorize(...STAFF_ROLES), newsfeedController.deleteNews);

module.exports = router;
