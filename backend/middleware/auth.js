const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No authentication token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userRole)) {
      return res.status(403).json({
        message: "You do not have permission to access this feature",
        userRole: req.user.userRole,
        requiredRoles: roles,
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
