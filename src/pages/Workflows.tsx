import { useState } from "react";
import { Play, RotateCcw, Zap, Database, GitFork, UserCheck, Send, Bell } from "lucide-react";
import { useI18n } from "../i18n/context";
import { Card, DemoBadge } from "../components/ui";
import { workflowSteps } from "../lib/demoData";

const iconFor = (type: string) => {
  if (type === "trigger") return <Bell size={16} />;
  if (type === "ai") return <Zap size={16} />;
  if (type === "search") return <Database size={16} />;
  if (type === "approval") return <UserCheck size={16} />;
  if (type === "external") return <Send size={16} />;
  return <GitFork size={16} />;
};
const colorFor = (type: string) =>
  type === "trigger" ? "bg-ink-900 text-white" : type === "ai" ? "bg-brand-700 text-white"
  : type === "search" ? "bg-sky-100 text-sky-800 border border-sky-200" : type === "approval" ? "bg-amber-100 text-amber-800 border border-amber-300"
  : type === "condition" ? "bg-violet-100 text-violet-800 border border-violet-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200";

const typeKey: Record<string, string> = { trigger: "wf.nodeTrigger", ai: "wf.nodeAi", search: "wf.nodeSearch", condition: "wf.nodeCondition", approval: "wf.nodeApproval", external: "wf.nodeExternal" };

export default function Workflows() {
  const { t, lang } = useI18n();
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const run = () => {
    setRunning(true); setDone(false); setActive(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i >= workflowSteps.length) { clearInterval(timer); setRunning(false); setDone(true); setActive(-1); }
      else setActive(i);
    }, 550);
  };
  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-ink-900">{t("wf.title")} <DemoBadge /></h1>
        <p className="text-sm text-ink-500 mt-1">{t("wf.sub")}</p></div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => { setActive(-1); setDone(false); }}><RotateCcw size={15} />{t("wf.reset")}</button>
          <button className="btn-primary" disabled={running} onClick={run}><Play size={15} />{running ? t("wf.running") : t("wf.run")}</button>
        </div>
      </div>
      {done && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-semibold">✓ CRM / Calendar updated · Audit log written</div>}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <Card>
          <div className="max-w-md mx-auto py-2">
            {workflowSteps.map((s, i) => {
              const state = done ? "done" : i < active ? "done" : i === active ? "active" : "waiting";
              return (
                <div key={i}>
                  <div className={`flex items-center gap-3 rounded-2xl border p-3 transition ${state === "active" ? "border-brand-500 bg-brand-50 shadow-pop" : state === "done" ? "border-emerald-200 bg-emerald-50/50" : "border-ink-100 bg-white"}`}>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${colorFor(s.type)}`}>{iconFor(s.type)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900">{lang === "ja" ? s.ja : s.en}</p>
                      <p className="text-[11px] text-ink-500">{t(typeKey[s.type])} · {state === "done" ? "✓ " + t("wf.stepDone") : state === "active" ? "● " + t("wf.stepActive") : "○ " + t("wf.stepWaiting")}</p>
                    </div>
                  </div>
                  {i < workflowSteps.length - 1 && <div className="flow-line" />}
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink-900 mb-3">Nodes</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(typeKey).map(([k, v]) => (
              <div key={k} className={`rounded-xl p-2.5 flex items-center gap-2 ${colorFor(k)}`}>{iconFor(k)}<span className="font-semibold">{t(v)}</span></div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-ink-50 border border-ink-100 p-3 text-xs text-ink-600 font-mono">
            universal: Message → AI → approval → CRM<br />tools: read_email · draft_email · request_approval · update_crm
          </div>
        </Card>
      </div>
    </div>
  );
}
