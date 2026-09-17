import { useState } from "react";
import { useI18n } from "../i18n/context";
import { Card, StatusBadge, DemoBadge, Empty } from "../components/ui";
import { initialTasks } from "../lib/demoData";

const tabs = ["tasks.tabMine", "tasks.tabAi", "tasks.tabPending", "tasks.tabDone", "tasks.tabDue"];
const ownerName = (o: string, lang: string) =>
  o === "human" ? (lang === "ja" ? "田中さん" : "Tanaka-san")
  : o === "ai-secretary" ? (lang === "ja" ? "AI秘書" : "AI Secretary")
  : o === "ai-sales" ? (lang === "ja" ? "AI営業" : "AI Sales") : (lang === "ja" ? "AIナレッジ" : "AI Knowledge");

export default function Tasks() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState(0);
  const [tasks, setTasks] = useState(initialTasks);
  const [pri, setPri] = useState("all");
  const list = tasks.filter((x) => {
    if (tab === 0 && x.owner === "human") return true;
    if (tab === 0) return false;
    if (tab === 1 && x.owner.startsWith("ai")) return true;
    if (tab === 1) return false;
    if (tab === 2 && x.status !== "completed") return true;
    if (tab === 3 && x.status === "completed") return true;
    if (tab === 4 && x.due === "Today") return true;
    if (tab === 4) return false;
    return true;
  }).filter((x) => pri === "all" || x.priority === pri);
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("tasks.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("tasks.sub")}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-ink-100 bg-ink-50 p-1 scrollthin">
          {tabs.map((k, i) => (<button key={k} onClick={() => setTab(i)} className={`tabbtn ${tab === i ? "tabbtn-active" : ""}`}>{t(k)}</button>))}
        </div>
        <select className="input !w-auto ml-auto" value={pri} onChange={(e) => setPri(e.target.value)}>
          <option value="all">{t("common.filter")}</option>
          <option value="high">{t("common.high")}</option>
          <option value="medium">{t("common.medium")}</option>
          <option value="low">{t("common.low")}</option>
        </select>
      </div>
      <Card pad={false}>
        {list.length === 0 ? <div className="p-5"><Empty text={t("common.empty")} /></div> :
        <div className="divide-y divide-ink-50">{list.map((x) => (
          <div key={x.id} className="flex items-center gap-3 px-5 py-3.5">
            <input type="checkbox" checked={x.status === "completed"} onChange={() => setTasks((p) => p.map((y) => y.id === x.id ? { ...y, status: y.status === "completed" ? "pending" : "completed" } : y))} className="h-4 w-4 accent-blue-700" />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${x.status === "completed" ? "line-through text-ink-400" : "text-ink-900"}`}>{lang === "ja" ? x.titleJa : x.titleEn}</p>
              <p className="text-xs text-ink-500">{x.id} · {ownerName(x.owner, lang)} · {x.due}</p>
            </div>
            <StatusBadge level={x.priority} />
            <StatusBadge level={x.status === "completed" ? "approved" : x.status === "in_progress" ? "waiting" : "pending"} />
          </div>
        ))}</div>}
      </Card>
    </div>
  );
}
