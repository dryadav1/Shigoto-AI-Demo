import { useState } from "react";
import { Search, Upload, FileText } from "lucide-react";
import { useI18n } from "../i18n/context";
import { Card, DemoBadge } from "../components/ui";
import { DEMO } from "../lib/demoData";

export default function Brain() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState(lang === "ja" ? "製品Aの納期ポリシーは？" : "What is the delivery policy for Product A?");
  const [asked, setAsked] = useState(false);
  const [cat, setCat] = useState("all");
  const cats = ["all", "Products", "Pricing", "Customers", "SOPs", "Policies", "Documents", "FAQs"];
  const docs = DEMO.brainDocs.filter((d) => cat === "all" || d.catEn === cat);
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("brain.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("brain.sub")}</p></div>
      <Card>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("brain.ask")} />
          <button className="btn-primary" onClick={() => setAsked(true)}><Search size={16} />{t("brain.askBtn")}</button>
        </div>
        {asked && q && (
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4 fade-in">
            <p className="text-xs font-bold text-brand-800">🤖 {t("brain.answer")}</p>
            <p className="mt-1 text-sm text-ink-800">{lang === "ja" ? DEMO.brainAnswerJa : DEMO.brainAnswerEn}</p>
            <p className="mt-2 text-xs text-ink-500">{t("common.source")}: {lang === "ja" ? "標準納期・配送SOP (SOP-014)" : "Delivery SOP (SOP-014)"} · {lang === "ja" ? "価格表 2026年度" : "Price List FY2026"}</p>
          </div>
        )}
      </Card>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink-900">{t("brain.categories")}</h3>
            <div className="flex gap-1 flex-wrap">{cats.map((c) => (<button key={c} onClick={() => setCat(c)} className={`badge border ${cat === c ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-600 border-ink-200"}`}>{c}</button>))}</div>
          </div>
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.titleEn} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 text-sm">
                <FileText size={18} className="text-brand-700 shrink-0" />
                <div><p className="font-semibold text-ink-900">{lang === "ja" ? d.titleJa : d.titleEn}</p>
                <p className="text-xs text-ink-500">{lang === "ja" ? d.catJa : d.catEn}</p></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink-900 mb-2">{t("brain.upload")}</h3>
          <p className="text-xs text-ink-500 mb-3">{t("brain.uploadHint")}</p>
          <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-8 text-sm text-ink-500 cursor-pointer hover:bg-ink-100">
            <Upload size={20} /><span className="mt-2">PDF / DOCX / TXT / CSV</span>
            <input type="file" className="hidden" multiple onChange={() => alert(lang === "ja" ? "デモ： アップロードをシミュレーションしました。" : "Demo: upload simulated.")} />
          </label>
        </Card>
      </div>
    </div>
  );
}
