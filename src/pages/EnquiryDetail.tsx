import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, CalendarPlus, Rocket, Archive, ArchiveRestore, StickyNote } from "lucide-react";
import { useI18n } from "../i18n/context";
import { useAuth, canAccessEnquiries } from "../auth/context";
import { Card, DemoBadge, Modal, Empty } from "../components/ui";
import {
  STATUSES, TEAM, industryById, memberById,
  type Enquiry, type EnquiryStatus,
} from "../lib/enquiries";
import { convertEnquiry, fetchEnquiry, patchEnquiry, postEnquiryNote } from "../lib/enquiriesApi";
import { ApiError } from "../lib/api";
import { AccessDenied, STATUS_STYLE, relDate, statusKey } from "./Enquiries";

const STAGES = ["enq.stageEnquiry", "enq.stageLead", "enq.stageDemo", "enq.stagePilot", "enq.stageCustomer", "enq.stageSub"];
const STAGE_FOR: Record<EnquiryStatus, number> = {
  new: 0, reviewing: 1, contacted: 1, demo: 2, pilot: 3, converted: 4, not_suitable: 0, closed: 0,
};

export default function EnquiryDetail() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const { id } = useParams();
  const [e, setE] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [actionErr, setActionErr] = useState("");
  const [modal, setModal] = useState<"contact" | "demo" | "convert" | null>(null);
  const [demoDate, setDemoDate] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true); setFailed(false);
    try {
      setE(await fetchEnquiry(id));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { if (canAccessEnquiries(user)) load(); }, [load, user]);

  if (!canAccessEnquiries(user)) return <AccessDenied />;
  if (loading) return <div className="fade-in"><Card><p className="py-10 text-center text-sm text-ink-400">{t("common.loading")}</p></Card></div>;
  if (failed || !e) return <div className="fade-in"><Card><Empty text={t("enq.loadError")} /></Card></div>;

  const mutate = async (fn: () => Promise<Enquiry>) => {
    setActionErr("");
    try {
      setE(await fn());
    } catch (err) {
      setActionErr(err instanceof ApiError && (err.status === 422 || err.status === 409)
        ? t("enq.badTransition") : t("enq.loadError"));
    }
  };

  const ind = industryById(e.industryId);
  const asg = memberById(e.assignedTo);
  const stage = STAGE_FOR[e.status];
  const closedish = e.status === "closed" || e.status === "not_suitable";

  const doContact = (markContacted: boolean) =>
    mutate(async () => {
      let cur = e;
      if (markContacted) cur = await patchEnquiry(e.id, { status: "contacted" });
      const text = lang === "ja" ? "メールで連絡した。" : "Contacted via email.";
      return postEnquiryNote(cur.id, text);
    }).then(() => setModal(null));

  return (
    <div className="space-y-5 fade-in">
      <button className="btn-ghost !px-2" onClick={() => nav("/app/enquiries")}><ArrowLeft size={16} />{t("enq.back")}</button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold text-brand-800">{e.id} <DemoBadge /></h1>
          <p className="mt-1 text-lg font-bold text-ink-900">{lang === "ja" ? e.companyJa : e.companyEn}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${STATUS_STYLE[e.status]}`}>{t(statusKey(e.status))}</span>
          <select className="input !w-auto" value={e.status} onChange={(e2) => mutate(() => patchEnquiry(e.id, { status: e2.target.value as EnquiryStatus }))}>
            {STATUSES.map((s) => (<option key={s} value={s}>{t(statusKey(s))}</option>))}
          </select>
        </div>
      </div>
      {actionErr && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{actionErr}</div>}

      <Card>
        <h3 className="text-sm font-semibold text-ink-900 mb-3">{t("enq.pipeline")}</h3>
        <div className="flex items-center gap-1 overflow-x-auto scrollthin">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1 min-w-[90px]">
              <div className={`flex-1 rounded-xl px-2 py-2 text-center text-[11px] font-bold transition ${i < stage ? "bg-emerald-100 text-emerald-800" : i === stage ? (closedish ? "bg-ink-200 text-ink-600" : "bg-ink-900 text-white") : "bg-ink-50 text-ink-400"}`}>
                {i < stage ? "✓ " : ""}{t(s)}
              </div>
              {i < STAGES.length - 1 && <span className="text-ink-300">›</span>}
            </div>
          ))}
        </div>
        {e.pilotId && <p className="mt-2 text-xs font-bold text-brand-800">🚀 {t("enq.pilotId")}: <span className="font-mono">{e.pilotId}</span> · {t("enq.converted")}</p>}
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-ink-900 mb-3">{t("enq.detailTitle")}</h3>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt className="text-xs text-ink-500">{t("enq.company")}</dt><dd className="font-semibold text-ink-900">{lang === "ja" ? e.companyJa : e.companyEn}</dd></div>
            <div><dt className="text-xs text-ink-500">{t("enq.contact")}</dt><dd className="font-semibold text-ink-900">{lang === "ja" ? e.contactJa : e.contactEn}</dd></div>
            <div><dt className="text-xs text-ink-500">{t("enq.email")}</dt><dd><a className="font-semibold text-brand-700 hover:underline" href={`mailto:${e.email}`}>{e.email}</a></dd></div>
            <div><dt className="text-xs text-ink-500">{t("enq.phone")}</dt><dd className="font-semibold text-ink-900">{e.phone || "—"}</dd></div>
            <div><dt className="text-xs text-ink-500">{t("enq.industry")}</dt><dd className="font-semibold text-ink-900">{lang === "ja" ? ind.ja : ind.en}</dd></div>
            <div><dt className="text-xs text-ink-500">{t("enq.employees")}</dt><dd className="font-semibold text-ink-900">{e.employeeCount}</dd></div>
            <div><dt className="text-xs text-ink-500">{t("enq.date")}</dt><dd className="font-semibold text-ink-900">{relDate(e.createdAt, lang)}</dd></div>
            <div><dt className="text-xs text-ink-500">{t("enq.assigned")}</dt><dd className="font-semibold text-ink-900">{asg ? (lang === "ja" ? asg.ja : asg.en) : t("enq.unassigned")}</dd></div>
            {e.demoDate && <div><dt className="text-xs text-ink-500">{t("enq.demoDate")}</dt><dd className="font-semibold text-ink-900">📅 {e.demoDate.slice(0, 10)}</dd></div>}
          </dl>
          <div className="mt-4 space-y-3 text-sm">
            <div><p className="text-xs text-ink-500">{t("enq.software")}</p><div className="mt-1 flex flex-wrap gap-1.5">{e.currentSoftware.map((s) => (<span key={s} className="badge bg-ink-100 text-ink-700 border border-ink-200">{s}</span>))}</div></div>
            <div><p className="text-xs text-ink-500">{t("enq.problem")}</p><p className="mt-0.5 text-ink-800">{lang === "ja" ? e.problemJa : e.problemEn}</p></div>
            <div><p className="text-xs text-ink-500">{t("enq.automation")}</p><p className="mt-0.5 text-ink-800">{lang === "ja" ? e.automationJa : e.automationEn}</p></div>
            {e.message && <div><p className="text-xs text-ink-500">{t("enq.message")}</p><p className="mt-0.5 rounded-xl bg-ink-50 border border-ink-100 p-3 text-ink-800 whitespace-pre-line">{e.message}</p></div>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-ink-900 mb-3">{t("common.actions")}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button className="btn-secondary !px-2" onClick={() => setModal("contact")}><Mail size={14} />{t("enq.contactBtn")}</button>
              <button className="btn-secondary !px-2" onClick={() => setModal("demo")}><CalendarPlus size={14} />{t("enq.scheduleBtn")}</button>
              <button className="btn-primary !px-2 col-span-2" onClick={() => setModal("convert")}><Rocket size={14} />{t("enq.convertBtn")}</button>
            </div>
            <div className="mt-3">
              <label className="label">{t("enq.assigned")}</label>
              <select className="input" value={e.assignedTo ?? ""} onChange={(ev) => mutate(() => patchEnquiry(e.id, { assignedTo: ev.target.value || null }))}>
                <option value="">{t("enq.unassigned")}</option>
                {TEAM.map((m) => (<option key={m.id} value={m.id}>{lang === "ja" ? m.ja : m.en}</option>))}
              </select>
            </div>
            <button className="btn-ghost w-full mt-2 !text-xs" onClick={() => mutate(() => patchEnquiry(e.id, { archived: !e.archived }))}>
              {e.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}{e.archived ? t("enq.unarchive") : t("enq.archive")}
            </button>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900 mb-2"><StickyNote size={14} className="inline mr-1" />{t("enq.notes")}</h3>
            <div className="space-y-2 max-h-56 overflow-auto scrollthin">
              {e.internalNotes.length === 0 && <p className="text-xs text-ink-400">—</p>}
              {[...e.internalNotes].reverse().map((n) => {
                const a = memberById(n.authorId);
                return (
                  <div key={n.id} className="rounded-xl bg-ink-50 border border-ink-100 p-2.5 text-xs">
                    <p className="text-ink-800">{n.text}</p>
                    <p className="mt-1 text-ink-400">{a ? (lang === "ja" ? a.ja : a.en) : n.authorId} · {relDate(n.createdAt, lang)}</p>
                  </div>
                );
              })}
            </div>
            <textarea className="input mt-2 min-h-[64px] !text-xs" value={note} onChange={(ev) => setNote(ev.target.value)} placeholder={t("enq.notePh")} />
            <button className="btn-secondary w-full mt-2 !py-2 !text-xs" disabled={!note.trim()} onClick={() => mutate(() => postEnquiryNote(e.id, note.trim())).then(() => setNote(""))}>{t("enq.addNote")}</button>
          </Card>
        </div>
      </div>

      {modal === "contact" && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="font-bold text-ink-900">✉️ {t("enq.contactTitle")} — {e.id}</h3>
          <p className="mt-1 text-sm text-ink-500">{t("enq.contactBody")}</p>
          <div className="mt-3 rounded-xl bg-ink-50 border border-ink-100 p-3 text-xs text-ink-600">
            To: {e.email}<br />Subject: SHIGOTO AI Japan Pilot — {lang === "ja" ? e.companyJa : e.companyEn}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a className="btn-secondary" href={`mailto:${e.email}?subject=${encodeURIComponent("SHIGOTO AI Japan Pilot")}`}>{t("enq.openMail")}</a>
            <button className="btn-primary" onClick={() => doContact(true)}>{t("enq.markContacted")}</button>
            <button className="btn-ghost ml-auto" onClick={() => setModal(null)}>{t("common.close")}</button>
          </div>
        </Modal>
      )}
      {modal === "demo" && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="font-bold text-ink-900">📅 {t("enq.scheduleTitle")} — {e.id}</h3>
          <label className="label mt-3">{t("enq.pickDate")}</label>
          <input type="date" className="input" value={demoDate} onChange={(ev) => setDemoDate(ev.target.value)} />
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!demoDate} onClick={() => mutate(() => patchEnquiry(e.id, { status: "demo", demoDate: new Date(demoDate).toISOString() })).then(() => setModal(null))}>{t("enq.confirm")}</button>
            <button className="btn-ghost" onClick={() => setModal(null)}>{t("common.cancel")}</button>
          </div>
        </Modal>
      )}
      {modal === "convert" && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="font-bold text-ink-900">🚀 {t("enq.convertTitle")} — {e.id}</h3>
          <p className="mt-2 text-sm text-ink-600">{t("enq.convertBody")}</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => mutate(() => convertEnquiry(e.id)).then(() => setModal(null))}>{t("enq.convertGo")}</button>
            <button className="btn-ghost" onClick={() => setModal(null)}>{t("common.cancel")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
