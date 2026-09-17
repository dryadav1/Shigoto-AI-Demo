/**
 * Demo seed: users + 128 enquiries + notifications.
 * Runs once on first server start (when users table is empty).
 * Deterministic data so the demo is identical on every fresh install.
 *
 * Production: set SEED_DEMO=false to skip demo data. Optionally set
 * ADMIN_EMAIL + ADMIN_PASSWORD (+ ADMIN_NAME) to bootstrap the first
 * owner account on an empty database.
 */
import bcrypt from "bcryptjs";
import db, { nextSequence, logEvent } from "./db.js";

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COMPANIES = [
  ["株式会社未来テック", "Mirai Tech Co., Ltd."], ["ABC製造", "ABC Manufacturing"],
  ["大阪商事", "Osaka Trading"], ["名古屋パーツ", "Nagoya Parts"],
  ["東京食品", "Tokyo Foods"], ["京都ホテルズ", "Kyoto Hotels"],
  ["浜松機械", "Hamamatsu Machinery"], ["福岡物流", "Fukuoka Logistics"],
  ["札幌メディカル", "Sapporo Medical"], ["広島建設", "Hiroshima Construction"],
  ["金沢リテール", "Kanazawa Retail"], ["仙台ITソリューション", "Sendai IT Solutions"],
  ["神戸トレーディング", "Kobe Trading"], ["横浜電機", "Yokohama Electric"],
  ["静岡パッケージ", "Shizuoka Package"], ["岡山スチール", "Okayama Steel"],
  ["那覇リゾート", "Naha Resort"], ["新潟食品加工", "Niigata Food Processing"],
  ["高松運輸", "Takamatsu Transport"], ["長野精密", "Nagano Precision"],
  ["熊本ケアサービス", "Kumamoto Care"], ["千葉化学", "Chiba Chemical"],
  ["埼玉部品工業", "Saitama Parts Industry"], ["滋賀テキスタイル", "Shiga Textile"],
];
const CONTACTS = [
  ["田中 宏", "Hiroshi Tanaka"], ["佐藤 美咲", "Misaki Sato"], ["鈴木 健太", "Kenta Suzuki"],
  ["山田 優子", "Yuko Yamada"], ["高橋 大輔", "Daisuke Takahashi"], ["渡辺 恵", "Megumi Watanabe"],
  ["伊藤 翔太", "Shota Ito"], ["中村 真由美", "Mayumi Nakamura"], ["小林 誠", "Makoto Kobayashi"],
  ["加藤 さくら", "Sakura Kato"], ["吉田 拓海", "Takumi Yoshida"], ["松本 梨乃", "Rino Matsumoto"],
];
const INDUSTRIES = ["manufacturing", "trading", "retail", "food", "hospitality", "construction", "it", "healthcare", "logistics", "other"];
const PROBLEMS = [
  ["顧客メールの処理に社員の時間が取られすぎている。", "Customer email processing takes too much employee time."],
  ["見積フォローが遅れ、失注が増えている。", "Quotation follow-ups are slow and we lose deals."],
  ["在庫・納期の問い合わせ対応が属人化している。", "Stock and delivery inquiries depend on specific staff."],
  ["請求書作成・freee入力が毎月負担になっている。", "Monthly invoicing and freee entry are a burden."],
  ["社内ナレッジが散在し、回答に時間がかかる。", "Company knowledge is scattered and answers take too long."],
  ["展示会リードのフォローが追いつかない。", "We cannot keep up with trade-show lead follow-ups."],
  ["日英の翻訳・海外顧客対応に時間がかかる。", "JP-EN translation and overseas customer handling take too long."],
  ["受発注の確認作業が手作業で多い。", "Too much manual order confirmation work."],
];
const AUTOMATIONS = [
  ["顧客問い合わせ対応と営業フォロー。", "Customer inquiries and sales follow-ups."],
  ["見積作成と請求書発行。", "Quotation creation and invoicing."],
  ["会議の日程調整と議事録整理。", "Meeting scheduling and minutes organization."],
  ["在庫確認と納期回答。", "Stock checks and delivery-date replies."],
  ["社内問い合わせの自動回答。", "Automatic answers to internal questions."],
  ["リード管理とCRM更新。", "Lead management and CRM updates."],
];
const SOFTWARE_POOL = ["Gmail", "Google Drive", "Microsoft 365", "Salesforce", "freee", "Money Forward", "Slack", "LINE WORKS", "kintone", "Excel"];
const NOTE_TEXT = [
  ["初回連絡済み。先方は前向き。", "First contact done. Positive response."],
  ["デモ日程を調整中。来週で打診。", "Arranging demo schedule for next week."],
  ["決裁者同席のデモを希望。", "Requested a demo with the decision maker present."],
  ["予算感を確認。パイロットから開始したい意向。", "Confirmed budget feeling. Wants to start with a pilot."],
  ["競合比較中。強みを整理して送付。", "Comparing competitors. Sent our strengths summary."],
];
const TEAM = ["tanaka", "sato", "suzuki", "yamada"];
const DOMAINS = ["mirai-tech.jp", "abc-mfg.co.jp", "osaka-trading.co.jp", "nagoya-parts.jp", "example.co.jp"];

export function seedIfEmpty() {
  const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (userCount > 0) return;

  if (process.env.SEED_DEMO === "false") {
    bootstrapAdmin();
    return;
  }

  const now = new Date().toISOString();
  const hash = bcrypt.hashSync("demo-pass", 10);
  const users = [
    ["田中 オーナー", "owner@mirai-tech.jp", "owner"],
    ["田中 管理者", "admin@mirai-tech.jp", "admin"],
    ["佐藤 マネージャー", "manager@mirai-tech.jp", "manager"],
    ["鈴木 社員", "employee@mirai-tech.jp", "employee"],
    ["山田 閲覧者", "viewer@mirai-tech.jp", "viewer"],
  ];
  const insUser = db.prepare("INSERT INTO users(name, email, password_hash, role, created_at) VALUES(?,?,?,?,?)");
  for (const [name, email, role] of users) insUser.run(name, email, hash, role, now);

  // ---- enquiries (deterministic) ----
  const rnd = mulberry32(20260917);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const bag = [
    ...Array(24).fill("new"), ...Array(12).fill("reviewing"),
    ...Array(37).fill("contacted"), ...Array(18).fill("demo"),
    ...Array(11).fill("pilot"), ...Array(5).fill("converted"),
    ...Array(9).fill("not_suitable"), ...Array(12).fill("closed"),
  ];
  for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
  const N = 128;
  const newestIdx = Array.from({ length: N }, (_, i) => i).slice(-12);
  const newIdx = bag.map((s, i) => (s === "new" ? i : -1)).filter((i) => i >= 0 && !newestIdx.includes(i));
  newestIdx.slice(0, 10).forEach((ni, k) => {
    const si = newIdx[k];
    if (si === undefined) return;
    [bag[ni], bag[si]] = [bag[si], bag[ni]];
  });

  const day = 86400000;
  const nowMs = Date.now();
  const insEnq = db.prepare(`INSERT INTO enquiries(
    id, company_ja, company_en, contact_ja, contact_en, email, phone, industry_id,
    employee_count, current_software, problem_ja, problem_en, automation_ja, automation_en,
    message, status, assigned_to, demo_date, pilot_id, archived, created_at, updated_at
  ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insNote = db.prepare("INSERT INTO enquiry_notes(enquiry_id, author_id, text, created_at) VALUES(?,?,?,?)");
  let pilotSeq = 0;

  for (let i = 0; i < N; i++) {
    const num = nextSequence("enquiry_seq");
    const id = `JPN-2026-${String(num).padStart(5, "0")}`;
    const [companyJa, companyEn] = COMPANIES[i % COMPANIES.length];
    const [contactJa, contactEn] = CONTACTS[(i * 7 + 3) % CONTACTS.length];
    const [problemJa, problemEn] = PROBLEMS[i % PROBLEMS.length];
    const [automationJa, automationEn] = AUTOMATIONS[(i * 3 + 1) % AUTOMATIONS.length];
    const status = bag[i];
    const createdAt = new Date(nowMs - ((N - i) / N) * 40 * day - rnd() * 20 * 3600000).toISOString();
    const updatedAt = new Date(Math.min(nowMs, new Date(createdAt).getTime() + rnd() * 5 * day)).toISOString();
    const swCount = 1 + Math.floor(rnd() * 3);
    const software = [...SOFTWARE_POOL].sort(() => rnd() - 0.5).slice(0, swCount);
    const needsOwner = status !== "new";
    const assigned = needsOwner ? (rnd() > 0.25 ? pick(TEAM) : null) : rnd() > 0.8 ? pick(TEAM) : null;
    const isDemoStage = status === "demo" || status === "pilot" || status === "converted";
    let pilotId = null;
    if (status === "pilot" || status === "converted") {
      pilotSeq += 1;
      pilotId = `PLT-2026-${String(pilotSeq).padStart(3, "0")}`;
    }
    insEnq.run(
      id, companyJa, companyEn, contactJa, contactEn,
      `contact${num}@${pick(DOMAINS)}`,
      `03-${String(1000 + Math.floor(rnd() * 9000))}-${String(1000 + Math.floor(rnd() * 9000))}`,
      INDUSTRIES[(i * 5 + 1) % INDUSTRIES.length],
      pick([12, 24, 32, 38, 45, 48, 56, 64, 73, 85, 96, 120]),
      JSON.stringify(software), problemJa, problemEn, automationJa, automationEn,
      `${companyEn} is interested in the Japan Pilot. ${problemEn} We would like to automate: ${automationEn}`,
      status, assigned,
      isDemoStage ? new Date(nowMs + (1 + Math.floor(rnd() * 10)) * day).toISOString() : null,
      pilotId, 0, createdAt, updatedAt
    );
    if (needsOwner && rnd() > 0.35) {
      const nCount = 1 + Math.floor(rnd() * 2);
      for (let k = 0; k < nCount; k++) {
        const t = pick(NOTE_TEXT);
        insNote.run(id, pick(TEAM), rnd() > 0.5 ? t[0] : t[1],
          new Date(new Date(createdAt).getTime() + (k + 1) * day).toISOString());
      }
    }
    logEvent(id, "system", "seeded", null, status);
  }
  db.prepare("INSERT INTO counters(name, value) VALUES('pilot_seq', ?) ON CONFLICT(name) DO UPDATE SET value = excluded.value").run(pilotSeq);

  // notifications for 3 newest
  const newest = db.prepare("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 3").all();
  const insNotif = db.prepare("INSERT INTO notifications(id, enquiry_id, title_ja, title_en, body_ja, body_en, read, created_at) VALUES(?,?,?,?,?,?,?,?)");
  newest.forEach((e, i) => {
    insNotif.run(`NOTIF-${e.id}`, e.id,
      "新規 Japan Pilot 問い合わせ", "New Japan Pilot Enquiry",
      `${e.company_ja}（${e.contact_ja}）から問い合わせがありました。`,
      `Enquiry submitted by ${e.company_en} (${e.contact_en}).`,
      i === 0 ? 0 : 1, e.created_at);
  });
  console.log(`[seed] users=5 enquiries=${N} pilotSeq=${pilotSeq}`);
}

/** Production bootstrap: create the first owner from env vars (no demo data). */
export function bootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || password.length < 8) {
    console.log("[seed] SEED_DEMO=false and no valid ADMIN_EMAIL/ADMIN_PASSWORD — starting with an empty database.");
    return;
  }
  const name = process.env.ADMIN_NAME || "Owner";
  db.prepare("INSERT INTO users(name, email, password_hash, role, created_at) VALUES(?,?,?,?,?)")
    .run(name, email, bcrypt.hashSync(password, 10), "owner", new Date().toISOString());
  console.log(`[seed] bootstrap owner created: ${email}`);
}
