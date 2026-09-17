import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prepare } from "../db.js";
import { publicUser, refreshCookieOptions, signAccess, signRefresh, verifyToken } from "../tokens.js";
import { requireAuth } from "../middleware.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { name = "", email = "", password = "" } = req.body || {};
    if (!name.trim() || !EMAIL_RE.test(email) || String(password).length < 8) {
      return res.status(400).json({ error: "name, valid email and password (min 8 chars) required" });
    }
    const exists = await prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (exists) return res.status(409).json({ error: "email already registered" });
    // Self-signup joins with least privilege; owners promote from user management.
    const hash = bcrypt.hashSync(String(password), 10);
    const now = new Date().toISOString();
    const r = await prepare("INSERT INTO users(name, email, password_hash, role, created_at) VALUES(?,?,?,?,?) RETURNING id")
      .run(name.trim(), email.toLowerCase(), hash, "employee", now);
    const user = publicUser(await prepare("SELECT * FROM users WHERE id = ?").get(r.lastInsertRowid));
    res.cookie("shigoto_refresh", signRefresh(user), refreshCookieOptions());
    res.status(201).json({ user, accessToken: signAccess(user) });
  } catch (err) { next(err); }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email = "", password = "" } = req.body || {};
    const row = await prepare("SELECT * FROM users WHERE email = ?").get(String(email).toLowerCase());
    if (!row || !bcrypt.compareSync(String(password), row.password_hash)) {
      return res.status(401).json({ error: "invalid email or password" });
    }
    const user = publicUser(row);
    res.cookie("shigoto_refresh", signRefresh(user), refreshCookieOptions());
    res.json({ user, accessToken: signAccess(user) });
  } catch (err) { next(err); }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.shigoto_refresh;
    if (!token) return res.status(401).json({ error: "no refresh token" });
    try {
      const payload = verifyToken(token);
      if (payload.typ !== "refresh") return res.status(401).json({ error: "invalid token" });
      const row = await prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
      if (!row) return res.status(401).json({ error: "unknown user" });
      const user = publicUser(row);
      // rotation
      res.cookie("shigoto_refresh", signRefresh(user), refreshCookieOptions());
      res.json({ user, accessToken: signAccess(user) });
    } catch {
      return res.status(401).json({ error: "expired" });
    }
  } catch (err) { next(err); }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("shigoto_refresh", { path: "/api/auth" });
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
