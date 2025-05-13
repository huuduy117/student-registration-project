const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const scheduleController = require("../controllers/scheduleController")

// Get student schedule
router.get("/:maSV", auth, scheduleController.getStudentSchedule)

// Get schedule by week
router.get("/:maSV/week", auth, scheduleController.getScheduleByWeek)

// Get available weeks for the current semester
router.get("/:maSV/available-weeks", auth, scheduleController.getAvailableWeeks)

module.exports = router
