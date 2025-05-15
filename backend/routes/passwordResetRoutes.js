const express = require("express")
const router = express.Router()
const passwordResetController = require("../controllers/passwordResetController")

// Request password reset
router.post("/request", passwordResetController.requestReset)

// Verify reset token
router.get("/verify/:token", passwordResetController.verifyToken)

// Reset password
router.post("/reset", passwordResetController.resetPassword)

module.exports = router
