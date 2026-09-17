import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Check, ShieldCheck, Plug, Brain, BarChart3 } from "lucide-react";
import { useI18n } from "../i18n/context";
import { LangSwitch } from "../components/Layout";

export default function Landing() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const employees = ["secretary", "sales", "knowledge", "hr", "finance", "marketing", "ops", "translator"];
  return (
    <div className="min-h-screen bg-white fade-in">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 font-bold text-white">仕</span>
          <span className="font-bold text-ink-900">SHIGOTO AI</span>
          <nav className="ml-6 hidden md:flex gap-5 text-sm text-ink-600">
            <a href="#solution" className="hover:text-ink-900">{t("landing.solution")}</a>
            <a href="#how" className="hover:text-ink-900">{t("landing.how")}</a>
            <Link to="/pricing" className="hover:text-ink-900">{t("landing.pricing")}</Link>
            <Link to="/pilot" className="hover:text-ink-900">Japan Pilot</Link>
            <a href="#faq" className="hover:text-ink-900">{t("landing.faq")}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitch />
            <button className="btn-ghost !text-sm" onClick={() => nav("/login")}>{t("landing.login")}</button>
            <button className="btn-primary !py-2" onClick={() => nav("/pilot")}>{t("landing.ctaPilot")}</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center">
        <p className="badge bg-brand-50 text-brand-800 border border-brand-100 mx-auto">SHIGOTO AI · {t("brand.sub")}</p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl sm:text-5xl font-bold leading-tight text-ink-900">
          {lang === "ja" ? "「あなたの会社に、AI社員を。」" : "Give your company an AI employee."}
        </h1>
        <p className="mt-3 font-semibold text-ink-700">{t("landing.heroSub")}</p>
        <p className="mx-auto mt-3 max-w-2xl text-ink-500">{t("landing.heroDesc")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn-primary !px-6 !py-3" onClick={() => nav("/pilot")}>{t("landing.ctaPilot")}<ArrowRight size={16} /></button>
          <button className="btn-secondary !px-6 !py-3" onClick={() => nav("/login")}><Play size={16} />{t("landing.ctaDemo")}</button>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          {[["Gmail", t("common.connected")], ["Salesforce", t("common.connected")], ["freee", t("common.connected")], ["Drive", t("common.connected")]].map(([n, s]) => (
            <div key={n} className="card p-3 text-sm"><p className="font-bold text-ink-900">{n}</p><p className="text-xs text-emerald-700 font-semibold">● {s}</p></div>
          ))}
        </div>
      </section>

      <section id="solution" className="border-t border-ink-100 bg-ink-50/60">
        <div className="mx-auto max-w-6xl px-4 py-14 grid md:grid-cols-3 gap-4">
          {[
            { icon: Plug, h: "Connect", ja: "既存ツールをそのまま接続", en: "Connect your existing business tools without replacing them.", },
            { icon: Brain, h: "Deploy", ja: "AI社員と会社ブレインを配置", en: "Deploy AI employees backed by your Company Brain.", },
            { icon: ShieldCheck, h: "Control", ja: "承認フローで人間が管理", en: "Keep humans in control with approvals and audit logs.", },
          ].map((c) => (
            <div key={c.h} className="card p-6"><c.icon className="text-brand-700" /><h3 className="mt-2 font-bold text-ink-900">{c.h}</h3>
            <p className="mt-1 text-sm text-ink-600">{lang === "ja" ? c.ja : c.en}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold text-ink-900 text-center">AI {t("nav.employees")}</h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {employees.map((e, i) => (
            <div key={e} className="card p-4">
              <p className="font-bold text-ink-900 text-sm">{t(`emp.${e}.name`)}</p>
              <p className="mt-1 text-xs text-ink-500">{t(`emp.${e}.desc`)}</p>
              <p className={`mt-2 badge border ${i < 3 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-ink-100 text-ink-600 border-ink-200"}`}>{i < 3 ? t("common.active") : t("common.comingSoon")}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-t border-ink-100 bg-ink-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-center">{t("landing.how")}</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-0">
            {(lang === "ja" ? ["メール受信", "AIが分析・検索", "下書き作成", "人間が承認", "送信・CRM更新"] : ["Receive email", "AI analyzes & searches", "Draft created", "Human approves", "Send & update CRM"]).map((s, i, a) => (
              <div key={s}><div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-ink-900 text-sm">{i + 1}</span><span className="font-semibold text-sm">{s}</span></div>{i < a.length - 1 && <div className="mx-auto my-1 h-5 w-0.5 bg-white/30" />}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 grid md:grid-cols-3 gap-4">
        {[
          { p: "Pilot", price: "¥30,000–¥50,000/mo" },
          { p: "Business", price: "¥100,000–¥200,000/mo" },
          { p: "Enterprise", price: "Custom" },
        ].map((x) => (
          <div key={x.p} className="card p-6 text-center"><p className="font-bold text-ink-900">{t(`pricing.${x.p.toLowerCase()}`)}</p><p className="mt-2 text-2xl font-bold text-brand-800">{x.price}</p>
          <div className="mt-3 space-y-1 text-xs text-ink-500">{["AI employees", "Workflows", "Company Brain", "Analytics"].map((f) => (<p key={f}><Check size={12} className="inline text-emerald-600" /> {f}</p>))}</div></div>
        ))}
      </section>
      <p className="text-center text-xs text-ink-400 pb-4">{t("pricing.note")}</p>

      <section id="faq" className="border-t border-ink-100 bg-ink-50/60">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl font-bold text-ink-900 text-center">{t("help.faq")}</h2>
          <div className="mt-6 space-y-3">
            {(lang === "ja" ? [
              ["既存ツールを置き換える必要はありますか？", "いいえ。Gmail・Salesforce・freeeなどに接続し、置き換えずにAI化します。"],
              ["AIが勝手に送信しませんか？", "外部送信は要承認が標準です。承認なしに送信しません。"],
              ["料金は確定ですか？", "いいえ。試験的な価格であり、市場検証済みではありません。"],
            ] : [
              ["Do we need to replace our tools?", "No. SHIGOTO AI connects to Gmail, Salesforce, freee and others without replacement."],
              ["Will AI send messages on its own?", "No. External sending requires approval by default."],
              ["Is pricing final?", "No. Pricing is experimental and not market-validated."],
            ]).map(([q, a]) => (
              <div key={q} className="card p-4"><p className="font-bold text-sm text-ink-900">{q}</p><p className="mt-1 text-sm text-ink-600">{a}</p></div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-ink-500"><BarChart3 size={16} />{t("footer.philosophy")}</div>
        </div>
      </section>
      <footer className="border-t border-ink-100 py-6 text-center text-xs text-ink-400">{t("footer.rights")}</footer>
    </div>
  );
}
