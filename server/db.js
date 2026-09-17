/**
 * Unified database layer.
 * - Local/dev (no DATABASE_URL): SQLite file via Node built-in `node:sqlite`.
 * - Production on Vercel: Postgres via DATABASE_URL (e.g. Neon).
 *
 * Both backends expose the same `prepare(sql)` interface (`?` placeholders),
 * so routes and seed code are backend-agnostic. All methods are async.
 */
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

export const isPostgres = !!process.env.DATABASE_URL;

const TABLES_SQLITE = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'employee',
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
  assigned_to TEXT, demo_date TEXT, pilot_id TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiry_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL, text TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, enquiry_id TEXT NOT NULL,
  title_ja TEXT NOT NULL, title_en TEXT NOT NULL,
  body_ja TEXT NOT NULL, body_en TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiry_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enquiry_id TEXT NOT NULL, actor_id TEXT, action TEXT NOT NULL,
  from_status TEXT, to_status TEXT, meta TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS idx_enq_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enq_created ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_enq_archived ON enquiries(archived);
`;

// Postgres DDL: SERIAL instead of AUTOINCREMENT; IF NOT EXISTS is supported.
const TABLES_PG = TABLES_SQLITE
  .replaceAll("id INTEGER PRIMARY KEY AUTOINCREMENT", "id SERIAL PRIMARY KEY");

let sqliteDb = null;
let pgPool = null; // real pg.Pool or injected executor (tests)
let schemaPromise = null;

/** Test hook: inject a custom query executor (e.g. PGlite) instead of pg.Pool. */
export function __setQueryExecutor(fn) {
  pgPool = { query: fn };
}

function getPool() {
  if (!pgPool) {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PG_SSL === "false" ? false : { rejectUnauthorized: false },
    });
    // Prevent idle-client errors from throwing as uncaught exceptions.
    pool.on("error", () => {});
    pgPool = pool;
  }
  return pgPool;
}

async function runDdl(ddl) {
  // Statement-by-statement: portable across pg, PGlite and SQLite.
  const statements = ddl.split(";").map((s) => s.trim()).filter(Boolean);
  if (isPostgres) {
    const pool = getPool();
    for (const s of statements) await pool.query(s);
  } else {
    for (const s of statements) sqliteDb.exec(s);
  }
}

/** Idempotent schema init (safe under serverless cold-start races). Retries after failure. */
export function initSchema() {
  if (!schemaPromise) {
    schemaPromise = runInit().catch((err) => { schemaPromise = null; throw err; });
  }
  return schemaPromise;
}
async function runInit() {
  if (isPostgres) {
    await runDdl(TABLES_PG);
  } else {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dataDir = process.env.DB_DIR || path.join(__dirname, "data");
    fs.mkdirSync(dataDir, { recursive: true });
    sqliteDb = new DatabaseSync(path.join(dataDir, "shigoto.db"));
    sqliteDb.exec("PRAGMA journal_mode = WAL;");
    await runDdl(TABLES_SQLITE);
  }
}

/** Translate `?` placeholders to Postgres `$n`. */
function translate(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export function prepare(sql) {
  if (!isPostgres) {
    const stmt = sqliteDb.prepare(sql);
    return {
      get: async (...p) => stmt.get(...p),
      all: async (...p) => stmt.all(...p),
      run: async (...p) => stmt.run(...p),
    };
  }
  // RETURNING must be explicit in the SQL (both backends support it).
  const text = translate(sql);
  const pool = getPool();
  return {
    get: async (...p) => (await pool.query(text, p)).rows[0],
    all: async (...p) => (await pool.query(text, p)).rows,
    run: async (...p) => {
      const r = await pool.query(text, p);
      return { lastInsertRowid: r.rows[0]?.id, changes: r.rowCount };
    },
  };
}

export async function exec(sql) {
  if (isPostgres) await getPool().query(sql);
  else sqliteDb.exec(sql);
}
/** Atomic increment; returns the new value. Works on both backends. */
export async function nextSequence(name, startAt = 1) {
  const row = await prepare(
    `INSERT INTO counters(name, value) VALUES(?, COALESCE((SELECT value FROM counters WHERE name = ?), ?) + 1)
     ON CONFLICT(name) DO UPDATE SET value = excluded.value RETURNING value`
  ).get(name, name, startAt - 1);
  return row.value;
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

export async function logEvent(enquiryId, actorId, action, fromStatus = null, toStatus = null, meta = null) {
  await prepare(
    "INSERT INTO enquiry_events(enquiry_id, actor_id, action, from_status, to_status, meta, created_at) VALUES(?,?,?,?,?,?,?)"
  ).run(enquiryId, actorId, action, fromStatus, toStatus, meta ? JSON.stringify(meta) : null, new Date().toISOString());
}

export async function getNotes(enquiryId) {
  return prepare("SELECT * FROM enquiry_notes WHERE enquiry_id = ? ORDER BY created_at ASC").all(enquiryId);
}

export default { prepare, exec, initSchema, nextSequence, toEnquiry, logEvent, getNotes, isPostgres };
