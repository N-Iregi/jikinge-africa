// routes/modules.js
const express = require("express");
const { getDb } = require("../db/database");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const db = getDb();
  const modules = db.prepare(`
    SELECT m.*, (SELECT COUNT(*) FROM lessons WHERE module_id = m.id) AS lesson_count
    FROM modules m WHERE m.is_active = 1 ORDER BY m.id
  `).all();
  res.json(modules);
});

router.get("/:id", authenticate, (req, res) => {
  const db = getDb();
  const module = db.prepare("SELECT * FROM modules WHERE id = ? AND is_active = 1").get(req.params.id);
  if (!module) return res.status(404).json({ error: "Module not found." });
  const lessons   = db.prepare("SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index").all(req.params.id);
  const questions = db.prepare("SELECT id,question,options,answer,order_index FROM quiz_questions WHERE module_id = ? ORDER BY order_index").all(req.params.id)
    .map(q => ({ ...q, options: JSON.parse(q.options) }));
  res.json({ ...module, lessons, quiz: questions });
});

router.post("/", authenticate, requireAdmin, (req, res) => {
  const { title, tag, category, duration, difficulty, xp, description } = req.body;
  if (!title || !category) return res.status(400).json({ error: "Title and category are required." });
  const db = getDb();
  const r = db.prepare("INSERT INTO modules (title,tag,category,duration,difficulty,xp,description) VALUES (?,?,?,?,?,?,?)")
    .run(title, tag || "GENERAL", category, duration || "30 min", difficulty || "Beginner", xp || 100, description || "");
  res.status(201).json({ id: r.lastInsertRowid, message: "Module created." });
});

router.put("/:id", authenticate, requireAdmin, (req, res) => {
  const { title, tag, category, duration, difficulty, xp, description, is_active } = req.body;
  const db = getDb();
  db.prepare("UPDATE modules SET title=?,tag=?,category=?,duration=?,difficulty=?,xp=?,description=?,is_active=? WHERE id=?")
    .run(title, tag, category, duration, difficulty, xp, description, is_active ?? 1, req.params.id);
  res.json({ message: "Module updated." });
});

router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare("UPDATE modules SET is_active = 0 WHERE id = ?").run(req.params.id);
  res.json({ message: "Module deactivated." });
});

module.exports = router;
