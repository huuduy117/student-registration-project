const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const teacherScheduleController = require("../controllers/teacher_scheduleController");

// Get teacher schedule
router.get("/:teacherId", auth, teacherScheduleController.getTeacherSchedule);

// Get schedule by week
router.get("/:teacherId/week", auth, teacherScheduleController.getScheduleByWeek);

// Get available weeks
router.get("/:teacherId/available-weeks", auth, teacherScheduleController.getAvailableWeeks);

module.exports = router;
