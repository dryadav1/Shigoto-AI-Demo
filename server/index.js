import app, { ready } from "./app.js";

await ready;
const PORT = parseInt(process.env.PORT, 10) || 4000;
app.listen(PORT, () => console.log(`[shigoto] API on http://localhost:${PORT}`));
