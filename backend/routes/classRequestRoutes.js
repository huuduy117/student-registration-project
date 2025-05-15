const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const classRequestController = require("../controllers/classRequestController");

// Get all class requests
router.get("/", auth, classRequestController.getAllClassRequests);

// Create a new class request
router.post(
  "/",
  auth,
  authorize("SinhVien"),
  classRequestController.createClassRequest
);

// Join a class request
router.post(
  "/join",
  auth,
  authorize("SinhVien"),
  classRequestController.joinClassRequest
);

// Get participants for a class request
router.get(
  "/:maLopHP/participants",
  auth,
  classRequestController.getParticipants
);

// Get available courses for class requests
router.get(
  "/available-courses",
  auth,
  classRequestController.getAvailableCourses
);

// Approve a class request (GiaoVu, TruongBoMon, TruongKhoa)
router.patch(
  "/:maYeuCau/approve",
  auth,
  authorize("GiaoVu", "TruongBoMon", "TruongKhoa"),
  classRequestController.approveClassRequest
);

// Reject a class request (GiaoVu, TruongBoMon, TruongKhoa)
router.patch(
  "/:maYeuCau/reject",
  auth,
  authorize("GiaoVu", "TruongBoMon", "TruongKhoa"),
  classRequestController.rejectClassRequest
);

module.exports = router;
