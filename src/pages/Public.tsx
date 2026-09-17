import { useState } from "react";
import type { ReactNode, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Check, PartyPopper } from "lucide-react";
import { useI18n } from "../i18n/context";
import { LangSwitch } from "../components/Layout";
import { INDUSTRIES } from "../lib/enquiries";
import { submitEnquiry } from "../lib/enquiriesApi";

function Shell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-100"><div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-ink-900"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">仕</span>SHIGOTO AI</Link>
        <div className="ml-auto flex gap-2"><LangSwitch /><Link to="/pricing" className="btn-ghost text-sm">{t("pricing.title")}</Link></div>
      </div></header>
      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
      <footer className="border-t border-ink-100 py-6 text-center text-xs text-ink-400">{t("footer.rights")}</footer>
    </div>
  );
}

export function Pilot() {
  const { t, lang } = useI18n();
  const [doneId, setDoneId] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    company: "", contact: "", email: "", phone: "", industryId: "manufacturing",
    employeeCount: "48", software: "Gmail, Salesforce, freee",
    problem: "", automation: "", message: "",
  });
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const feats = ["pilot.f1", "pilot.f2", "pilot.f3", "pilot.f4"];
  const submit = async () => {
    if (!f.company.trim() || !f.contact.trim() || !f.email.trim()) { setErr(t("pilot.required")); return; }
    setBusy(true); setErr("");
    try {
      const r = await submitEnquiry({
        company: f.company.trim(), contact: f.contact.trim(), email: f.email.trim(), phone: f.phone.trim(),
        industryId: f.industryId, employeeCount: parseInt(f.employeeCount, 10) || 0,
        currentSoftware: f.software.split(/[,、]/).map((s) => s.trim()).filter(Boolean),
        problem: f.problem.trim(), automation: f.automation.trim(), message: f.message.trim(),
      });
      setDoneId(r.id);
      window.scrollTo({ top: 0 });
    } catch {
      setErr(t("enq.submitFailed"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell>
      <h1 className="text-3xl font-bold text-ink-900">{t("pilot.title")}</h1>
      <p className="mt-2 text-ink-600">{t("pilot.bodyFull")}</p>
      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        {feats.map((x) => (<div key={x} className="card p-4 text-sm font-semibold text-ink-800"><Check size={15} className="inline text-emerald-600 mr-1" />{t(x)}</div>))}
      </div>
      <div className="card mt-6 p-6">
        <h2 className="font-bold text-ink-900">{t("pilot.formTitle")}</h2>
        {doneId ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center fade-in">
            <PartyPopper size={28} className="mx-auto text-emerald-600" />
            <h3 className="mt-2 text-xl font-bold text-ink-900">{t("pilot.thanks")}</h3>
            <p className="mt-1 text-sm text-ink-600">{lang === "ja" ? "お問い合わせありがとうございます。" : ""} {t("pilot.thanksBody")}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-500">{t("pilot.appId")}</p>
            <p className="font-mono text-2xl font-bold text-brand-800">{doneId}</p>
            <div className="mt-5 flex justify-center gap-2">
              <Link to="/" className="btn-secondary">{t("pilot.backHome")}</Link>
              <Link to="/pricing" className="btn-primary">{t("pricing.title")}</Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div><label className="label">{t("pilot.company")} *</label><input className="input" value={f.company} onChange={set("company")} placeholder="Mirai Tech" /></div>
            <div><label className="label">{t("pilot.name")} *</label><input className="input" value={f.contact} onChange={set("contact")} placeholder="Tanaka" /></div>
            <div><label className="label">{t("pilot.email")} *</label><input className="input" type="email" value={f.email} onChange={set("email")} placeholder="tanaka@company.jp" /></div>
            <div><label className="label">{t("pilot.phone")}</label><input className="input" value={f.phone} onChange={set("phone")} placeholder="03-1234-5678" /></div>
            <div><label className="label">{t("pilot.industry")}</label>
              <select className="input" value={f.industryId} onChange={set("industryId")}>
                {INDUSTRIES.map((i) => (<option key={i.id} value={i.id}>{lang === "ja" ? i.ja : i.en}</option>))}
              </select>
            </div>
            <div><label className="label">{t("pilot.size")}</label><input className="input" type="number" min={1} value={f.employeeCount} onChange={set("employeeCount")} /></div>
            <div className="sm:col-span-2"><label className="label">{t("pilot.software")}</label><input className="input" value={f.software} onChange={set("software")} /></div>
            <div className="sm:col-span-2"><label className="label">{t("pilot.problem")}</label><textarea className="input min-h-[80px]" value={f.problem} onChange={set("problem")} /></div>
            <div className="sm:col-span-2"><label className="label">{t("pilot.automation")}</label><textarea className="input min-h-[80px]" value={f.automation} onChange={set("automation")} /></div>
            <div className="sm:col-span-2"><label className="label">{t("pilot.message")}</label><textarea className="input min-h-[80px]" value={f.message} onChange={set("message")} /></div>
            {err && <p className="sm:col-span-2 text-sm text-red-600">{err}</p>}
            <button className="btn-primary sm:col-span-2" disabled={busy} onClick={submit}>{busy ? t("common.loading") : t("pilot.submit")}</button>
          </div>
        )}
      </div>
    </Shell>
  );
}

export function Pricing() {
  const { t } = useI18n();
  const tiers = [
    { k: "pricing.pilot", price: "¥30,000–¥50,000/mo", feats: ["2 AI employees", "3 workflows", "Core integrations", "Email support"] },
    { k: "pricing.business", price: "¥100,000–¥200,000/mo", feats: ["5 AI employees", "Unlimited workflows", "All integrations", "Company Brain", "Priority support"] },
    { k: "pricing.enterprise", price: "Custom", feats: ["Custom AI employees", "SSO / audit", "Dedicated support"] },
  ];
  return (
    <Shell>
      <h1 className="text-3xl font-bold text-ink-900 text-center">{t("pricing.title")}</h1>
      <p className="mt-2 text-center text-xs text-ink-500">{t("pricing.note")}</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {tiers.map((x) => (
          <div key={x.k} className="card p-6"><p className="font-bold text-ink-900">{t(x.k)}</p>
          <p className="mt-2 text-xl font-bold text-brand-800">{x.price}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-600">{x.feats.map((f) => (<li key={f}><Check size={14} className="inline text-emerald-600 mr-1" />{f}</li>))}</ul>
          <Link to="/pilot" className="btn-primary w-full mt-4">{t("pricing.cta")}</Link></div>
        ))}
      </div>
    </Shell>
  );
}
