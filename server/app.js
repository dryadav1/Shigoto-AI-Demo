import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { seedIfEmpty } from "./seed.js";
import authRoutes from "./routes/auth.js";
import enquiryRoutes from "./routes/enquiries.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "256kb" }));
app.use(cookieParser());
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 600 }));

app.use("/api/auth", authRoutes);
app.use("/api", enquiryRoutes);
app.use("/api", notificationRoutes);
app.use("/api", userRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Serve the production frontend build (created by `npm run build`).
// On Vercel the static frontend is served by the CDN instead (see vercel.json).
const dist = path.join(__dirname, "..", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

/** Await before serving (schema init + first-run seed). */
export const ready = seedIfEmpty().catch((err) => {
  console.error("[seed] failed:", err);
});

export default app;
