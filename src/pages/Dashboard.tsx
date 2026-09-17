import { Link, useNavigate } from "react-router-dom";
import { Users, CheckSquare, Clock, Sparkles, ArrowRight, Play } from "lucide-react";
import { useI18n } from "../i18n/context";
import { Card, CardTitle, DemoBadge, StatusBadge } from "../components/ui";
import { DEMO, initialApprovals } from "../lib/demoData";

export default function Dashboard() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const kpis = [
    { icon: Users, label: t("dash.kpiActive"), value: String(DEMO.kpis.active) },
    { icon: Sparkles, label: t("dash.kpiTasks"), value: String(DEMO.kpis.tasksToday) },
    { icon: CheckSquare, label: t("dash.kpiApprovals"), value: String(DEMO.kpis.approvals) },
    { icon: Clock, label: t("dash.kpiSaved"), value: `${DEMO.kpis.savedHrs} hrs` },
  ];
  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{t("dash.greeting")}</h1>
          <p className="mt-1 text-sm text-ink-500">{t("dash.sub")} <DemoBadge /></p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => nav("/app/secretary")}><Play size={16} />{t("dash.runDemo")}</button>
          <button className="btn-primary" onClick={() => nav("/app/secretary")}>{t("dash.openSecretary")}<ArrowRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <k.icon size={18} className="text-brand-700" />
            <p className="mt-2 text-2xl font-bold text-ink-900">{k.value}</p>
            <p className="text-xs text-ink-500">{k.label}</p>
          </Card>
        ))}
      </div>
      <p className="text-[11px] text-ink-400">{t("dash.demoNote")}</p>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle right={<Link to="/app/activity" className="text-xs font-semibold text-brand-700">{t("common.viewAll")}</Link>}>{t("dash.activity")}</CardTitle>
          <div className="space-y-3">
            {DEMO.activity.map((a) => (
              <div key={a.time} className="flex gap-3 text-sm">
                <span className="font-mono text-xs text-ink-400 w-10 pt-0.5">{a.time}</span>
                <span className="h-2 w-2 mt-1.5 rounded-full bg-emerald-500 dot-pulse shrink-0" />
                <div><p className="font-semibold text-ink-800">{a.emp === "secretary" ? t("emp.secretary.name") : a.emp === "sales" ? t("emp.sales.name") : t("emp.knowledge.name")}</p>
                <p className="text-ink-500 text-[13px]">{lang === "ja" ? a.ja : a.en}</p></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle right={<Link to="/app/approvals" className="text-xs font-semibold text-brand-700">{t("common.viewAll")}</Link>}>{t("dash.approvals")}</CardTitle>
          <div className="space-y-3">
            {initialApprovals.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-xl border border-ink-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-900">{lang === "ja" ? a.detailJa : a.detailEn}</p>
                  <StatusBadge level={a.risk} />
                </div>
                <p className="text-xs text-ink-500 mt-0.5">{a.customer} · {a.id}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={() => nav("/app/approvals")}>{t("common.review")}</button>
                  <button className="btn-primary !py-1.5 !px-3 !text-xs" onClick={() => nav("/app/approvals")}>{t("common.approve")}</button>
                  <button className="btn-ghost !py-1.5 !text-xs" onClick={() => nav("/app/approvals")}>{t("common.reject")}</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle>{t("dash.ecosystem")}</CardTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEMO.ecosystem.map((e) => (
            <div key={e.name} className="rounded-xl border border-ink-100 p-3 text-sm">
              <p className="font-semibold text-ink-900">{e.name}</p>
              <p className="mt-1 text-xs text-emerald-700 font-semibold">● {t("common.connected")}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-900">
          {t("dash.workflowCta")}
        </div>
      </Card>
    </div>
  );
}
