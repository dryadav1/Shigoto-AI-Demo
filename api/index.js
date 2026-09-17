/** Vercel serverless entry: all /api/* routes run through the Express app. */
import app, { ready } from "../server/app.js";

await ready;

export default function handler(req, res) {
  return app(req, res);
}
