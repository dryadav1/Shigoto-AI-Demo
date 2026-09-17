import { prepare } from "./db.js";
import { verifyToken } from "./tokens.js";

/** Attach req.user from Bearer access token. 401 when missing/invalid. */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "unauthorized" });
    try {
      const payload = verifyToken(token);
      const row = await prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
      if (!row) return res.status(401).json({ error: "unauthorized" });
      req.user = { id: row.id, name: row.name, email: row.email, role: row.role };
      next();
    } catch {
      return res.status(401).json({ error: "unauthorized" });
    }
  } catch (err) {
    next(err);
  }
}

/** Server-side role gate. 403 for insufficient role. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "forbidden", required: roles });
    }
    next();
  };
}

export const requireEnquiryAccess = requireRole("owner", "admin");
