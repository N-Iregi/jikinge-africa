// routes/incidents.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../db/database");
const { authenticate, requireAdmin, requireAdminOrIRT } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const db = getDb();
  const reports = ["admin","irt"].includes(req.user.role)
    ? db.prepare("SELECT ir.*, u.name AS reporter_name FROM incident_reports ir JOIN users u ON u.id = ir.reporter_id ORDER BY ir.created_at DESC").all()
    : db.prepare("SELECT ir.*, u.name AS reporter_name FROM incident_reports ir JOIN users u ON u.id = ir.reporter_id WHERE ir.reporter_id = ? ORDER BY ir.created_at DESC").all(req.user.userId);
  res.json(reports);
});

router.get("/stats", authenticate, requireAdminOrIRT, (req, res) => {
  const db = getDb();
  res.json({
    total:     db.prepare("SELECT COUNT(*) as c FROM incident_reports").get().c,
    pending:   db.prepare("SELECT COUNT(*) as c FROM incident_reports WHERE status='Pending'").get().c,
    reviewing: db.prepare("SELECT COUNT(*) as c FROM incident_reports WHERE status='Under Review'").get().c,
    resolved:  db.prepare("SELECT COUNT(*) as c FROM incident_reports WHERE status='Resolved'").get().c,
    critical:  db.prepare("SELECT COUNT(*) as c FROM incident_reports WHERE severity='Critical'").get().c,
    byType:    db.prepare("SELECT type, COUNT(*) as count FROM incident_reports GROUP BY type ORDER BY count DESC").all(),
  });
});

router.post("/", authenticate, (req, res) => {
  const { type, description, severity, location } = req.body;
  if (!type || !description) return res.status(400).json({ error: "Type and description are required." });
  const db = getDb();
  const id = uuidv4();
  db.prepare("INSERT INTO incident_reports (id,reporter_id,type,description,severity,location) VALUES (?,?,?,?,?,?)")
    .run(id, req.user.userId, type, description, severity || "Medium", location || "Not specified");
  db.prepare("INSERT INTO audit_log (user_id,action,detail,ip_address) VALUES (?,?,?,?)")
    .run(req.user.userId, "INCIDENT_REPORT", `New ${severity} ${type} report`, req.ip);
  res.status(201).json({ id, message: "Incident report submitted successfully." });
});

router.patch("/:id/status", authenticate, requireAdminOrIRT, (req, res) => {
  const { status } = req.body;
  if (!["Pending","Under Review","Resolved"].includes(status)) return res.status(400).json({ error: "Invalid status." });
  const db = getDb();
  const r = db.prepare("UPDATE incident_reports SET status=?,updated_at=datetime('now'),reviewed_by=? WHERE id=?")
    .run(status, req.user.userId, req.params.id);
  if (!r.changes) return res.status(404).json({ error: "Report not found." });
  db.prepare("INSERT INTO audit_log (user_id,action,detail,ip_address) VALUES (?,?,?,?)")
    .run(req.user.userId, "INCIDENT_UPDATE", `Report ${req.params.id} → ${status}`, req.ip);
  res.json({ message: `Status updated to ${status}.` });
});

router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const r = db.prepare("DELETE FROM incident_reports WHERE id = ?").run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: "Report not found." });
  res.json({ message: "Report deleted." });
});

module.exports = router;
