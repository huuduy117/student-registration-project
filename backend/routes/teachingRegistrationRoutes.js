const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const teacherController = require("../controllers/teacherController");

// Get available class sections
router.get(
  "/class-sections/available",
  auth,
  teacherController.getAvailableClassSections
);

// Get approved class sections
router.get(
  "/class-sections/approved",
  auth,
  teacherController.getApprovedClassSections
);

// Create new class sections for approved requests
router.post(
  "/class-sections/create-new",
  auth,
  teacherController.createNewClassSections
);

// Register to teach a class
router.post("/register-teaching", auth, teacherController.registerTeaching);

module.exports = router;
