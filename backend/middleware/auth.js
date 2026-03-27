// middleware/auth.js
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  next();
}

function requireAdminOrIRT(req, res, next) {
  if (!["admin", "irt"].includes(req.user?.role)) return res.status(403).json({ error: "Insufficient permissions." });
  next();
}

module.exports = { authenticate, requireAdmin, requireAdminOrIRT };
