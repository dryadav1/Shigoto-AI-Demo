import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, GitBranch, Brain, CheckSquare, ListTodo,
  Plug, BarChart3, ScrollText, Settings, Store, ShieldCheck, Menu, X, Globe, LogOut, Building2, Inbox,
} from "lucide-react";
import { useI18n } from "../i18n/context";
import { useAuth, canAccessEnquiries } from "../auth/context";
import NotificationsBell from "./Notifications";

const main = [
  { to: "/app", icon: LayoutDashboard, key: "nav.dashboard", end: true },
  { to: "/app/employees", icon: Users, key: "nav.employees" },
  { to: "/app/workflows", icon: GitBranch, key: "nav.workflows" },
  { to: "/app/brain", icon: Brain, key: "nav.brain" },
  { to: "/app/approvals", icon: CheckSquare, key: "nav.approvals" },
  { to: "/app/tasks", icon: ListTodo, key: "nav.tasks" },
];
const ops = [
  { to: "/app/integrations", icon: Plug, key: "nav.integrations" },
  { to: "/app/analytics", icon: BarChart3, key: "nav.analytics" },
  { to: "/app/enquiries", icon: Inbox, key: "nav.enquiries", admin: true },
  { to: "/app/activity", icon: ScrollText, key: "nav.activity" },
];
const sys = [
  { to: "/app/marketplace", icon: Store, key: "nav.marketplace" },
  { to: "/app/trust", icon: ShieldCheck, key: "nav.trust" },
  { to: "/app/settings", icon: Settings, key: "nav.settings" },
];

export function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 text-xs font-semibold" role="group" aria-label="Language">
      <Globe size={14} className="ml-1 text-ink-400" />
      {(["ja", "en"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className={`rounded-lg px-2.5 py-1.5 transition ${lang === l ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100"}`}>
          {l === "ja" ? "日本語" : "English"}
        </button>
      ))}
    </div>
  );
}

interface NavItem { to: string; icon: typeof LayoutDashboard; key: string; end?: boolean; admin?: boolean }
function Section({ label, items, onNav }: { label: string; items: NavItem[]; onNav?: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const visible = items.filter((m) => !m.admin || canAccessEnquiries(user));
  if (visible.length === 0) return null;
  return (
    <div>
      <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      {visible.map((m) => (
        <NavLink key={m.to} to={m.to} end={m.end}
          onClick={onNav}
          className={({ isActive }) => `navlink ${isActive ? "navlink-active" : ""}`}>
          <m.icon size={18} /><span>{t(m.key)}</span>
        </NavLink>
      ))}
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const sidebar = (
    <div className="flex h-full flex-col gap-4 p-4">
      <button onClick={() => nav("/app")} className="flex items-center gap-3 rounded-xl px-2 py-1 text-left">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">仕</span>
        <span>
          <span className="block text-sm font-bold text-ink-900">SHIGOTO AI</span>
          <span className="block text-[11px] text-ink-500">{t("brand.tagline")}</span>
        </span>
      </button>
      <div className="flex items-center gap-2 rounded-xl bg-ink-50 border border-ink-100 px-3 py-2 text-xs text-ink-600">
        <Building2 size={14} /><span className="font-semibold">未来テック / Mirai Tech</span>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto scrollthin">
        <Section label={t("nav.sectionMain")} items={main} onNav={() => setOpen(false)} />
        <Section label={t("nav.sectionOps")} items={ops} onNav={() => setOpen(false)} />
        <Section label={t("nav.sectionSystem")} items={sys} onNav={() => setOpen(false)} />
      </nav>
      <div className="space-y-2 border-t border-ink-100 pt-3">
        <LangSwitch />
        <button onClick={() => { logout(); nav("/"); }} className="navlink w-full">
          <LogOut size={18} /><span>{t("nav.logout")}</span>
        </button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden lg:block w-72 shrink-0 border-r border-ink-100 bg-white sticky top-0 h-screen">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-pop fade-in">{sidebar}</aside>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-100 bg-white/90 backdrop-blur px-4 py-3">
          <button className="lg:hidden btn-ghost" onClick={() => setOpen(true)} aria-label="menu"><Menu size={20} /></button>
          <span className="lg:hidden font-bold text-ink-900">SHIGOTO AI</span>
          <div className="ml-auto flex items-center gap-2">
            {canAccessEnquiries(user) && <NotificationsBell />}
            <span className="hidden sm:inline"><LangSwitch /></span>
            <button onClick={() => nav("/")} className="btn-ghost text-xs">{t("nav.landing")}</button>
          </div>
          {open && <button className="lg:hidden btn-ghost" onClick={() => setOpen(false)} aria-label="close"><X size={20} /></button>}
        </header>
        <main className="p-4 sm:p-6 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
