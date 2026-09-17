import { Router } from "express";
import db from "../db.js";
import { publicUser } from "../tokens.js";
import { requireAuth, requireRole } from "../middleware.js";

const router = Router();
const ROLES = ["owner", "admin", "manager", "employee", "viewer"];

router.get("/users", requireAuth, requireRole("owner", "admin"), (_req, res) => {
  const rows = db.prepare("SELECT * FROM users ORDER BY created_at ASC").all();
  res.json(rows.map(publicUser));
});

// Owner-only role management. The last owner cannot be demoted.
router.patch("/users/:id/role", requireAuth, requireRole("owner"), (req, res) => {
  const { role } = req.body || {};
  if (!ROLES.includes(role)) return res.status(400).json({ error: "unknown role", allowed: ROLES });
  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!target) return res.status(404).json({ error: "not found" });
  if (target.role === "owner" && role !== "owner") {
    const owners = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'owner'").get().c;
    if (owners <= 1) return res.status(422).json({ error: "cannot demote the last owner" });
  }
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, target.id);
  res.json(publicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(target.id)));
});

export default router;
