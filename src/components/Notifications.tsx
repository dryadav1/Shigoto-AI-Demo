import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useI18n } from "../i18n/context";
import type { AdminNotification } from "../lib/enquiries";
import { fetchNotifications, markAllNotifsRead, markNotifRead } from "../lib/enquiriesApi";

export default function NotificationsBell() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<AdminNotification[]>([]);

  const load = useCallback(async () => {
    try { setNotifs(await fetchNotifications()); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button className="btn-ghost relative" aria-label={t("notif.title")} onClick={() => { setOpen(!open); if (!open) load(); }}>
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] card p-2 shadow-pop fade-in max-h-[70vh] overflow-auto">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-bold text-ink-900">🔔 {t("notif.title")} {unread > 0 && <span className="badge bg-red-100 text-red-700 ml-1">{unread}</span>}</p>
              <button className="text-xs font-semibold text-brand-700 hover:underline" onClick={async () => { await markAllNotifsRead().catch(() => {}); load(); }}>{t("notif.markAll")}</button>
            </div>
            {notifs.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-400">{t("notif.empty")}</p>}
            {notifs.slice(0, 20).map((n) => (
              <button key={n.id} className={`w-full rounded-xl p-3 text-left hover:bg-ink-50 transition ${n.read ? "" : "bg-brand-50/60"}`}
                onClick={async () => { await markNotifRead(n.id).catch(() => {}); setOpen(false); nav(`/app/enquiries/${n.enquiryId}`); }}>
                <p className="text-[13px] font-bold text-ink-900">{!n.read && "● "}{lang === "ja" ? n.titleJa : n.titleEn}</p>
                <p className="mt-0.5 text-xs text-ink-600">{lang === "ja" ? n.bodyJa : n.bodyEn}</p>
                <p className="mt-1 text-[11px] font-semibold text-brand-700">{t("notif.view")} →</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
