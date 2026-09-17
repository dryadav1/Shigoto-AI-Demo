import { useI18n } from "../i18n/context";
import { Card, StatusBadge, DemoBadge } from "../components/ui";

export default function Marketplace() {
  const { t, lang } = useI18n();
  const items = lang === "ja"
    ? ["AI工場長", "AI輸出アシスタント", "AIレストランマネージャー", "AIホテルフロント", "AI建設アシスタント", "AI購買アシスタント"]
    : ["AI Factory Manager", "AI Export Assistant", "AI Restaurant Manager", "AI Hotel Receptionist", "AI Construction Assistant", "AI Procurement Assistant"];
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("market.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("market.sub")}</p></div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((n) => (
          <Card key={n}><p className="font-bold text-ink-900">{n}</p>
          <div className="mt-2"><StatusBadge level="comingSoon" /></div></Card>
        ))}
      </div>
    </div>
  );
}
