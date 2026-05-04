const USER_TYPE_QUERY_MAP = {
  SinhVien: "Student",
  GiangVien: "Teacher",
  Student: "Student",
  Teacher: "Teacher",
  Admin: "Admin",
};

const VALID_DB_ROLES = ["Student", "Teacher", "Admin"];

function normalizeUserTypeQuery(type) {
  if (!type || typeof type !== "string") return null;
  const trimmed = type.trim();
  return USER_TYPE_QUERY_MAP[trimmed] || (VALID_DB_ROLES.includes(trimmed) ? trimmed : null);
}

function validateAdminUserType(req, res, next) {
  const raw = req.query.type;
  const normalized = normalizeUserTypeQuery(raw);
  if (!normalized) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid user role type. Use SinhVien, GiangVien, or English: Student, Teacher, Admin.",
      valid: VALID_DB_ROLES,
    });
  }
  req.query.type = normalized;
  next();
}

module.exports = {
  validateAdminUserType,
  normalizeUserTypeQuery,
  VALID_DB_ROLES,
};
