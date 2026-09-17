import { useEffect, useState } from "react";
import { useI18n } from "../i18n/context";
import { useAuth } from "../auth/context";
import type { Role } from "../auth/context";
import { Card, StatusBadge, DemoBadge } from "../components/ui";
import { fetchUsers, patchUserRole, type AppUser } from "../lib/enquiriesApi";
import type { PermissionLevel } from "../lib/types";

const tabs = ["settings.tabProfile", "settings.tabUsers", "settings.tabRoles", "settings.tabPerms", "settings.tabSecurity", "settings.tabNotify", "settings.tabBilling"];

const permRows = [
  { ja: "顧客メールを読む", en: "Read customer email" },
  { ja: "返信下書きを作成", en: "Draft reply" },
  { ja: "顧客へメール送信", en: "Send customer email" },
  { ja: "見積書を作成", en: "Create quotation" },
  { ja: "請求書を作成", en: "Create invoice" },
  { ja: "顧客を削除", en: "Delete customer" },
];

export default function Settings() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersErr, setUsersErr] = useState("");
  useEffect(() => {
    if (tab === 1) {
      fetchUsers().then(setUsers).catch(() => setUsersErr(t("enq.loadError")));
    }
  }, [tab, t]);
  const changeRole = async (id: number, role: Role) => {
    setUsersErr("");
    try {
      const u = await patchUserRole(id, role);
      setUsers((p) => p.map((x) => (x.id === id ? u : x)));
    } catch {
      setUsersErr(t("enq.badTransition"));
    }
  };
  const [perms, setPerms] = useState<Record<number, PermissionLevel>>({ 0: "AUTO", 1: "AUTO", 2: "APPROVAL", 3: "APPROVAL", 4: "APPROVAL", 5: "RESTRICTED" });
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("settings.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("settings.sub")}</p></div>
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-ink-100 bg-ink-50 p-1 scrollthin">
        {tabs.map((k, i) => (<button key={k} onClick={() => setTab(i)} className={`tabbtn ${tab === i ? "tabbtn-active" : ""}`}>{t(k)}</button>))}
      </div>
      {saved && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-800 font-semibold">✓ {t("common.save")}</div>}
      {tab === 0 && <Card><div className="grid sm:grid-cols-3 gap-4">
        <div><label className="label">{t("settings.companyName")}</label><input className="input" defaultValue={lang === "ja" ? "株式会社未来テック" : "Mirai Tech Co., Ltd."} /></div>
        <div><label className="label">{t("settings.industry")}</label><input className="input" defaultValue={lang === "ja" ? "製造業" : "Manufacturing"} /></div>
        <div><label className="label">{t("settings.size")}</label><input className="input" defaultValue="48" /></div>
      </div><button className="btn-primary mt-4" onClick={() => setSaved(true)}>{t("common.save")}</button></Card>}
      {tab === 1 && <Card>
        <p className="mb-3 text-xs text-ink-500">{t("auth.roleDemo")}: <span className="font-bold text-ink-800">{user ? t(`role.${user.role}`) : "—"}</span></p>
        {usersErr && <p className="mb-2 text-xs text-red-600">{usersErr}</p>}
        <table className="w-full"><tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-ink-50 last:border-0">
              <td className="table-td font-semibold">{u.name}<span className="block text-[11px] font-normal text-ink-400">{u.email}{u.id === user?.id ? " · you" : ""}</span></td>
              <td className="table-td text-right">
                {user?.role === "owner" ? (
                  <select className="input !w-auto !py-1.5 !text-xs" value={u.role} onChange={(e) => changeRole(u.id, e.target.value as Role)}>
                    {(["owner", "admin", "manager", "employee", "viewer"] as Role[]).map((r) => (<option key={r} value={r}>{t(`role.${r}`)}</option>))}
                  </select>
                ) : (
                  <span className="badge bg-ink-100 text-ink-700">{t(`role.${u.role}`)}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody></table></Card>}
      {tab === 2 && <Card><div className="flex flex-wrap gap-2">{["Owner", "Admin", "Manager", "Employee", "Viewer"].map((r) => (<span key={r} className="badge bg-brand-50 text-brand-800 border border-brand-100">{r}</span>))}</div></Card>}
      {tab === 3 && <Card>
        <p className="text-xs text-ink-500 mb-3">🔒 {t("settings.permNote")}</p>
        {permRows.map((r, i) => (
          <div key={r.en} className="flex items-center justify-between gap-3 border-b border-ink-50 py-2.5 last:border-0">
            <span className="text-sm font-medium text-ink-800">{lang === "ja" ? r.ja : r.en}</span>
            <div className="flex gap-1">{(["AUTO", "APPROVAL", "RESTRICTED"] as PermissionLevel[]).map((l) => (
              <button key={l} onClick={() => { setPerms((p) => ({ ...p, [i]: l })); setSaved(false); }} className={`badge border cursor-pointer ${perms[i] === l ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-500 border-ink-200"}`}>{t(`common.${l === "AUTO" ? "auto" : l === "APPROVAL" ? "approval" : "restricted"}`)}</button>
            ))}</div>
          </div>
        ))}
        <div className="mt-3 flex items-center gap-3"><button className="btn-primary" onClick={() => setSaved(true)}>{t("common.save")}</button><StatusBadge level="APPROVAL" /></div>
      </Card>}
      {tab >= 4 && <Card><p className="text-sm text-ink-600">{t("trust.note")}</p></Card>}
    </div>
  );
}
