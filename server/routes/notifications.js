import { Router } from "express";
import db from "../db.js";
import { requireAuth, requireEnquiryAccess } from "../middleware.js";

const router = Router();
router.use(requireAuth, requireEnquiryAccess);

function toNotif(r) {
  return {
    id: r.id, enquiryId: r.enquiry_id,
    titleJa: r.title_ja, titleEn: r.title_en,
    bodyJa: r.body_ja, bodyEn: r.body_en,
    read: !!r.read, createdAt: r.created_at,
  };
}

router.get("/notifications", (req, res) => {
  const rows = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all();
  res.json(rows.map(toNotif));
});

router.patch("/notifications/:id/read", (req, res) => {
  db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

router.post("/notifications/read-all", (_req, res) => {
  db.prepare("UPDATE notifications SET read = 1").run();
  res.json({ ok: true });
});

export default router;
