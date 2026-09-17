import jwt from "jsonwebtoken";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

function secret() {
  return process.env.JWT_SECRET || "dev-only-secret-change-me";
}

export function signAccess(user) {
  return jwt.sign({ sub: user.id, role: user.role }, secret(), { expiresIn: ACCESS_TTL });
}
export function signRefresh(user) {
  return jwt.sign({ sub: user.id, typ: "refresh" }, secret(), { expiresIn: REFRESH_TTL });
}
export function verifyToken(token) {
  return jwt.verify(token, secret());
}
export function publicUser(row) {
  if (!row) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, createdAt: row.created_at };
}
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/api/auth",
    maxAge: 7 * 24 * 3600 * 1000,
  };
}
