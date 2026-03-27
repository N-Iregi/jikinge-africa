// routes/auth.js
const express   = require("express");
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../db/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const db = getDb();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const mfaSecret = speakeasy.generateSecret({ name: `JikingeAfrica (${email})` });
  const id = uuidv4();

  db.prepare("INSERT INTO users (id,name,email,password,mfa_secret) VALUES (?,?,?,?,?)")
    .run(id, name, email, bcrypt.hashSync(password, 12), mfaSecret.base32);

  db.prepare("INSERT INTO audit_log (user_id,action,detail,ip_address) VALUES (?,?,?,?)")
    .run(id, "REGISTER", `New user: ${email}`, req.ip);

  return res.status(201).json({ message: "Account created. Please sign in." });
});

// POST /api/auth/login  — step 1: verify password → return pre-auth token + TOTP code
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  const db  = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const preAuthToken = jwt.sign({ userId: user.id, stage: "pre-mfa" }, process.env.JWT_SECRET, { expiresIn: "5m" });
  const simulatedMfaCode = speakeasy.totp({ secret: user.mfa_secret, encoding: "base32" });

  return res.json({ preAuthToken, simulatedMfaCode, message: "Password verified. Complete MFA." });
});

// POST /api/auth/verify-mfa — step 2: verify TOTP → issue full JWT
router.post("/verify-mfa", (req, res) => {
  const { preAuthToken, mfaCode } = req.body;
  if (!preAuthToken || !mfaCode) return res.status(400).json({ error: "Pre-auth token and MFA code are required." });

  let decoded;
  try { decoded = jwt.verify(preAuthToken, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ error: "Pre-auth token is invalid or expired." }); }
  if (decoded.stage !== "pre-mfa") return res.status(401).json({ error: "Invalid token stage." });

  const db   = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const ok = speakeasy.totp.verify({ secret: user.mfa_secret, encoding: "base32", token: mfaCode, window: 1 });
  if (!ok) return res.status(401).json({ error: "Incorrect verification code. Please try again." });

  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
  db.prepare("INSERT INTO audit_log (user_id,action,detail,ip_address) VALUES (?,?,?,?)")
    .run(user.id, "LOGIN", `Login: ${user.email}`, req.ip);

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "14d" }
  );

  return res.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      level: user.level, points: user.points,
      initials: user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      joined: user.created_at.split(" ")[0]
    }
  });
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const db   = getDb();
  const user = db.prepare("SELECT id,name,email,role,level,points,created_at FROM users WHERE id = ?").get(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({
    ...user,
    initials: user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    joined: user.created_at.split(" ")[0]
  });
});

module.exports = router;
