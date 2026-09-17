import type { ReactNode } from "react";
import { useI18n } from "../i18n/context";

export function Card({ children, className = "", pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <div className={`card ${pad ? "p-5" : ""} ${className}`}>{children}</div>;
}
export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-ink-900">{children}</h3>
      {right}
    </div>
  );
}
export function DemoBadge() {
  const { t } = useI18n();
  return <span className="badge bg-amber-100 text-amber-800 border border-amber-200">{t("common.demoBadge")} · {t("common.demo")}</span>;
}
export function StatusBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    AUTO: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    APPROVAL: "bg-amber-100 text-amber-800 border border-amber-200",
    RESTRICTED: "bg-red-100 text-red-800 border border-red-200",
    pending: "bg-amber-100 text-amber-800 border border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    rejected: "bg-red-100 text-red-800 border border-red-200",
    done: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    waiting: "bg-amber-100 text-amber-800 border border-amber-200",
    active: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    Low: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    Medium: "bg-amber-100 text-amber-800 border border-amber-200",
    High: "bg-red-100 text-red-800 border border-red-200",
  };
  return <span className={`badge ${map[level] ?? "bg-ink-100 text-ink-700 border border-ink-200"}`}>{level}</span>;
}
export function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-8 text-center text-sm text-ink-500">{text}</div>;
}
export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-6 fade-in max-h-[90vh] overflow-auto">{children}</div>
    </div>
  );
}
