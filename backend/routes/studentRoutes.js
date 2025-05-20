const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/", studentController.getAllStudents);

router.get("/:id", studentController.getStudent);

// API lấy tổng quan tín chỉ và học kỳ hiện tại
router.get("/:id/overview", studentController.getStudentOverview);

module.exports = router;
