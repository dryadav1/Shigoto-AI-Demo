/**
 * SQLite database (Node built-in `node:sqlite`, WAL mode).
 * File: server/data/shigoto.db (override with DB_DIR).
 */
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DB_DIR || path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "shigoto.db"));
db.exec(`PRAGMA journal_mode = WAL;`);
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  company_ja TEXT NOT NULL, company_en TEXT NOT NULL,
  contact_ja TEXT NOT NULL, contact_en TEXT NOT NULL,
  email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '',
  industry_id TEXT NOT NULL DEFAULT 'other',
  employee_count INTEGER NOT NULL DEFAULT 0,
  current_software TEXT NOT NULL DEFAULT '[]',
  problem_ja TEXT NOT NULL DEFAULT '', problem_en TEXT NOT NULL DEFAULT '',
  automation_ja TEXT NOT NULL DEFAULT '', automation_en TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to TEXT,
  demo_date TEXT,
  pilot_id TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiry_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL,
  title_ja TEXT NOT NULL, title_en TEXT NOT NULL,
  body_ja TEXT NOT NULL, body_en TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiry_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enquiry_id TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  from_status TEXT, to_status TEXT,
  meta TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_enq_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enq_created ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_enq_archived ON enquiries(archived);
`);

export function nextSequence(name, startAt = 1) {
  // atomic increment inside a transaction
  const tx = db.prepare("SELECT value FROM counters WHERE name = ?").get(name);
  const next = tx ? tx.value + 1 : startAt;
  db.prepare("INSERT INTO counters(name, value) VALUES(?, ?) ON CONFLICT(name) DO UPDATE SET value = excluded.value").run(name, next);
  return next;
}

/** Map a DB row to the API enquiry shape (camelCase, mirrors frontend model). */
export function toEnquiry(row, notes = []) {
  if (!row) return null;
  return {
    id: row.id,
    companyJa: row.company_ja, companyEn: row.company_en,
    contactJa: row.contact_ja, contactEn: row.contact_en,
    email: row.email, phone: row.phone,
    industryId: row.industry_id, employeeCount: row.employee_count,
    currentSoftware: JSON.parse(row.current_software || "[]"),
    problemJa: row.problem_ja, problemEn: row.problem_en,
    automationJa: row.automation_ja, automationEn: row.automation_en,
    message: row.message,
    status: row.status,
    assignedTo: row.assigned_to || null,
    demoDate: row.demo_date || null,
    pilotId: row.pilot_id || null,
    internalNotes: notes.map((n) => ({
      id: String(n.id), authorId: n.author_id, text: n.text, createdAt: n.created_at,
    })),
    archived: !!row.archived,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function logEvent(enquiryId, actorId, action, fromStatus = null, toStatus = null, meta = null) {
  db.prepare(
    "INSERT INTO enquiry_events(enquiry_id, actor_id, action, from_status, to_status, meta, created_at) VALUES(?,?,?,?,?,?,?)"
  ).run(enquiryId, actorId, action, fromStatus, toStatus, meta ? JSON.stringify(meta) : null, new Date().toISOString());
}

export function getNotes(enquiryId) {
  return db.prepare("SELECT * FROM enquiry_notes WHERE enquiry_id = ? ORDER BY created_at ASC").all(enquiryId);
}

export default db;
