const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const newsfeedController = require("../controllers/newsfeedController");

// Get all newsfeed items with filter options
router.get("/", (req, res, next) => {
  auth(req, res, () => newsfeedController.getNewsFeed(req, res, next));
});

// Get newsfeed item by ID
router.get("/:id", (req, res, next) => {
  auth(req, res, () => newsfeedController.getBangTinById(req, res, next));
});

// Create a new newsfeed item (admin/teacher only)
router.post("/", (req, res, next) => {
  auth(req, res, () => {
    authorize([
      "GiaoVu",
      "GiangVien",
      "TruongBoMon",
      "TruongKhoa",
      "QuanTriVien",
    ])(req, res, () => {
      newsfeedController.createBangTin(req, res, next);
    });
  });
});

// Update a newsfeed item
router.put("/:id", (req, res, next) => {
  auth(req, res, () => {
    authorize([
      "GiaoVu",
      "GiangVien",
      "TruongBoMon",
      "TruongKhoa",
      "QuanTriVien",
    ])(req, res, () => {
      newsfeedController.updateBangTin(req, res, next);
    });
  });
});

// Delete a newsfeed item
router.delete("/:id", (req, res, next) => {
  auth(req, res, () => {
    authorize([
      "GiaoVu",
      "GiangVien",
      "TruongBoMon",
      "TruongKhoa",
      "QuanTriVien",
    ])(req, res, () => {
      newsfeedController.deleteBangTin(req, res, next);
    });
  });
});

module.exports = router;
