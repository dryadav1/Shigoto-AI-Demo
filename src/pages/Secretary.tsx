import { useState } from "react";
import { useI18n } from "../i18n/context";
import { Card, StatusBadge, DemoBadge, Empty } from "../components/ui";
import { DEMO } from "../lib/demoData";

const tabs = ["sec.tabInbox", "sec.tabTasks", "sec.tabCalendar", "sec.tabDrafts", "sec.tabAutomations", "sec.tabActivity"];

export default function Secretary() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState(0);
  const [sent, setSent] = useState(false);
  const [edited, setEdited] = useState(false);
  const [draft, setDraft] = useState("");
  const m = DEMO.secretaryEmail;
  const curDraft = draft || (lang === "ja" ? m.draftJa : m.draftEn);

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{t("sec.title")} <DemoBadge /></h1>
        <p className="text-sm text-ink-500 mt-1">{t("sec.sub")}</p>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-ink-100 bg-ink-50 p-1 scrollthin">
        {tabs.map((k, i) => (
          <button key={k} onClick={() => setTab(i)} className={`tabbtn ${tab === i ? "tabbtn-active" : ""}`}>{t(k)}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <p className="text-xs text-ink-500">{t("sec.from")}</p>
            <p className="text-sm font-semibold text-ink-900">{lang === "ja" ? m.fromJa : m.fromEn}</p>
            <p className="mt-2 text-xs text-ink-500">{t("sec.subject")}</p>
            <p className="text-sm font-semibold text-ink-900">{lang === "ja" ? m.subjectJa : m.subjectEn}</p>
            <div className="mt-3 rounded-xl bg-ink-50 border border-ink-100 p-4 text-sm whitespace-pre-line text-ink-800">
              {lang === "ja" ? m.bodyJa : m.bodyEn}
            </div>
            {lang === "en" && (
              <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                Customer email is shown in its original Japanese. <button className="font-bold underline" onClick={() => alert(m.bodyEn)}>{t("common.translate")}</button>
              </div>
            )}
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900 mb-3">{t("sec.analysis")}</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2"><dt className="w-28 shrink-0 text-ink-500">{t("sec.intent")}</dt><dd className="font-semibold text-ink-900">{lang === "ja" ? m.intentJa : m.intentEn}</dd></div>
              <div className="flex gap-2"><dt className="w-28 shrink-0 text-ink-500">{t("sec.customer")}</dt><dd className="font-semibold">ABC Manufacturing</dd></div>
              <div className="flex gap-2"><dt className="w-28 shrink-0 text-ink-500">{t("sec.product")}</dt><dd className="font-semibold">Product A</dd></div>
              <div className="flex gap-2"><dt className="w-28 shrink-0 text-ink-500">{t("sec.qty")}</dt><dd className="font-semibold">500</dd></div>
              <div className="flex gap-2"><dt className="w-28 shrink-0 text-ink-500">{t("sec.action")}</dt><dd>{lang === "ja" ? "在庫を確認し、返信を作成。" : "Check availability and prepare response."}</dd></div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["read_email:AUTO", "search_customer:AUTO", "search_company_knowledge:AUTO", "draft_email:AUTO", "request_approval:APPROVAL"].map((s) => (
                <span key={s} className="badge bg-ink-100 text-ink-700 font-mono !text-[10px]">{s}</span>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-ink-900 mt-4 mb-2">{t("sec.response")}</h3>
            {edited ? (
              <textarea className="input min-h-[180px]" value={curDraft} onChange={(e) => setDraft(e.target.value)} />
            ) : (
              <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 text-sm whitespace-pre-line text-ink-800">{curDraft}</div>
            )}
            <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">🔒 {t("sec.permissionNote")}</p>
            {sent ? (
              <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 font-semibold">
                ✓ {lang === "ja" ? "承認され送信されました。CRMタスクとフォローアップを作成しました。" : "Approved and sent. CRM task and follow-up created."}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={() => setEdited(!edited)}>{t("common.edit")}</button>
                <button className="btn-primary" onClick={() => setSent(true)}>{t("sec.approveSend")}</button>
                <button className="btn-ghost" onClick={() => setSent(false)}>{t("common.reject")}</button>
              </div>
            )}
          </Card>
        </div>
      )}
      {tab === 1 && <Card><Empty text={`${t("sec.tabTasks")} — ABC製造: 見積送付 / 在庫確認 (2)`} /></Card>}
      {tab === 2 && <Card><Empty text={`${t("sec.tabCalendar")} — 10:00 ABC製造 Web面談 / 14:00 社内定例`} /></Card>}
      {tab === 3 && <Card><p className="text-sm whitespace-pre-line">{curDraft}</p><p className="mt-2 text-xs text-ink-400">{t("common.source")}: Company Brain / SOP-014</p></Card>}
      {tab === 4 && <Card><div className="flex items-center justify-between text-sm"><span>新着メール → 自動分析 → 下書き → 承認</span><StatusBadge level="APPROVAL" /></div></Card>}
      {tab === 5 && <Card><Empty text="10:31 READ / 10:32 SEARCH / 10:33 GENERATE / 10:34 WAITING" /></Card>}
    </div>
  );
}
