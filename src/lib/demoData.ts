import type { Approval, AuditEvent, UniversalTask } from "./types";

export const DEMO = {
  company: { ja: "株式会社未来テック", en: "Mirai Tech Co., Ltd.", industryJa: "製造業", industryEn: "Manufacturing", headcount: 48 },
  kpis: { active: 5, tasksToday: 27, approvals: 3, savedHrs: 4.5 },
  activity: [
    { time: "09:12", emp: "secretary", ja: "顧客からの問い合わせを処理", en: "Processed customer inquiry" },
    { time: "09:25", emp: "sales", ja: "フォローアップメールを作成", en: "Prepared follow-up email" },
    { time: "10:03", emp: "knowledge", ja: "製品情報を検索", en: "Found product information" },
    { time: "10:31", emp: "secretary", ja: "顧客との面談を調整", en: "Scheduled customer meeting" },
  ] as { time: string; emp: string; ja: string; en: string }[],
  ecosystem: [
    { name: "Gmail", cat: "comm", connected: true },
    { name: "Google Drive", cat: "storage", connected: true },
    { name: "Salesforce", cat: "crm", connected: true },
    { name: "freee", cat: "acct", connected: true },
  ],
  secretaryEmail: {
    fromJa: "ABC製造 佐藤様 <sato@abc-mfg.co.jp>",
    fromEn: "ABC Manufacturing, Sato <sato@abc-mfg.co.jp>",
    subjectJa: "製品Aのお見積りと納期について",
    subjectEn: "Quote and delivery for Product A",
    bodyJa: "お世話になっております。ABC製造の佐藤です。\n\n製品Aを500個注文したいです。納期を教えてください。\nお見積りも合わせてお願いいたします。",
    bodyEn: "Hello, this is Sato from ABC Manufacturing.\n\nWe would like to order 500 units of Product A. Please let us know the delivery date and send a quotation.",
    intentJa: "製品問い合わせ / 注文依頼",
    intentEn: "Product inquiry / order request",
    draftJa: "佐藤様\n\nお世話になっております。未来テックの田中です。\n\n製品A 500個のご注文についてお問い合わせいただき、誠にありがとうございます。\n標準納期は7〜10営業日でございます。在庫を確認のうえ、本日中に正式なお見積りをお送りいたします。\n\nご不明点がございましたら、お気軽にご連絡ください。\n\nよろしくお願い申し上げます。\n田中",
    draftEn: "Dear Sato-san,\n\nThank you for your inquiry about 500 units of Product A.\n\nOur standard delivery is 7–10 business days. We are checking stock and will send a formal quotation today.\n\nPlease let us know if you have any questions.\n\nBest regards,\nTanaka",
  },
  leads: [
    { name: "ABC製造 / ABC Manufacturing", statusJa: "要フォロー", statusEn: "Follow-up Required", recJa: "製品Aの価格について問い合わせあり。見積フォローを準備してください。", recEn: "Customer requested Product A pricing. Prepare a follow-up quotation.", value: "¥4,200,000" },
    { name: "大阪商事 / Osaka Trading", statusJa: "新規", statusEn: "New", recJa: "初回面談の設定を推奨します。", recEn: "Recommend scheduling a first meeting.", value: "¥1,800,000" },
    { name: "名古屋パーツ / Nagoya Parts", statusJa: "交渉中", statusEn: "Negotiating", recJa: "納期条件の確認が必要です。", recEn: "Delivery terms need confirmation.", value: "¥6,500,000" },
  ],
  brainDocs: [
    { titleJa: "製品A 仕様書 v3.2", titleEn: "Product A Spec v3.2", catJa: "製品", catEn: "Products" },
    { titleJa: "標準納期・配送SOP", titleEn: "Delivery SOP", catJa: "SOP", catEn: "SOPs" },
    { titleJa: "価格表 2026年度", titleEn: "Price List FY2026", catJa: "価格", catEn: "Pricing" },
    { titleJa: "ABC製造 取引履歴", titleEn: "ABC Manufacturing History", catJa: "顧客", catEn: "Customers" },
    { titleJa: "与信・請求ポリシー", titleEn: "Billing Policy", catJa: "ポリシー", catEn: "Policies" },
  ],
  brainAnswerJa: "社内SOPによると： 標準納期は7〜10営業日です。特急配送にはマネージャーの承認が必要です。",
  brainAnswerEn: "According to Company SOP: Standard delivery is 7–10 business days. Expedited delivery requires manager approval.",
};

export const initialApprovals: Approval[] = [
  {
    id: "APR-1042", actionKey: "Send customer email", employeeId: "secretary",
    customer: "ABC Manufacturing", risk: "Medium", created: "10:33", status: "pending",
    detailJa: "顧客への返信メール送信", detailEn: "Send customer email",
    draftJa: DEMO.secretaryEmail.draftJa, draftEn: DEMO.secretaryEmail.draftEn,
  },
  {
    id: "APR-1041", actionKey: "Create quotation", employeeId: "sales",
    customer: "Osaka Trading", risk: "Low", created: "09:58", status: "pending",
    detailJa: "見積書の作成（製品B × 200個）", detailEn: "Create quotation (Product B × 200)",
    draftJa: "大阪商事様宛 見積書（製品B 200個）のドラフトを作成しました。",
    draftEn: "Drafted quotation for Osaka Trading (Product B × 200).",
  },
  {
    id: "APR-1040", actionKey: "Create invoice", employeeId: "sales",
    customer: "Nagoya Parts", risk: "High", created: "09:12", status: "pending",
    detailJa: "請求書の作成（¥6,500,000）", detailEn: "Create invoice (¥6,500,000)",
    draftJa: "請求書ドラフト（高額のため要承認）を作成しました。",
    draftEn: "Drafted invoice (high value, approval required).",
  },
];

export const initialTasks: UniversalTask[] = [
  { id: "T-201", titleJa: "ABC製造への見積送付を確認", titleEn: "Confirm quotation sent to ABC Manufacturing", owner: "human", status: "pending", priority: "high", due: "Today" },
  { id: "T-202", titleJa: "顧客問い合わせの一次対応", titleEn: "First response to customer inquiry", owner: "ai-secretary", status: "completed", priority: "medium", due: "Today" },
  { id: "T-203", titleJa: "大阪商事のフォローアップ作成", titleEn: "Draft Osaka Trading follow-up", owner: "ai-sales", status: "in_progress", priority: "medium", due: "Today" },
  { id: "T-204", titleJa: "製品Aの在庫確認", titleEn: "Check Product A stock", owner: "ai-secretary", status: "pending", priority: "high", due: "Today" },
  { id: "T-205", titleJa: "納期SOPの更新レビュー", titleEn: "Review delivery SOP update", owner: "human", status: "pending", priority: "low", due: "This week" },
];

export const initialAudit: AuditEvent[] = [
  { time: "10:31", actorJa: "AI秘書", actorEn: "AI Secretary", employeeJa: "AI秘書", employeeEn: "AI Secretary", action: "READ", targetJa: "顧客メール", targetEn: "Customer email", resultJa: "問い合わせを検出", resultEn: "Inquiry detected", status: "done" },
  { time: "10:32", actorJa: "AI秘書", actorEn: "AI Secretary", employeeJa: "AI秘書", employeeEn: "AI Secretary", action: "SEARCH", targetJa: "製品情報", targetEn: "Product info", resultJa: "製品Aの情報を取得", resultEn: "Retrieved Product A info", status: "done" },
  { time: "10:33", actorJa: "AI秘書", actorEn: "AI Secretary", employeeJa: "AI秘書", employeeEn: "AI Secretary", action: "GENERATE", targetJa: "返信下書き", targetEn: "Reply draft", resultJa: "敬語の下書きを作成", resultEn: "Drafted keigo reply", status: "done" },
  { time: "10:34", actorJa: "AI秘書", actorEn: "AI Secretary", employeeJa: "AI秘書", employeeEn: "AI Secretary", action: "WAITING", targetJa: "人間の承認", targetEn: "Human approval", resultJa: "承認待ち", resultEn: "Awaiting approval", status: "waiting" },
];

export const integrations = [
  { id: "gmail", name: "Gmail", cat: "comm", descJa: "メールの読み取り・下書き作成", descEn: "Read mail, create drafts", connected: true },
  { id: "gcal", name: "Google Calendar", cat: "cal", descJa: "予定の作成・調整", descEn: "Create and schedule events", connected: true },
  { id: "gdrive", name: "Google Drive", cat: "storage", descJa: "ドキュメント検索・参照", descEn: "Search and reference docs", connected: true },
  { id: "outlook", name: "Outlook", cat: "comm", descJa: "Microsoft 365 メール連携", descEn: "Microsoft 365 mail", connected: false },
  { id: "m365cal", name: "Microsoft Calendar", cat: "cal", descJa: "予定連携", descEn: "Calendar sync", connected: false },
  { id: "onedrive", name: "OneDrive", cat: "storage", descJa: "ファイル参照", descEn: "File reference", connected: false },
  { id: "salesforce", name: "Salesforce", cat: "crm", descJa: "顧客・商談の同期", descEn: "Sync customers and deals", connected: true },
  { id: "freee", name: "freee", cat: "acct", descJa: "請求・会計連携（日本）", descEn: "Invoicing & accounting (Japan)", connected: true },
  { id: "mf", name: "Money Forward", cat: "acct", descJa: "会計連携（日本）", descEn: "Accounting (Japan)", connected: false },
];

export const workflowSteps = [
  { ja: "新規顧客メール", en: "New customer email", type: "trigger" },
  { ja: "リクエストを理解", en: "Understand request", type: "ai" },
  { ja: "顧客を特定", en: "Identify customer", type: "search" },
  { ja: "社内ナレッジを検索", en: "Search company knowledge", type: "search" },
  { ja: "製品情報を検索", en: "Search product info", type: "search" },
  { ja: "返信下書きを作成", en: "Create response draft", type: "ai" },
  { ja: "人間の承認", en: "Human approval", type: "approval" },
  { ja: "メール送信", en: "Send email", type: "external" },
  { ja: "CRMを更新", en: "Update CRM", type: "external" },
  { ja: "フォローアップを予定", en: "Schedule follow-up", type: "external" },
];
