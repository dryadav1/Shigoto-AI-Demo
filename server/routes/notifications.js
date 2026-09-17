import { Router } from "express";
import { prepare } from "../db.js";
import { requireAuth, requireEnquiryAccess } from "../middleware.js";

const router = Router();
// Scoped per-route (owner/admin only) so other /api routes stay reachable.
const admin = [requireAuth, requireEnquiryAccess];

function toNotif(r) {
  return {
    id: r.id, enquiryId: r.enquiry_id,
    titleJa: r.title_ja, titleEn: r.title_en,
    bodyJa: r.body_ja, bodyEn: r.body_en,
    read: !!r.read, createdAt: r.created_at,
  };
}

router.get("/notifications", admin, async (req, res, next) => {
  try {
    const rows = await prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all();
    res.json(rows.map(toNotif));
  } catch (err) { next(err); }
});

router.patch("/notifications/:id/read", admin, async (req, res, next) => {
  try {
    await prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post("/notifications/read-all", admin, async (_req, res, next) => {
  try {
    await prepare("UPDATE notifications SET read = 1").run();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
