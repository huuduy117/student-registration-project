const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("User role:", req.user.userRole);
    console.log("Allowed roles:", roles);
    if (!roles.includes(req.user.userRole)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập chức năng này",
        userRole: req.user.userRole,
        requiredRoles: roles,
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
