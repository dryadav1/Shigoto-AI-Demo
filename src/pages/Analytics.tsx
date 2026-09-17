import { useI18n } from "../i18n/context";
import { Card, DemoBadge } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

export default function Analytics() {
  const { t } = useI18n();
  const stats = [
    { k: "analytics.tasksDone", v: "342" }, { k: "analytics.hoursSaved", v: "48.5h" },
    { k: "analytics.successRate", v: "95%" }, { k: "analytics.correction", v: "6%" },
    { k: "analytics.approvalRate", v: "91%" }, { k: "analytics.completion", v: "88%" },
  ];
  const byEmp = [
    { name: "Secretary", v: 128 }, { name: "Sales", v: 94 }, { name: "Knowledge", v: 210 },
  ];
  const weekly = [{ d: "Mon", v: 32 }, { d: "Tue", v: 41 }, { d: "Wed", v: 38 }, { d: "Thu", v: 45 }, { d: "Fri", v: 52 }, { d: "Sat", v: 12 }, { d: "Sun", v: 8 }];
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("analytics.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("analytics.sub")}</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((s) => (<Card key={s.k}><p className="text-2xl font-bold text-ink-900">{s.v}</p><p className="text-xs text-ink-500">{t(s.k)}</p></Card>))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-ink-900 mb-3">{t("analytics.byEmployee")}</h3>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={byEmp}><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="v" fill="#1e38d8" radius={[8, 8, 0, 0]} /></BarChart>
          </ResponsiveContainer></div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink-900 mb-3">{t("analytics.weekly")}</h3>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="d" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Line type="monotone" dataKey="v" stroke="#1e38d8" strokeWidth={2.5} dot={false} /></LineChart>
          </ResponsiveContainer></div>
        </Card>
      </div>
      <Card>
        <h3 className="text-sm font-semibold text-ink-900 mb-2">{t("analytics.utilization")}</h3>
        {[["AI Secretary", 82], ["AI Sales", 64], ["AI Knowledge", 91]].map(([n, v]) => (
          <div key={n} className="flex items-center gap-3 py-1.5 text-sm">
            <span className="w-32 font-medium text-ink-700">{n}</span>
            <div className="flex-1 h-2.5 rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${v}%` }} /></div>
            <span className="w-10 text-right font-bold">{v}%</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
