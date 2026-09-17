import { useState } from "react";
import { useI18n } from "../i18n/context";
import { Card, StatusBadge, Modal, DemoBadge, Empty } from "../components/ui";
import { initialApprovals } from "../lib/demoData";
import type { Approval } from "../lib/types";

export const empName = (id: string, lang: string) =>
  id === "secretary" ? (lang === "ja" ? "AI秘書" : "AI Secretary")
  : id === "sales" ? (lang === "ja" ? "AI営業" : "AI Sales")
  : (lang === "ja" ? "AIナレッジ" : "AI Knowledge");

export default function Approvals() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<Approval[]>(initialApprovals);
  const [sel, setSel] = useState<Approval | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const decide = (id: string, s: "approved" | "rejected") => {
    setItems((p) => p.map((a) => (a.id === id ? { ...a, status: s } : a)));
    setSel(null);
  };
  const pending = items.filter((a) => a.status === "pending");
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("approvals.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("approvals.sub")}</p></div>
      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-ink-100 bg-ink-50/60">
              <tr><th className="table-th">{t("approvals.colAction")}</th><th className="table-th">{t("approvals.colEmployee")}</th><th className="table-th">{t("approvals.colCustomer")}</th><th className="table-th">{t("approvals.colRisk")}</th><th className="table-th">{t("approvals.colCreated")}</th><th className="table-th">{t("approvals.colStatus")}</th><th className="table-th">{t("common.actions")}</th></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-ink-50 last:border-0">
                  <td className="table-td font-semibold">{lang === "ja" ? a.detailJa : a.detailEn}<span className="block text-[11px] font-normal text-ink-400">{a.id}</span></td>
                  <td className="table-td">{empName(a.employeeId, lang)}</td>
                  <td className="table-td">{a.customer}</td>
                  <td className="table-td"><StatusBadge level={a.risk} /></td>
                  <td className="table-td font-mono text-xs">{a.created}</td>
                  <td className="table-td"><StatusBadge level={a.status} /></td>
                  <td className="table-td"><div className="flex gap-1.5">
                    <button className="btn-secondary !py-1 !px-2.5 !text-xs" onClick={() => { setSel(a); setEditing(false); setEditText(lang === "ja" ? a.draftJa : a.draftEn); }}>{t("common.review")}</button>
                    {a.status === "pending" && (<>
                      <button className="btn-primary !py-1 !px-2.5 !text-xs" onClick={() => decide(a.id, "approved")}>{t("common.approve")}</button>
                      <button className="btn-ghost !py-1 !text-xs" onClick={() => decide(a.id, "rejected")}>{t("common.reject")}</button>
                    </>)}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {pending.length === 0 && <Empty text={t("approvals.empty")} />}
      {sel && (
        <Modal onClose={() => setSel(null)}>
          <h3 className="font-bold text-ink-900">{t("approvals.draft")} — {sel.id}</h3>
          <p className="text-xs text-ink-500 mt-1">{empName(sel.employeeId, lang)} · {sel.customer} · <StatusBadge level={sel.risk} /></p>
          {editing ? <textarea className="input mt-3 min-h-[200px]" value={editText} onChange={(e) => setEditText(e.target.value)} />
            : <div className="mt-3 rounded-xl bg-ink-50 border border-ink-100 p-4 text-sm whitespace-pre-line">{editText}</div>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => setEditing(!editing)}>{t("common.edit")}</button>
            <button className="btn-primary" onClick={() => decide(sel.id, "approved")}>{t("common.approve")}</button>
            <button className="btn-ghost" onClick={() => decide(sel.id, "rejected")}>{t("common.reject")}</button>
            <button className="btn-ghost ml-auto" onClick={() => setSel(null)}>{t("common.close")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
