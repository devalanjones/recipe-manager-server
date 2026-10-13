let jwt = require("jsonwebtoken");

// 1. Verify Authentication (Existing, cleaned up)
let tokenValidation = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    let decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded contains { id, role, ... } from your login controller
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 2. Authorize Admin Access
let isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied: Admins only",
  });
};

module.exports = { tokenValidation, isAdmin };