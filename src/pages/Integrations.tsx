import { useState } from "react";
import { useI18n } from "../i18n/context";
import { Card, DemoBadge, Modal } from "../components/ui";
import { integrations } from "../lib/demoData";

export default function Integrations() {
  const { t, lang } = useI18n();
  const [conn, setConn] = useState<Record<string, boolean>>(Object.fromEntries(integrations.map((i) => [i.id, i.connected])));
  const [authFor, setAuthFor] = useState<string | null>(null);
  const cats = ["comm", "crm", "acct", "storage", "cal"];
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("integ.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("integ.sub")}</p>
      <p className="mt-2 inline-block rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800">⚠ {t("integ.demoNote")}</p></div>
      {cats.map((c) => (
        <div key={c}>
          <h2 className="mb-2 text-sm font-bold text-ink-700">{t(`integ.cat${c[0].toUpperCase()}${c.slice(1)}`)}</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {integrations.filter((i) => i.cat === c).map((i) => (
              <Card key={i.id}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white font-bold">{i.name[0]}</span>
                  <div><p className="font-bold text-ink-900 text-sm">{i.name}</p>
                  <p className="text-xs text-ink-500">{lang === "ja" ? i.descJa : i.descEn}</p></div>
                </div>
                <p className={`mt-3 text-xs font-bold ${conn[i.id] ? "text-emerald-700" : "text-ink-400"}`}>● {conn[i.id] ? t("common.connected") : t("common.notConnected")}</p>
                <div className="mt-2 flex gap-2">
                  {conn[i.id] ? (<>
                    <button className="btn-secondary !py-1.5 !px-3 !text-xs flex-1" onClick={() => alert(i.name)}>{t("common.manage")}</button>
                    <button className="btn-ghost !py-1.5 !text-xs" onClick={() => setConn((p) => ({ ...p, [i.id]: false }))}>{t("common.disconnect")}</button>
                  </>) : (
                    <button className="btn-primary !py-1.5 !px-3 !text-xs flex-1" onClick={() => setAuthFor(i.name)}>{t("common.connect")}</button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
      {authFor && (
        <Modal onClose={() => setAuthFor(null)}>
          <h3 className="font-bold text-ink-900">{t("integ.authTitle")} — {authFor}</h3>
          <p className="mt-2 text-sm text-ink-600">{t("integ.authBody")}</p>
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">⚠ {t("integ.demoNote")}</div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => {
              const id = integrations.find((i) => i.name === authFor)?.id;
              if (id) setConn((p) => ({ ...p, [id]: true }));
              setAuthFor(null);
            }}>{t("integ.authorize")}</button>
            <button className="btn-ghost" onClick={() => setAuthFor(null)}>{t("common.cancel")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
