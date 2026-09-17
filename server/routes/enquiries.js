import { Router } from "express";
import rateLimit from "express-rate-limit";
import db, { getNotes, logEvent, nextSequence, toEnquiry } from "../db.js";
import { requireAuth, requireEnquiryAccess } from "../middleware.js";
import { STATUSES, TRANSITIONS, canTransition } from "../pipeline.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public submission: strict rate limit, full validation. No auth required.
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post("/public/enquiries", publicLimiter, (req, res) => {
  const b = req.body || {};
  const company = String(b.company || "").trim().slice(0, 200);
  const contact = String(b.contact || "").trim().slice(0, 200);
  const email = String(b.email || "").trim().slice(0, 200);
  if (!company || !contact || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "company, contact and valid email are required" });
  }
  const industryId = String(b.industryId || "other").slice(0, 40);
  const employeeCount = Math.max(0, parseInt(b.employeeCount, 10) || 0);
  const software = Array.isArray(b.currentSoftware) ? b.currentSoftware.map(String).slice(0, 20) : [];
  const now = new Date().toISOString();
  const num = nextSequence("enquiry_seq");
  const id = `JPN-2026-${String(num).padStart(5, "0")}`;
  db.prepare(`INSERT INTO enquiries(id, company_ja, company_en, contact_ja, contact_en, email, phone,
    industry_id, employee_count, current_software, problem_ja, problem_en, automation_ja, automation_en,
    message, status, created_at, updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, company, company, contact, contact, email, String(b.phone || "").slice(0, 60),
    industryId, employeeCount, JSON.stringify(software),
    String(b.problem || "").slice(0, 4000), String(b.problem || "").slice(0, 4000),
    String(b.automation || "").slice(0, 4000), String(b.automation || "").slice(0, 4000),
    String(b.message || "").slice(0, 8000), "new", now, now
  );
  db.prepare(`INSERT INTO notifications(id, enquiry_id, title_ja, title_en, body_ja, body_en, read, created_at)
    VALUES(?,?,?,?,?,?,0,?)`).run(
    `NOTIF-${id}`, id,
    "新規 Japan Pilot 問い合わせ", "New Japan Pilot Enquiry",
    `${company}（${contact}）から問い合わせがありました。`,
    `Enquiry submitted by ${company} (${contact}).`, now
  );
  logEvent(id, "public", "submitted", null, "new");
  res.status(201).json({ id });
});

// ---- admin (owner/admin only) ----
router.use(requireAuth, requireEnquiryAccess);

function sizeClause(size) {
  if (size === "s1") return "employee_count <= 20";
  if (size === "s2") return "employee_count BETWEEN 21 AND 50";
  if (size === "s3") return "employee_count BETWEEN 51 AND 100";
  if (size === "s4") return "employee_count > 100";
  return null;
}

router.get("/enquiries/stats", (req, res) => {
  const rows = db.prepare("SELECT status, COUNT(*) AS c FROM enquiries WHERE archived = 0 GROUP BY status").all();
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  let total = 0;
  for (const r of rows) { byStatus[r.status] = r.c; total += r.c; }
  res.json({ total, byStatus });
});

router.get("/enquiries", (req, res) => {
  const { q = "", status = "all", industry = "all", size = "all", assigned = "all", sort = "new", archived = "0" } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const where = ["archived = ?"];
  const params = [archived === "1" ? 1 : 0];
  const needle = String(q).trim().toLowerCase();
  if (needle) {
    where.push("(lower(id) LIKE ? OR lower(company_ja) LIKE ? OR lower(company_en) LIKE ? OR lower(contact_ja) LIKE ? OR lower(contact_en) LIKE ? OR lower(email) LIKE ?)");
    params.push(...Array(6).fill(`%${needle}%`));
  }
  if (STATUSES.includes(String(status))) { where.push("status = ?"); params.push(status); }
  if (industry !== "all") { where.push("industry_id = ?"); params.push(String(industry)); }
  const sc = sizeClause(String(size));
  if (sc) where.push(sc);
  if (assigned === "none") where.push("assigned_to IS NULL");
  else if (assigned !== "all") { where.push("assigned_to = ?"); params.push(String(assigned)); }
  const order = sort === "old" ? "created_at ASC" : sort === "upd" ? "updated_at DESC" : "created_at DESC";
  const sql = `FROM enquiries WHERE ${where.join(" AND ")}`;
  const total = db.prepare(`SELECT COUNT(*) AS c ${sql}`).get(...params).c;
  const rows = db.prepare(`SELECT * ${sql} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params, limit, (page - 1) * limit);
  res.json({
    rows: rows.map((r) => toEnquiry(r, getNotes(r.id))),
    total, page, pages: Math.max(1, Math.ceil(total / limit)),
  });
});

router.get("/enquiries/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM enquiries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  res.json(toEnquiry(row, getNotes(row.id)));
});

router.patch("/enquiries/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM enquiries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  const b = req.body || {};
  const sets = [];
  const params = [];
  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status)) return res.status(400).json({ error: "unknown status", allowed: STATUSES });
    if (!canTransition(row.status, b.status)) {
      return res.status(422).json({ error: "invalid transition", from: row.status, allowed: TRANSITIONS[row.status] });
    }
    sets.push("status = ?"); params.push(b.status);
    logEvent(row.id, String(req.user.id), "status_change", row.status, b.status);
  }
  if (b.assignedTo !== undefined) {
    sets.push("assigned_to = ?"); params.push(b.assignedTo || null);
    logEvent(row.id, String(req.user.id), "assigned", null, null, { assignedTo: b.assignedTo || null });
  }
  if (b.demoDate !== undefined) {
    const d = b.demoDate ? new Date(b.demoDate).toISOString() : null;
    if (b.demoDate && Number.isNaN(Date.parse(b.demoDate))) return res.status(400).json({ error: "invalid demoDate" });
    sets.push("demo_date = ?"); params.push(d);
    logEvent(row.id, String(req.user.id), "demo_scheduled", null, null, { demoDate: d });
  }
  if (b.archived !== undefined) {
    sets.push("archived = ?"); params.push(b.archived ? 1 : 0);
    logEvent(row.id, String(req.user.id), b.archived ? "archived" : "unarchived");
  }
  if (sets.length === 0) return res.status(400).json({ error: "nothing to update" });
  sets.push("updated_at = ?"); params.push(new Date().toISOString());
  db.prepare(`UPDATE enquiries SET ${sets.join(", ")} WHERE id = ?`).run(...params, row.id);
  const updated = db.prepare("SELECT * FROM enquiries WHERE id = ?").get(row.id);
  res.json(toEnquiry(updated, getNotes(row.id)));
});

// Enquiry → Pilot conversion (atomic: status + pilot record id)
router.post("/enquiries/:id/convert", (req, res) => {
  const row = db.prepare("SELECT * FROM enquiries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  if (row.status !== "demo" && row.status !== "pilot" && row.status !== "contacted") {
    return res.status(422).json({ error: "convert requires contacted/demo/pilot stage", from: row.status });
  }
  if (row.pilotId) return res.status(409).json({ error: "already converted", pilotId: row.pilot_id });
  const seq = nextSequence("pilot_seq");
  const pilotId = `PLT-2026-${String(seq).padStart(3, "0")}`;
  const now = new Date().toISOString();
  db.prepare("UPDATE enquiries SET status = 'pilot', pilot_id = ?, updated_at = ? WHERE id = ?").run(pilotId, now, row.id);
  logEvent(row.id, String(req.user.id), "converted_to_pilot", row.status, "pilot", { pilotId });
  const updated = db.prepare("SELECT * FROM enquiries WHERE id = ?").get(row.id);
  res.json(toEnquiry(updated, getNotes(row.id)));
});

router.post("/enquiries/:id/notes", (req, res) => {
  const row = db.prepare("SELECT * FROM enquiries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  const text = String(req.body?.text || "").trim().slice(0, 4000);
  if (!text) return res.status(400).json({ error: "text required" });
  db.prepare("INSERT INTO enquiry_notes(enquiry_id, author_id, text, created_at) VALUES(?,?,?,?)")
    .run(row.id, String(req.user.id), text, new Date().toISOString());
  db.prepare("UPDATE enquiries SET updated_at = ? WHERE id = ?").run(new Date().toISOString(), row.id);
  logEvent(row.id, String(req.user.id), "note_added");
  const updated = db.prepare("SELECT * FROM enquiries WHERE id = ?").get(row.id);
  res.status(201).json(toEnquiry(updated, getNotes(row.id)));
});

router.get("/enquiries/:id/events", (req, res) => {
  const rows = db.prepare("SELECT * FROM enquiry_events WHERE enquiry_id = ? ORDER BY created_at ASC").all(req.params.id);
  res.json(rows);
});

export default router;
