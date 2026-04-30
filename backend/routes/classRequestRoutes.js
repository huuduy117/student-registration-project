const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const classRequestController = require("../controllers/classRequestController");

const APPROVERS = ["AcademicAffairs", "DepartmentHead", "FacultyHead"];

// Get all class requests
router.get("/", auth, classRequestController.getAllClassRequests);

// Get available courses for class requests
router.get("/available-courses", auth, classRequestController.getAvailableCourses);

// Get participants for a class section
router.get("/:sectionId/participants", auth, classRequestController.getParticipants);

// Workflow 1: Step 0 - Student submits request
router.post("/submit", auth, authorize("Student"), classRequestController.submitClassRequest);

// Workflow 1: Step 1 - Academic Affairs receives request
router.post("/:requestId/receive", auth, authorize("AcademicAffairs"), classRequestController.receiveClassRequest);

// Workflow 1: Step 2 - Dept Head reviews request
router.post("/:requestId/review", auth, authorize("DepartmentHead"), classRequestController.reviewClassRequest);

// Workflow 1: Step 3 - Faculty Head final approval
router.post("/:requestId/approve", auth, authorize("FacultyHead"), classRequestController.approveClassRequest);

// Workflow 1: Step 4 - Open course section
router.post("/:requestId/open-section", auth, authorize("AcademicAffairs"), classRequestController.openCourseSection);

// Join a class request (Legacy Frontend Compatibility)
router.post("/join", auth, authorize("Student"), classRequestController.joinClassRequest);

module.exports = router;
