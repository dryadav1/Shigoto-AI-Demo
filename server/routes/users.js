import { Router } from "express";
import { prepare } from "../db.js";
import { publicUser } from "../tokens.js";
import { requireAuth, requireRole } from "../middleware.js";

const router = Router();
const ROLES = ["owner", "admin", "manager", "employee", "viewer"];

router.get("/users", requireAuth, requireRole("owner", "admin"), async (_req, res, next) => {
  try {
    const rows = await prepare("SELECT * FROM users ORDER BY created_at ASC").all();
    res.json(rows.map(publicUser));
  } catch (err) { next(err); }
});

// Owner-only role management. The last owner cannot be demoted.
router.patch("/users/:id/role", requireAuth, requireRole("owner"), async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (!ROLES.includes(role)) return res.status(400).json({ error: "unknown role", allowed: ROLES });
    const target = await prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (!target) return res.status(404).json({ error: "not found" });
    if (target.role === "owner" && role !== "owner") {
      const row = await prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'owner'").get();
      if (Number(row.c) <= 1) return res.status(422).json({ error: "cannot demote the last owner" });
    }
    await prepare("UPDATE users SET role = ? WHERE id = ?").run(role, target.id);
    res.json(publicUser(await prepare("SELECT * FROM users WHERE id = ?").get(target.id)));
  } catch (err) { next(err); }
});

export default router;
