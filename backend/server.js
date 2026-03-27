// server.js — Jikinge Africa Backend API
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const { initDb } = require("./db/database");

initDb();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()}  ${req.method}  ${req.path}`);
    next();
  });
}

app.use("/api/auth",      require("./routes/auth"));
app.use("/api/modules",   require("./routes/modules"));
app.use("/api/progress",  require("./routes/progress"));
app.use("/api/incidents", require("./routes/incidents"));
app.use("/api/admin",     require("./routes/admin"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Jikinge Africa API", version: "1.0.0", time: new Date().toISOString() });
});

app.use((_req, res) => res.status(404).json({ error: "Endpoint not found." }));

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🛡️  Jikinge Africa API running on http://localhost:${PORT}`);
  console.log(`📋  Health: http://localhost:${PORT}/api/health\n`);
});
