import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FileUp, CheckCircle2, Clock, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AddSubjectModal } from "@/components/AddSubjectModal";
import {
  setState,
  useAppState,
  emptyMarks,
  iaTotal,
  markStatus,
  schemeOf,
  totalMarks,
  type FeeSemester,
  type Marks,
  type Subject,
} from "@/lib/store";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics — Marks & Fees | Smart Student Portal" },
      {
        name: "description",
        content:
          "Enter IA 1, IA 2 and external marks per subject, track pass status, and manage semester-wise fees and receipts.",
      },
      { property: "og:title", content: "Academics — Marks & Fees" },
      {
        property: "og:description",
        content: "Semester marks with IA and external pass rules, plus fee tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AcademicsPage,
});

const SUB_TABS = ["Marks", "Fees"] as const;

function AcademicsPage() {
  const [tab, setTab] = useState<(typeof SUB_TABS)[number]>("Marks");

  return (
    <AppShell title="Academics">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl py-2 text-xs font-bold transition-colors ${
              tab === t ? "bg-navy text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">{tab === "Marks" ? <MarksTab /> : <FeesTab />}</div>
    </AppShell>
  );
}

/* ---------------- Marks ---------------- */

function MarksTab() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const semester = state.academicsSemester;
  const list = state.subjects.filter((s) => s.semester === semester);

  const statuses = list.map((s) => markStatus(state.marks?.[s.id] ?? emptyMarks, s));
  const passed = statuses.filter((x) => x === "pass").length;
  const atRisk = statuses.filter((x) => x === "fail").length;
  const scored = list
    .map((s) => totalMarks(state.marks?.[s.id] ?? emptyMarks))
    .filter((x): x is number => x != null);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
        <label className="block text-xs font-semibold text-muted-foreground">
          Current Semester
          <select
            value={semester}
            onChange={(e) => setState((s) => ({ ...s, academicsSemester: Number(e.target.value) }))}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-sky"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Semester {n}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-sky px-3 py-2.5 text-xs font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </div>

      <section className="grid grid-cols-3 gap-2 rounded-2xl bg-navy p-3 text-primary-foreground">
        <Stat label="Passed" value={String(passed)} />
        <Stat label="At risk" value={String(atRisk)} />
        <Stat label="Average" value={`${avg}%`} />
      </section>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
          No subjects for Semester {semester}. Use “+ Add Subject” to create one.
        </p>
      ) : (
        list.map((s) => <MarkCard key={s.id} subject={s} marks={state.marks?.[s.id] ?? emptyMarks} />)
      )}

      <AddSubjectModal open={open} defaultSemester={semester} onClose={() => setOpen(false)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-white/70">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}

function MarkCard({ subject, marks }: { subject: Subject; marks: Marks }) {
  const rules = schemeOf(subject);
  const ia = iaTotal(marks);
  const total = totalMarks(marks);
  const status = markStatus(marks, subject);

  function update(patch: Partial<Marks>) {
    setState((s) => ({
      ...s,
      marks: { ...(s.marks ?? {}), [subject.id]: { ...emptyMarks, ...(s.marks?.[subject.id] ?? {}), ...patch } },
    }));
  }

  const badge =
    status === "pass"
      ? "bg-teal text-accent-foreground"
      : status === "fail"
        ? "bg-destructive text-destructive-foreground"
        : "bg-secondary text-muted-foreground";

  return (
    <article className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-navy">{subject.name}</h3>
          <p className="text-[11px] text-muted-foreground">
            {subject.code} · {subject.type}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${badge}`}>
          {status === "pass" ? "Pass" : status === "fail" ? "Fail" : "Incomplete"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <NumField
          label={`IA 1 /${rules.iaMax}`}
          max={rules.iaMax}
          value={marks.ia1}
          onChange={(v) => update({ ia1: v })}
        />
        <NumField
          label={`IA 2 /${rules.iaMax}`}
          max={rules.iaMax}
          value={marks.ia2}
          onChange={(v) => update({ ia2: v })}
        />
        <NumField
          label={`Ext /${rules.externalMax}`}
          max={rules.externalMax}
          value={marks.external}
          onChange={(v) => update({ external: v })}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold text-muted-foreground">
        <span>
          IA Total: {ia ?? "—"}/{rules.iaTotalMax} (pass {rules.iaPass})
        </span>
        <span>
          External: {marks.external ?? "—"}/{rules.externalMax} (pass {rules.externalPass})
        </span>
        <span>
          Overall: {total ?? "—"}/{rules.overallMax}
        </span>
      </div>
    </article>
  );
}

function NumField({
  label,
  max,
  value,
  onChange,
}: {
  label: string;
  max: number;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="block text-[11px] font-semibold text-muted-foreground">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          const n = Number(raw);
          if (!Number.isFinite(n)) return;
          onChange(Math.max(0, Math.min(max, n)));
        }}
        className="mt-1 w-full rounded-xl border border-border bg-background px-2 py-2 text-sm font-bold text-navy outline-none focus:border-sky"
      />
    </label>
  );
}

/* ---------------- Fees ---------------- */

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function FeesTab() {
  const { fees } = useAppState();
  const totalPaid = fees.reduce((a, f) => a + f.paid, 0);
  const totalDue = fees.reduce((a, f) => a + Math.max(0, f.total - f.paid), 0);

  return (
    <div>
      <section className="grid grid-cols-2 gap-3 rounded-2xl bg-navy p-4 text-primary-foreground">
        <div>
          <p className="text-[11px] text-white/70">Total Paid</p>
          <p className="text-xl font-extrabold">{inr(totalPaid)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/70">Total Due</p>
          <p className="text-xl font-extrabold text-teal">{inr(totalDue)}</p>
        </div>
      </section>

      <div className="mt-4 space-y-3">
        {fees.map((f) => (
          <SemesterCard key={f.semester} fee={f} />
        ))}
      </div>
    </div>
  );
}

function SemesterCard({ fee }: { fee: FeeSemester }) {
  const paidFull = fee.paid >= fee.total;
  const fileRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("");

  function update(patch: Partial<FeeSemester>) {
    setState((s) => ({
      ...s,
      fees: s.fees.map((x) => (x.semester === fee.semester ? { ...x, ...patch } : x)),
    }));
  }

  return (
    <article
      className={`rounded-2xl p-4 shadow-sm ${paidFull ? "bg-teal text-accent-foreground" : "bg-card"}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h3 className={`truncate text-sm font-bold ${paidFull ? "" : "text-navy"}`}>
          Semester {fee.semester}
        </h3>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            paidFull ? "bg-white/20" : "bg-secondary text-muted-foreground"
          }`}
        >
          {paidFull ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {paidFull ? "Paid" : "Pending"}
        </span>
      </div>

      <div
        className={`mt-2 flex gap-4 text-[11px] ${paidFull ? "text-white/85" : "text-muted-foreground"}`}
      >
        <span>Total: {inr(fee.total)}</span>
        <span>Paid: {inr(fee.paid)}</span>
        <span>Due: {inr(Math.max(0, fee.total - fee.paid))}</span>
      </div>

      {!paidFull ? (
        <div className="mt-3 flex gap-2">
          <input
            inputMode="numeric"
            placeholder="Add payment ₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-sky"
          />
          <button
            onClick={() => {
              const n = Number(amount);
              if (!Number.isFinite(n) || n <= 0) return;
              update({ paid: Math.min(fee.total, fee.paid + n) });
              setAmount("");
            }}
            className="shrink-0 rounded-xl bg-sky px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            Save
          </button>
        </div>
      ) : null}

      <button
        onClick={() => fileRef.current?.click()}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold ${
          paidFull ? "bg-white/20" : "bg-navy text-primary-foreground"
        }`}
      >
        <FileUp className="h-4 w-4" />
        {fee.receipt ? `Receipt: ${fee.receipt}` : "Upload Receipt"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) update({ receipt: file.name });
        }}
      />
    </article>
  );
}
