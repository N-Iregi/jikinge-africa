// routes/admin.js
const express = require("express");
const { getDb } = require("../db/database");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/users", authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  res.json(db.prepare("SELECT id,name,email,role,level,points,created_at,last_login FROM users ORDER BY created_at DESC").all());
});

router.patch("/users/:id/role", authenticate, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!["user","admin","irt"].includes(role)) return res.status(400).json({ error: "Invalid role." });
  const db = getDb();
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
  res.json({ message: "Role updated." });
});

router.get("/analytics", authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  res.json({
    users: {
      total:     db.prepare("SELECT COUNT(*) as c FROM users WHERE role='user'").get().c,
      active_7d: db.prepare("SELECT COUNT(*) as c FROM users WHERE last_login >= datetime('now','-7 days')").get().c,
      by_level:  db.prepare("SELECT level, COUNT(*) as count FROM users GROUP BY level").all(),
    },
    learning: {
      total_completions: db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE completed=1").get().c,
      avg_quiz_score:    db.prepare("SELECT ROUND(AVG(quiz_score),1) as avg FROM user_progress WHERE quiz_score IS NOT NULL").get().avg,
      by_module:         db.prepare("SELECT m.title, COUNT(up.id) as completions, ROUND(AVG(up.quiz_score),1) as avg_score FROM modules m LEFT JOIN user_progress up ON up.module_id = m.id AND up.completed=1 GROUP BY m.id ORDER BY completions DESC").all(),
    },
    incidents: {
      total:    db.prepare("SELECT COUNT(*) as c FROM incident_reports").get().c,
      pending:  db.prepare("SELECT COUNT(*) as c FROM incident_reports WHERE status='Pending'").get().c,
      resolved: db.prepare("SELECT COUNT(*) as c FROM incident_reports WHERE status='Resolved'").get().c,
      by_type:  db.prepare("SELECT type, COUNT(*) as count FROM incident_reports GROUP BY type ORDER BY count DESC").all(),
    },
  });
});

router.get("/audit-log", authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  res.json(db.prepare(`
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM audit_log al LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC LIMIT 100
  `).all());
});

module.exports = router;
