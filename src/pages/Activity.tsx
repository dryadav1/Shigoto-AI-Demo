import { useI18n } from "../i18n/context";
import { Card, StatusBadge, DemoBadge } from "../components/ui";
import { initialAudit } from "../lib/demoData";

export default function Activity() {
  const { t, lang } = useI18n();
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("activity.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("activity.sub")}</p></div>
      <Card pad={false}>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px]">
          <thead className="border-b border-ink-100 bg-ink-50/60"><tr>
            <th className="table-th">{t("activity.colTime")}</th><th className="table-th">{t("activity.colActor")}</th><th className="table-th">{t("activity.colAction")}</th><th className="table-th">{t("activity.colTarget")}</th><th className="table-th">{t("activity.colResult")}</th>
          </tr></thead>
          <tbody>
            {[...initialAudit,
              { time: "10:36", actorJa: "田中さん", actorEn: "Tanaka-san", employeeJa: "—", employeeEn: "—", action: "APPROVED", targetJa: "メール送信", targetEn: "Email send", resultJa: "送信完了", resultEn: "Sent", status: "approved" as const },
            ].map((e, i) => (
              <tr key={i} className="border-b border-ink-50 last:border-0">
                <td className="table-td font-mono text-xs">{e.time}</td>
                <td className="table-td font-semibold">{lang === "ja" ? e.actorJa : e.actorEn}</td>
                <td className="table-td"><span className="badge bg-ink-900 text-white font-mono !text-[10px]">{e.action}</span></td>
                <td className="table-td">{lang === "ja" ? e.targetJa : e.targetEn}</td>
                <td className="table-td"><div className="flex items-center gap-2"><span>{lang === "ja" ? e.resultJa : e.resultEn}</span><StatusBadge level={e.status} /></div></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Card>
    </div>
  );
}
