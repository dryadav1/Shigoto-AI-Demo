import { useNavigate } from "react-router-dom";
import { Bot, Bell } from "lucide-react";
import { useI18n } from "../i18n/context";
import { Card, StatusBadge } from "../components/ui";

const emps = [
  { id: "secretary", status: "active", tasks: 128, hrs: 18.5, rate: 96, route: "/app/secretary", tools: ["read_email", "draft_email", "create_task", "request_approval"], conn: ["Gmail", "Calendar", "Drive"] },
  { id: "sales", status: "active", tasks: 94, hrs: 12.0, rate: 93, route: "/app/sales", tools: ["search_customer", "draft_email", "update_crm", "request_approval"], conn: ["Salesforce", "Gmail"] },
  { id: "knowledge", status: "active", tasks: 210, hrs: 9.5, rate: 98, route: "/app/brain", tools: ["search_company_knowledge"], conn: ["Drive"] },
  { id: "hr", status: "soon", tasks: 0, hrs: 0, rate: 0, route: "", tools: [], conn: [] },
  { id: "finance", status: "soon", tasks: 0, hrs: 0, rate: 0, route: "", tools: [], conn: [] },
  { id: "marketing", status: "soon", tasks: 0, hrs: 0, rate: 0, route: "", tools: [], conn: [] },
  { id: "ops", status: "soon", tasks: 0, hrs: 0, rate: 0, route: "", tools: [], conn: [] },
  { id: "translator", status: "soon", tasks: 0, hrs: 0, rate: 0, route: "", tools: [], conn: [] },
];

const perms = [
  { ja: "顧客メールを読む → 自動", en: "Read customer email → AUTO", level: "AUTO" },
  { ja: "返信下書き → 自動", en: "Draft reply → AUTO", level: "AUTO" },
  { ja: "顧客へ送信 → 要承認", en: "Send to customer → APPROVAL", level: "APPROVAL" },
  { ja: "請求書作成 → 要承認", en: "Create invoice → APPROVAL", level: "APPROVAL" },
  { ja: "顧客削除 → 制限", en: "Delete customer → RESTRICTED", level: "RESTRICTED" },
];

export default function Employees() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("employees.title")}</h1>
      <p className="text-sm text-ink-500 mt-1">{t("employees.sub")}</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        {emps.map((e) => (
          <Card key={e.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Bot size={22} /></span>
                <div>
                  <p className="font-bold text-ink-900">{t(`emp.${e.id}.name`)}</p>
                  <p className="text-xs text-ink-500">{t(`emp.${e.id}.desc`)}</p>
                </div>
              </div>
              <StatusBadge level={e.status === "active" ? "active" : "comingSoon"} />
            </div>
            {e.status === "active" ? (
              <>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-ink-50 p-2"><p className="font-bold text-ink-900">{e.tasks}</p><p className="text-[11px] text-ink-500">{t("employees.tasksDone")}</p></div>
                  <div className="rounded-xl bg-ink-50 p-2"><p className="font-bold text-ink-900">{e.hrs}h</p><p className="text-[11px] text-ink-500">{t("employees.timeSaved")}</p></div>
                  <div className="rounded-xl bg-ink-50 p-2"><p className="font-bold text-ink-900">{e.rate}%</p><p className="text-[11px] text-ink-500">{t("employees.success")}</p></div>
                </div>
                <p className="mt-3 text-xs font-semibold text-ink-600">{t("employees.tools")}: <span className="font-normal font-mono">{e.tools.join(", ")}</span></p>
                <p className="mt-1 text-xs font-semibold text-ink-600">{t("employees.connectedTools")}: <span className="font-normal">{e.conn.join(" · ")}</span></p>
                <button className="btn-primary w-full mt-4" onClick={() => nav(e.route)}>{t("employees.openWorkspace")}</button>
              </>
            ) : (
              <>
                <div className="mt-3 space-y-1.5">
                  {perms.slice(0, 3).map((p) => (
                    <div key={p.en} className="flex items-center justify-between text-xs"><span className="text-ink-500">{lang === "ja" ? p.ja : p.en}</span><StatusBadge level={p.level} /></div>
                  ))}
                </div>
                <button className="btn-secondary w-full mt-4"><Bell size={15} />{t("employees.notify")}</button>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
