const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const adminOnly = [auth, authorize("Admin")];

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Placeholder — extend as needed
router.get("/dashboard/stats", ...adminOnly, (req, res) => {
  res.json({ message: "Dashboard stats endpoint — not yet implemented" });
});

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get("/settings", ...adminOnly, (req, res) => {
  res.json({ message: "Settings endpoint — not yet implemented" });
});

router.put("/settings", ...adminOnly, (req, res) => {
  res.json({ message: "Settings update endpoint — not yet implemented" });
});

module.exports = router;
