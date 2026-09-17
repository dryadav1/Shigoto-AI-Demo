import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "../i18n/context";
import { useAuth } from "../auth/context";
import { LangSwitch } from "../components/Layout";
import { ApiError } from "../lib/api";

const DEMO_ACCOUNTS = [
  "owner@mirai-tech.jp", "admin@mirai-tech.jp", "manager@mirai-tech.jp",
  "employee@mirai-tech.jp", "viewer@mirai-tech.jp",
];

export default function Login() {
  const { t } = useI18n();
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@mirai-tech.jp");
  const [pw, setPw] = useState("demo-pass");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (em = email, pass = pw) => {
    if (!em || !pass) { setErr(t("auth.error")); return; }
    setBusy(true); setErr("");
    try {
      await login(em, pass);
      nav("/app");
    } catch (e) {
      setErr(e instanceof ApiError && e.status === 401 ? t("auth.invalid") : t("enq.loadError"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 text-white p-12">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-bold text-brand-800">仕</span>
          <span className="font-bold">SHIGOTO AI</span>
        </div>
        <div>
          <p className="text-4xl font-bold leading-tight">「あなたの会社に、<br />AI社員を。」</p>
          <p className="mt-4 text-ink-300">Give your company an AI employee.<br />AI Workforce Operating System for Japanese SMEs.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            {["Gmail / Drive", "Salesforce", "freee"].map((s) => (
              <div key={s} className="rounded-xl bg-white/10 px-3 py-2">✓ {s}</div>
            ))}
          </div>
        </div>
        <p className="text-xs text-ink-400">{t("footer.philosophy")}</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="font-bold text-ink-900">SHIGOTO AI</Link>
            <LangSwitch />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">{t("auth.loginTitle")}</h1>
          <p className="mt-1 text-sm text-ink-500">{t("auth.loginSub")} · {t("auth.company")}</p>
          <div className="mt-6 space-y-4">
            <div><label className="label">{t("auth.email")}</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="label">{t("auth.password")}</label><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn-primary w-full" disabled={busy} onClick={() => go()}>{busy ? t("common.loading") : t("auth.loginBtn")}</button>
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
              <p className="text-xs font-semibold text-ink-600 mb-2">{t("auth.demoAccounts")}</p>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((a) => (
                  <button key={a} className="badge bg-white border border-ink-200 text-ink-600 hover:border-brand-400 hover:text-brand-700 cursor-pointer" onClick={() => { setEmail(a); setPw("demo-pass"); go(a, "demo-pass"); }}>
                    {a.split("@")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
