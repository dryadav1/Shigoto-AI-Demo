/**
 * Enquiry domain model.
 *
 * Designed as persistent backend data. The storage layer lives in
 * `./enquiryStore.ts` behind a repository interface so the localStorage
 * backend used in this prototype can be swapped for a real API /
 * PostgreSQL / Firebase backend without touching UI code.
 *
 * Future CRM pipeline: Enquiry → Lead → Demo → Pilot → Customer → Subscription
 */

export type EnquiryStatus =
  | "new" | "reviewing" | "contacted" | "demo"
  | "pilot" | "converted" | "not_suitable" | "closed";

export const STATUSES: EnquiryStatus[] = [
  "new", "reviewing", "contacted", "demo", "pilot", "converted", "not_suitable", "closed",
];

/** Pipeline stage index for the CRM stepper (Subscription is future). */
export const STATUS_STAGE: Record<EnquiryStatus, number> = {
  new: 0, reviewing: 1, contacted: 1, demo: 2, pilot: 3,
  converted: 4, not_suitable: 0, closed: 0,
};

export interface Industry { id: string; ja: string; en: string; }

export const INDUSTRIES: Industry[] = [
  { id: "manufacturing", ja: "製造業", en: "Manufacturing" },
  { id: "trading", ja: "商社・卸売", en: "Trading" },
  { id: "retail", ja: "小売", en: "Retail" },
  { id: "food", ja: "飲食・食品", en: "Food & Beverage" },
  { id: "hospitality", ja: "宿泊・観光", en: "Hospitality" },
  { id: "construction", ja: "建設", en: "Construction" },
  { id: "it", ja: "IT・サービス", en: "IT Services" },
  { id: "healthcare", ja: "医療・介護", en: "Healthcare" },
  { id: "logistics", ja: "物流・運輸", en: "Logistics" },
  { id: "other", ja: "その他", en: "Other" },
];

export interface TeamMember { id: string; ja: string; en: string; }

export const TEAM: TeamMember[] = [
  { id: "tanaka", ja: "田中 宏", en: "Hiroshi Tanaka" },
  { id: "sato", ja: "佐藤 美咲", en: "Misaki Sato" },
  { id: "suzuki", ja: "鈴木 健太", en: "Kenta Suzuki" },
  { id: "yamada", ja: "山田 優子", en: "Yuko Yamada" },
];

export interface EnquiryNote {
  id: string;
  authorId: string;
  text: string;
  createdAt: string; // ISO
}

export interface Enquiry {
  id: string;             // enquiryNumber, e.g. JPN-2026-00001
  companyJa: string;
  companyEn: string;
  contactJa: string;
  contactEn: string;
  email: string;
  phone: string;
  industryId: string;
  employeeCount: number;
  currentSoftware: string[];
  problemJa: string;
  problemEn: string;
  automationJa: string;
  automationEn: string;
  message: string;        // original visitor message, kept as submitted
  status: EnquiryStatus;
  assignedTo: string | null; // team member id
  demoDate: string | null;   // ISO date
  pilotId: string | null;    // e.g. PLT-2026-014
  internalNotes: EnquiryNote[];
  archived: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface NewEnquiryInput {
  company: string;
  contact: string;
  email: string;
  phone: string;
  industryId: string;
  employeeCount: number;
  currentSoftware: string[];
  problem: string;
  automation: string;
  message: string;
}

export interface AdminNotification {
  id: string;
  enquiryId: string;
  titleJa: string;
  titleEn: string;
  bodyJa: string;
  bodyEn: string;
  read: boolean;
  createdAt: string; // ISO
}

// ---------- deterministic demo seed ----------

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COMPANIES: [string, string][] = [
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
const CONTACTS: [string, string][] = [
  ["田中 宏", "Hiroshi Tanaka"], ["佐藤 美咲", "Misaki Sato"], ["鈴木 健太", "Kenta Suzuki"],
  ["山田 優子", "Yuko Yamada"], ["高橋 大輔", "Daisuke Takahashi"], ["渡辺 恵", "Megumi Watanabe"],
  ["伊藤 翔太", "Shota Ito"], ["中村 真由美", "Mayumi Nakamura"], ["小林 誠", "Makoto Kobayashi"],
  ["加藤 さくら", "Sakura Kato"], ["吉田 拓海", "Takumi Yoshida"], ["松本 梨乃", "Rino Matsumoto"],
];
const PROBLEMS: [string, string][] = [
  ["顧客メールの処理に社員の時間が取られすぎている。", "Customer email processing takes too much employee time."],
  ["見積フォローが遅れ、失注が増えている。", "Quotation follow-ups are slow and we lose deals."],
  ["在庫・納期の問い合わせ対応が属人化している。", "Stock and delivery inquiries depend on specific staff."],
  ["請求書作成・freee入力が毎月負担になっている。", "Monthly invoicing and freee entry are a burden."],
  ["社内ナレッジが散在し、回答に時間がかかる。", "Company knowledge is scattered and answers take too long."],
  ["展示会リードのフォローが追いつかない。", "We cannot keep up with trade-show lead follow-ups."],
  ["日英の翻訳・海外顧客対応に時間がかかる。", "JP-EN translation and overseas customer handling take too long."],
  ["受発注の確認作業が手作業で多い。", "Too much manual order confirmation work."],
];
const AUTOMATIONS: [string, string][] = [
  ["顧客問い合わせ対応と営業フォロー。", "Customer inquiries and sales follow-ups."],
  ["見積作成と請求書発行。", "Quotation creation and invoicing."],
  ["会議の日程調整と議事録整理。", "Meeting scheduling and minutes organization."],
  ["在庫確認と納期回答。", "Stock checks and delivery-date replies."],
  ["社内問い合わせの自動回答。", "Automatic answers to internal questions."],
  ["リード管理とCRM更新。", "Lead management and CRM updates."],
];
const SOFTWARE_POOL = ["Gmail", "Google Drive", "Microsoft 365", "Salesforce", "freee", "Money Forward", "Slack", "LINE WORKS", "kintone", "Excel"];
const NOTE_TEXT: [string, string][] = [
  ["初回連絡済み。先方は前向き。", "First contact done. Positive response."],
  ["デモ日程を調整中。来週で打診。", "Arranging demo schedule for next week."],
  ["決裁者同席のデモを希望。", "Requested a demo with the decision maker present."],
  ["予算感を確認。パイロットから開始したい意向。", "Confirmed budget feeling. Wants to start with a pilot."],
  ["競合比較中。強みを整理して送付。", "Comparing competitors. Sent our strengths summary."],
];
const DOMAINS = ["mirai-tech.jp", "abc-mfg.co.jp", "osaka-trading.co.jp", "nagoya-parts.jp", "example.co.jp"];

export function seedEnquiries(): Enquiry[] {
  const rnd = mulberry32(20260917);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  const bag: EnquiryStatus[] = [
    ...Array<EnquiryStatus>(24).fill("new"), ...Array<EnquiryStatus>(12).fill("reviewing"),
    ...Array<EnquiryStatus>(37).fill("contacted"), ...Array<EnquiryStatus>(18).fill("demo"),
    ...Array<EnquiryStatus>(11).fill("pilot"), ...Array<EnquiryStatus>(5).fill("converted"),
    ...Array<EnquiryStatus>(9).fill("not_suitable"), ...Array<EnquiryStatus>(12).fill("closed"),
  ];
  for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
  // force the 10 newest enquiries to be "new" (swap statuses)
  const N = 128;
  const newestIdx = Array.from({ length: N }, (_, i) => i).slice(-12);
  const newIdx = bag.map((s, i) => (s === "new" ? i : -1)).filter((i) => i >= 0 && !newestIdx.includes(i));
  newestIdx.slice(0, 10).forEach((ni, k) => {
    const si = newIdx[k];
    if (si === undefined) return;
    [bag[ni], bag[si]] = [bag[si], bag[ni]];
  });

  const now = Date.now();
  const day = 86400000;
  const list: Enquiry[] = [];
  let pilotSeq = 1;
  for (let i = 0; i < N; i++) {
    const num = i + 1;
    const id = `JPN-2026-${String(num).padStart(5, "0")}`;
    const [companyJa, companyEn] = COMPANIES[i % COMPANIES.length];
    const [contactJa, contactEn] = CONTACTS[(i * 7 + 3) % CONTACTS.length];
    const industry = INDUSTRIES[(i * 5 + 1) % INDUSTRIES.length];
    const [problemJa, problemEn] = PROBLEMS[i % PROBLEMS.length];
    const [automationJa, automationEn] = AUTOMATIONS[(i * 3 + 1) % AUTOMATIONS.length];
    const status = bag[i];
    const createdAt = new Date(now - ((N - i) / N) * 40 * day - rnd() * 20 * 3600000).toISOString();
    const updatedAt = new Date(Math.min(now, new Date(createdAt).getTime() + rnd() * 5 * day)).toISOString();
    const swCount = 1 + Math.floor(rnd() * 3);
    const software = [...SOFTWARE_POOL].sort(() => rnd() - 0.5).slice(0, swCount);
    const needsOwner = status !== "new";
    const notes: EnquiryNote[] = [];
    if (needsOwner && rnd() > 0.35) {
      const nCount = 1 + Math.floor(rnd() * 2);
      for (let k = 0; k < nCount; k++) {
        const [tJa] = [pick(NOTE_TEXT)];
        notes.push({
          id: `${id}-N${k + 1}`,
          authorId: pick(TEAM).id,
          text: rnd() > 0.5 ? tJa[0] : tJa[1],
          createdAt: new Date(new Date(createdAt).getTime() + (k + 1) * day).toISOString(),
        });
      }
    }
    list.push({
      id, companyJa, companyEn, contactJa, contactEn,
      email: `contact${num}@${pick(DOMAINS)}`,
      phone: `03-${String(1000 + Math.floor(rnd() * 9000))}-${String(1000 + Math.floor(rnd() * 9000))}`,
      industryId: industry.id,
      employeeCount: pick([12, 24, 32, 38, 45, 48, 56, 64, 73, 85, 96, 120]),
      currentSoftware: software,
      problemJa, problemEn, automationJa, automationEn,
      message: `${companyEn} is interested in the Japan Pilot. ${problemEn} We would like to automate: ${automationEn}`,
      status,
      assignedTo: needsOwner ? (rnd() > 0.25 ? pick(TEAM).id : null) : rnd() > 0.8 ? pick(TEAM).id : null,
      demoDate: status === "demo" || status === "pilot" || status === "converted"
        ? new Date(now + (1 + Math.floor(rnd() * 10)) * day).toISOString() : null,
      pilotId: status === "pilot" || status === "converted" ? `PLT-2026-${String(pilotSeq++).padStart(3, "0")}` : null,
      internalNotes: notes,
      archived: false,
      createdAt, updatedAt,
    });
  }
  return list;
}

export function industryById(id: string): Industry {
  return INDUSTRIES.find((i) => i.id === id) ?? INDUSTRIES[INDUSTRIES.length - 1];
}
export function memberById(id: string | null): TeamMember | null {
  return TEAM.find((m) => m.id === id) ?? null;
}
