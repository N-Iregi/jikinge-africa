// routes/progress.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../db/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const db = getDb();
  const progress = db.prepare(`
    SELECT up.*, m.title, m.tag, m.xp as module_xp
    FROM user_progress up JOIN modules m ON m.id = up.module_id
    WHERE up.user_id = ?
  `).all(req.user.userId).map(p => ({ ...p, completed_lessons: JSON.parse(p.completed_lessons) }));

  res.json({
    progress,
    totalXP: progress.reduce((s, p) => s + (p.xp_earned || 0), 0),
    completedCount: progress.filter(p => p.completed).length
  });
});

router.post("/:moduleId", authenticate, (req, res) => {
  const { completed, quiz_score, xp_earned, completed_lessons } = req.body;
  const db = getDb();
  const existing = db.prepare("SELECT id FROM user_progress WHERE user_id = ? AND module_id = ?").get(req.user.userId, req.params.moduleId);

  if (existing) {
    db.prepare(`UPDATE user_progress SET completed=?,quiz_score=?,xp_earned=?,completed_lessons=?,
      completed_at=CASE WHEN ?=1 THEN datetime('now') ELSE completed_at END WHERE user_id=? AND module_id=?`)
      .run(completed?1:0, quiz_score??null, xp_earned??0, JSON.stringify(completed_lessons||[]),
           completed?1:0, req.user.userId, req.params.moduleId);
  } else {
    db.prepare("INSERT INTO user_progress (id,user_id,module_id,completed,quiz_score,xp_earned,completed_lessons,completed_at) VALUES (?,?,?,?,?,?,?,?)")
      .run(uuidv4(), req.user.userId, req.params.moduleId, completed?1:0, quiz_score??null,
           xp_earned??0, JSON.stringify(completed_lessons||[]), completed ? new Date().toISOString().replace("T"," ").split(".")[0] : null);
  }

  if (xp_earned) db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(xp_earned, req.user.userId);

  const { points } = db.prepare("SELECT points FROM users WHERE id = ?").get(req.user.userId);
  const level = points >= 1000 ? "Expert" : points >= 500 ? "Advanced" : points >= 200 ? "Intermediate" : "Beginner";
  db.prepare("UPDATE users SET level = ? WHERE id = ?").run(level, req.user.userId);

  res.json({ message: "Progress saved." });
});

module.exports = router;
