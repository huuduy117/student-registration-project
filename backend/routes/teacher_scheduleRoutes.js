const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const teacherScheduleController = require("../controllers/teacher_scheduleController")

// Get teacher schedule
router.get("/:maGV", auth, teacherScheduleController.getTeacherSchedule)

// Get schedule by week
router.get("/:maGV/week", auth, teacherScheduleController.getScheduleByWeek)

// Get available weeks for the current semester
router.get("/:maGV/available-weeks", auth, teacherScheduleController.getAvailableWeeks)

module.exports = router
