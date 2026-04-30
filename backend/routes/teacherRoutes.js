const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const teacherController = require("../controllers/teacherController");

// Only teachers can access class count
router.get("/class-count", auth, authorize("Teacher"), teacherController.getClassCount);

// Workflow 2 Step 2: Decide Teaching Registration
router.post("/teaching-registrations/:registrationId/decide", auth, authorize("AcademicAffairs"), teacherController.decideTeachingRegistration);

// Workflow 4: Grade Entry
router.post("/enter-grade", auth, authorize("Teacher"), teacherController.enterGrade);

module.exports = router;
