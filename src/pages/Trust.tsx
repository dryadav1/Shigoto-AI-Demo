import { Lock, KeyRound, ListChecks, ScrollText, Bot, Database, Plug } from "lucide-react";
import { useI18n } from "../i18n/context";
import { Card, DemoBadge } from "../components/ui";

export default function Trust() {
  const { t, lang } = useI18n();
  const items = [
    { k: "trust.enc", icon: Lock, ja: "通信・保存データの暗号化、 secrets は環境変数で管理しフロントエンドに公開しません。", en: "Encrypt data in transit and at rest. Secrets stay in environment variables, never in frontend code." },
    { k: "trust.access", icon: KeyRound, ja: "役割ベースのアクセス制御（Owner / Admin / Manager / Employee / Viewer）。", en: "Role-based access control (Owner / Admin / Manager / Employee / Viewer)." },
    { k: "trust.perm", icon: ListChecks, ja: "AI権限は 自動 / 要承認 / 制限 の3段階。管理者が設定できます。", en: "Three AI permission levels: AUTO / APPROVAL / RESTRICTED, configurable by admins." },
    { k: "trust.audit", icon: ScrollText, ja: "すべてのAIアクションを監査ログに記録。承認者・結果を保持します。", en: "Every AI action is written to the audit log with approver and result." },
    { k: "trust.control", icon: Bot, ja: "AIは権限外の削除・送信・決済を実行できません。重要操作は人間の承認が必須です。", en: "AI cannot delete, send, or transact outside permissions. Important actions require human approval." },
    { k: "trust.retention", icon: Database, ja: "テナント分離の概念とデータ保持ポリシーを設計に組み込んでいます。", en: "Tenant-isolation concept and data-retention policy built into the design." },
    { k: "trust.integPerm", icon: Plug, ja: "連携ごとの権限範囲を明示。最小権限の原則で接続します。", en: "Explicit per-integration scopes, connected under least-privilege." },
  ];
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="text-2xl font-bold text-ink-900">{t("trust.title")} <DemoBadge /></h1>
      <p className="text-sm text-ink-500 mt-1">{t("trust.sub")}</p>
      <p className="mt-2 rounded-xl bg-ink-50 border border-ink-100 p-3 text-xs text-ink-600">ℹ️ {t("trust.note")}</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((it) => (
          <Card key={it.k}><div className="flex items-center gap-2"><it.icon size={18} className="text-brand-700" /><h3 className="font-bold text-ink-900 text-sm">{t(it.k)}</h3></div>
          <p className="mt-2 text-sm text-ink-600">{lang === "ja" ? it.ja : it.en}</p></Card>
        ))}
      </div>
    </div>
  );
}
