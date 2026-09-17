import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldAlert } from "lucide-react";
import { useI18n } from "../i18n/context";
import { useAuth, canAccessEnquiries } from "../auth/context";
import { Card, DemoBadge, Empty } from "../components/ui";
import {
  INDUSTRIES, STATUSES, TEAM, industryById, memberById,
  type Enquiry, type EnquiryStatus,
} from "../lib/enquiries";
import { fetchEnquiries, fetchStats, type EnquiryStats } from "../lib/enquiriesApi";

export const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: "bg-blue-100 text-blue-800 border border-blue-200",
  reviewing: "bg-violet-100 text-violet-800 border border-violet-200",
  contacted: "bg-sky-100 text-sky-800 border border-sky-200",
  demo: "bg-amber-100 text-amber-800 border border-amber-200",
  pilot: "bg-brand-50 text-brand-800 border border-brand-200",
  converted: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  not_suitable: "bg-ink-100 text-ink-500 border border-ink-200",
  closed: "bg-ink-100 text-ink-600 border border-ink-200",
};

export function statusKey(s: EnquiryStatus): string {
  return { new: "enq.sNew", reviewing: "enq.sReviewing", contacted: "enq.sContacted", demo: "enq.sDemo", pilot: "enq.sPilot", converted: "enq.sConverted", not_suitable: "enq.sNotSuitable", closed: "enq.sClosed" }[s];
}

export function relDate(iso: string, lang: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return lang === "ja" ? "今日" : "Today";
  if (days === 1) return lang === "ja" ? "昨日" : "Yesterday";
  return lang === "ja" ? `${days}日前` : `${days} days ago`;
}

export function AccessDenied() {
  const { t } = useI18n();
  return (
    <div className="fade-in"><Card className="text-center py-14">
      <ShieldAlert size={32} className="mx-auto text-ink-300" />
      <h1 className="mt-3 text-xl font-bold text-ink-900">{t("enq.denied")}</h1>
      <p className="mt-1 text-sm text-ink-500">{t("enq.deniedSub")}</p>
    </Card></div>
  );
}

const EMPTY_STATS: EnquiryStats = {
  total: 0, byStatus: { new: 0, reviewing: 0, contacted: 0, demo: 0, pilot: 0, converted: 0, not_suitable: 0, closed: 0 },
};

export default function Enquiries() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fInd, setFInd] = useState("all");
  const [fSize, setFSize] = useState("all");
  const [fAssign, setFAssign] = useState("all");
  const [sort, setSort] = useState("new");
  const [showArch, setShowArch] = useState(false);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState<EnquiryStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setFailed(false);
    try {
      const [list, st] = await Promise.all([
        fetchEnquiries({ q, status: fStatus, industry: fInd, size: fSize, assigned: fAssign, sort, archived: showArch, page, limit: 20 }),
        fetchStats(),
      ]);
      setRows(list.rows); setTotal(list.total); setPages(list.pages); setStats(st);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [q, fStatus, fInd, fSize, fAssign, sort, showArch, page]);

  useEffect(() => { if (canAccessEnquiries(user)) load(); }, [load, user]);

  if (!canAccessEnquiries(user)) return <AccessDenied />;

  const cards = [
    { label: t("enq.total"), v: stats.total },
    { label: t("enq.sNew"), v: stats.byStatus.new },
    { label: t("enq.sContacted"), v: stats.byStatus.contacted },
    { label: t("enq.sDemo"), v: stats.byStatus.demo },
    { label: t("enq.sPilot"), v: stats.byStatus.pilot },
    { label: t("enq.sConverted"), v: stats.byStatus.converted },
  ];
  const resetPage = (fn: (v: string) => void) => (value: string) => { fn(value); setPage(1); };

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-ink-900">{t("enq.title")} <DemoBadge /></h1>
        <p className="text-sm text-ink-500 mt-1">{t("enq.sub")}</p></div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <Card key={c.label}><p className="text-2xl font-bold text-ink-900">{c.v}</p><p className="text-[11px] text-ink-500">{c.label}</p></Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col xl:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input !pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t("enq.searchPh")} />
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="input !w-auto" value={fStatus} onChange={(e) => resetPage(setFStatus)(e.target.value)}>
              <option value="all">{t("enq.fStatus")}: {t("enq.fAll")}</option>
              {STATUSES.map((s) => (<option key={s} value={s}>{t(statusKey(s))}</option>))}
            </select>
            <select className="input !w-auto" value={fInd} onChange={(e) => resetPage(setFInd)(e.target.value)}>
              <option value="all">{t("enq.fIndustry")}: {t("enq.fAll")}</option>
              {INDUSTRIES.map((i) => (<option key={i.id} value={i.id}>{lang === "ja" ? i.ja : i.en}</option>))}
            </select>
            <select className="input !w-auto" value={fSize} onChange={(e) => resetPage(setFSize)(e.target.value)}>
              <option value="all">{t("enq.fSize")}: {t("enq.fAll")}</option>
              {(["s1", "s2", "s3", "s4"] as const).map((s) => (<option key={s} value={s}>{t(`enq.${s === "s1" ? "size1" : s === "s2" ? "size2" : s === "s3" ? "size3" : "size4"}`)}</option>))}
            </select>
            <select className="input !w-auto" value={fAssign} onChange={(e) => resetPage(setFAssign)(e.target.value)}>
              <option value="all">{t("enq.fAssigned")}: {t("enq.fAll")}</option>
              <option value="none">{t("enq.unassigned")}</option>
              {TEAM.map((m) => (<option key={m.id} value={m.id}>{lang === "ja" ? m.ja : m.en}</option>))}
            </select>
            <select className="input !w-auto" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              <option value="new">{t("enq.sortNew")}</option>
              <option value="old">{t("enq.sortOld")}</option>
              <option value="upd">{t("enq.sortUpd")}</option>
            </select>
          </div>
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs text-ink-500">
          <input type="checkbox" checked={showArch} onChange={(e) => { setShowArch(e.target.checked); setPage(1); }} className="accent-blue-700" />
          {t("enq.showArchived")}
        </label>
      </Card>

      <Card pad={false}>
        {loading ? <p className="p-8 text-center text-sm text-ink-400">{t("common.loading")}</p>
        : failed ? <div className="p-5"><Empty text={t("enq.loadError")} /></div>
        : rows.length === 0 ? <div className="p-5"><Empty text={t("common.empty")} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-ink-100 bg-ink-50/60"><tr>
                <th className="table-th">ID</th><th className="table-th">{t("enq.company")}</th><th className="table-th">{t("enq.contact")}</th>
                <th className="table-th">{t("enq.industry")}</th><th className="table-th">{t("enq.employees")}</th>
                <th className="table-th">{t("enq.date")}</th><th className="table-th">{t("enq.status")}</th>
              </tr></thead>
              <tbody>
                {rows.map((e) => {
                  const m = memberById(e.assignedTo);
                  return (
                    <tr key={e.id} className="border-b border-ink-50 last:border-0 hover:bg-brand-50/40 cursor-pointer transition" onClick={() => nav(`/app/enquiries/${e.id}`)}>
                      <td className="table-td font-mono text-xs font-bold text-brand-800">{e.id}</td>
                      <td className="table-td font-semibold">{lang === "ja" ? e.companyJa : e.companyEn}</td>
                      <td className="table-td">{lang === "ja" ? e.contactJa : e.contactEn}
                        {m && <span className="block text-[11px] text-ink-400">→ {lang === "ja" ? m.ja : m.en}</span>}
                      </td>
                      <td className="table-td">{lang === "ja" ? industryById(e.industryId).ja : industryById(e.industryId).en}</td>
                      <td className="table-td">{e.employeeCount}</td>
                      <td className="table-td text-xs">{relDate(e.createdAt, lang)}</td>
                      <td className="table-td"><span className={`badge ${STATUS_STYLE[e.status]}`}>{t(statusKey(e.status))}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-xs text-ink-500">{total} / {page} / {pages}</span>
          <div className="flex gap-2">
            <button className="btn-secondary !py-1.5 !px-3 !text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>←</button>
            <button className="btn-secondary !py-1.5 !px-3 !text-xs" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>→</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
