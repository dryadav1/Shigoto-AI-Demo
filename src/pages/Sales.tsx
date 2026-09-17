import { useState } from "react";
import { useI18n } from "../i18n/context";
import { Card, StatusBadge, DemoBadge, Empty } from "../components/ui";
import { DEMO } from "../lib/demoData";

const tabs = ["sales.tabLeads", "sales.tabCustomers", "sales.tabFollowups", "sales.tabDrafts", "sales.tabPipeline", "sales.tabActivity"];

export default function Sales() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState("");
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("sales.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("sales.sub")}</p></div>
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-ink-100 bg-ink-50 p-1 scrollthin">
        {tabs.map((k, i) => (
          <button key={k} onClick={() => setTab(i)} className={`tabbtn ${tab === i ? "tabbtn-active" : ""}`}>{t(k)}</button>
        ))}
      </div>
      {msg && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-semibold fade-in">✓ {msg}</div>}
      {(tab === 0 || tab === 1) && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DEMO.leads.map((l) => (
            <Card key={l.name}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-ink-900 text-sm">{l.name}</p>
                <StatusBadge level="waiting" />
              </div>
              <p className="mt-1 text-xs font-semibold text-amber-800">{lang === "ja" ? l.statusJa : l.statusEn} · {l.value}</p>
              <div className="mt-3 rounded-xl bg-brand-50 border border-brand-100 p-3 text-[13px] text-brand-900">
                <span className="font-semibold">🤖 {t("sales.recommend")}: </span>{lang === "ja" ? l.recJa : l.recEn}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <button className="btn-secondary !px-2" onClick={() => setMsg(lang === "ja" ? "下書きを作成しました。" : "Draft created.")}>{t("sales.createDraft")}</button>
                <button className="btn-secondary !px-2" onClick={() => setMsg(lang === "ja" ? "タスクを作成しました。" : "Task created.")}>{t("sales.createTask")}</button>
                <button className="btn-secondary !px-2" onClick={() => setMsg(lang === "ja" ? "フォローを予定しました。" : "Follow-up scheduled.")}>{t("sales.schedule")}</button>
                <button className="btn-secondary !px-2" onClick={() => setMsg(lang === "ja" ? "顧客情報を表示します。" : "Showing customer.")}>{t("sales.viewCustomer")}</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab === 2 && <Card><Empty text={lang === "ja" ? "ABC製造： 見積フォロー（明日）/ 大阪商事： 初回面談（金曜）" : "ABC: quotation follow-up (tomorrow) / Osaka: first meeting (Fri)"} /></Card>}
      {tab === 3 && <Card><p className="text-sm whitespace-pre-line">{lang === "ja" ? DEMO.secretaryEmail.draftJa : DEMO.secretaryEmail.draftEn}</p></Card>}
      {tab === 4 && (
        <Card>
          <div className="flex gap-2 overflow-x-auto scrollthin">
            {(lang === "ja" ? ["新規", "提案中", "交渉中", "成約"] : ["New", "Proposal", "Negotiation", "Closed"]).map((s, i) => (
              <div key={s} className="min-w-[180px] flex-1 rounded-xl bg-ink-50 border border-ink-100 p-3">
                <p className="text-xs font-bold text-ink-700">{s} ({[5, 4, 3, 3][i]})</p>
                <div className="mt-2 space-y-2">{DEMO.leads.slice(0, i + 1).map((l) => (<div key={l.name} className="rounded-lg bg-white border border-ink-100 p-2 text-xs font-semibold">{l.name}<br /><span className="text-brand-700">{l.value}</span></div>))}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {tab === 5 && <Card><Empty text="09:25 draft / 09:40 CRM update / 10:05 follow-up scheduled" /></Card>}
    </div>
  );
}
