const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const { auth, authorize } = require("../middleware/auth")

// Dashboard routes
router.get("/dashboard/stats", auth, authorize("QuanTriVien"), adminController.getDashboardStats)

// User management routes
router.get("/users", auth, authorize("QuanTriVien"), adminController.getAllUsers)
router.get("/users/:id", auth, authorize("QuanTriVien"), adminController.getUserById)
router.post("/users", auth, authorize("QuanTriVien"), adminController.createUser)
router.put("/users/:id", auth, authorize("QuanTriVien"), adminController.updateUser)
router.delete("/users/:id", auth, authorize("QuanTriVien"), adminController.deleteUser)

// Newsfeed management routes
router.get("/newsfeed", auth, authorize("QuanTriVien"), adminController.getAllNewsfeed)
router.post("/newsfeed", auth, authorize("QuanTriVien"), adminController.createNewsfeed)
router.put("/newsfeed/:id", auth, authorize("QuanTriVien"), adminController.updateNewsfeed)
router.delete("/newsfeed/:id", auth, authorize("QuanTriVien"), adminController.deleteNewsfeed)

// Settings routes
router.get("/settings", auth, authorize("QuanTriVien"), adminController.getSettings)
router.put("/settings", auth, authorize("QuanTriVien"), adminController.updateSettings)
router.post("/settings/backup", auth, authorize("QuanTriVien"), adminController.createBackup)
router.post("/settings/clear-cache", auth, authorize("QuanTriVien"), adminController.clearCache)

// System notifications
router.get("/notifications", auth, authorize("QuanTriVien"), adminController.getSystemNotifications)
router.post("/notifications", auth, authorize("QuanTriVien"), adminController.createSystemNotification)
router.delete("/notifications/:id", auth, authorize("QuanTriVien"), adminController.deleteSystemNotification)

module.exports = router
