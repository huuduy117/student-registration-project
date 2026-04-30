const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const scheduleController = require("../controllers/scheduleController");

// Get student schedule
router.get("/:studentId", auth, scheduleController.getStudentSchedule);

// Get schedule by week
router.get("/:studentId/week", auth, scheduleController.getScheduleByWeek);

// Get available weeks
router.get("/:studentId/available-weeks", auth, scheduleController.getAvailableWeeks);

module.exports = router;
