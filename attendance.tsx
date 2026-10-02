import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell, ProgressRing } from "@/components/AppShell";
import { AddSubjectModal } from "@/components/AddSubjectModal";
import {
  DAYS,
  dayName,
  setState,
  subjectAttendance,
  todayKey,
  uid,
  useAppState,
  type AttendanceMark,
} from "@/lib/store";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance Center — Smart Student Portal" },
      {
        name: "description",
        content: "Mark daily attendance, manage subjects and build your weekly timetable grid.",
      },
      { property: "og:title", content: "Attendance Center — Smart Student Portal" },
      {
        property: "og:description",
        content: "Daily marker, subject list and weekly timetable in one place.",
      },
    ],
  }),
  component: AttendancePage,
});

const TABS = ["Today", "Subjects", "Timetable"] as const;

function AttendancePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Today");

  return (
    <AppShell title="Attendance">
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-secondary p-1">
        {TABS.map((t) => (
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

      <div className="mt-4">
        {tab === "Today" ? <DailyMarker /> : tab === "Subjects" ? <SubjectFeeder /> : <TimetableGrid />}
      </div>
    </AppShell>
  );
}

const MARKS: { key: AttendanceMark | "clear"; label: string; cls: string }[] = [
  { key: "present", label: "Present", cls: "bg-teal text-accent-foreground" },
  { key: "absent", label: "Absent", cls: "bg-destructive text-destructive-foreground" },
  { key: "off", label: "Off", cls: "bg-sky text-primary-foreground" },
  { key: "clear", label: "Clear", cls: "bg-secondary text-muted-foreground" },
];

function DailyMarker() {
  const state = useAppState();
  const today = dayName();
  const key = todayKey();
  const ids: string[] = state.timetable[today] ?? [];

  function mark(subjectId: string, value: AttendanceMark | "clear") {
    setState((s) => {
      const day = { ...(s.attendance[key] ?? {}) };
      if (value === "clear") delete day[subjectId];
      else day[subjectId] = value;
      return { ...s, attendance: { ...s.attendance, [key]: day } };
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "short",
        })}
      </p>

      {ids.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
          No classes scheduled today. Add them in the Timetable tab.
        </p>
      ) : (
        ids.map((id: string) => {
          const subject = state.subjects.find((s) => s.id === id);
          if (!subject) return null;
          const current = state.attendance[key]?.[id];
          const pct = subjectAttendance(state, id);
          return (
            <article key={id} className="rounded-2xl bg-card p-3 shadow-sm">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-navy">{subject.name}</h3>
                  <p
                    className={`text-[11px] font-semibold ${
                      current === "absent"
                        ? "text-destructive"
                        : current === "present"
                          ? "text-teal"
                          : "text-muted-foreground"
                    }`}
                  >
                    {current ? current.charAt(0).toUpperCase() + current.slice(1) : "Not marked"}
                  </p>
                </div>
                <ProgressRing value={pct ?? 0} size={52} stroke={6} />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {MARKS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => mark(id, m.key)}
                    className={`rounded-lg py-1.5 text-[11px] font-bold ${
                      current === m.key ? m.cls : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

function SemesterSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-muted-foreground">
      Current Semester
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-sky"
      >
        {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            Semester {n}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubjectFeeder() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const semester = state.attendanceSemester;
  const list = state.subjects.filter((s) => s.semester === semester);

  function setSemester(n: number) {
    setState((s) => ({ ...s, attendanceSemester: n }));
  }

  function remove(id: string) {
    setState((s) => {
      const marks = { ...(s.marks ?? {}) };
      delete marks[id];
      return {
        ...s,
        subjects: s.subjects.filter((x) => x.id !== id),
        marks,
        timetable: Object.fromEntries(
          Object.entries(s.timetable).map(([d, l]) => [d, l.filter((x) => x !== id)]),
        ),
      };
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
        <SemesterSelect value={semester} onChange={setSemester} />
        <button
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-sky px-3 py-2.5 text-xs font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
          No subjects added for this semester. Tap “+ Add Subject”.
        </p>
      ) : (
        list.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {s.code} · {s.type}
              </p>
            </div>
            <button
              onClick={() => remove(s.id)}
              aria-label={`Remove ${s.name}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))
      )}

      <AddSubjectModal open={open} defaultSemester={semester} onClose={() => setOpen(false)} />
    </div>
  );
}

function TimetableGrid() {
  const state = useAppState();
  const { timetable } = state;
  const semester = state.attendanceSemester;
  const subjects = state.subjects.filter((s) => s.semester === semester);

  function assign(day: string, subjectId: string) {
    if (!subjectId) return;
    setState((s) => {
      const list = s.timetable[day] ?? [];
      if (list.includes(subjectId)) return s;
      return { ...s, timetable: { ...s.timetable, [day]: [...list, subjectId] } };
    });
  }

  function unassign(day: string, subjectId: string) {
    setState((s) => ({
      ...s,
      timetable: { ...s.timetable, [day]: (s.timetable[day] ?? []).filter((x) => x !== subjectId) },
    }));
  }

  return (
    <div className="space-y-3">
      <SemesterSelect
        value={semester}
        onChange={(n) => setState((s) => ({ ...s, attendanceSemester: n }))}
      />

      {subjects.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
          Add subjects for this semester first to build your timetable.
        </p>
      ) : null}

      {DAYS.map((day) => (
        <section key={day} className="rounded-2xl bg-card p-3 shadow-sm">
          <h3 className="text-sm font-bold text-navy">{day}</h3>
          <select
            value=""
            onChange={(e) => assign(day, e.target.value)}
            disabled={subjects.length === 0}
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-sky disabled:opacity-50"
          >
            <option value="">Add subject to {day}…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.type})
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(timetable[day] ?? []).map((id) => {
              const s = state.subjects.find((x) => x.id === id);
              if (!s) return null;
              return (
                <button
                  key={id}
                  onClick={() => unassign(day, id)}
                  className="rounded-lg bg-sky px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground"
                >
                  {s.name} ✕
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

