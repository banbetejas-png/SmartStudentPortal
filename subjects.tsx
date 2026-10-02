import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AddSubjectModal } from "@/components/AddSubjectModal";
import { setState, useAppState } from "@/lib/store";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Manage Subjects — Smart Student Portal" },
      {
        name: "description",
        content:
          "Add and remove subjects semester by semester. Subjects sync automatically with attendance tracking and marks.",
      },
      { property: "og:title", content: "Manage Subjects — Smart Student Portal" },
      {
        property: "og:description",
        content: "One global subject list shared by attendance and academics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const semester = state.subjectsSemester;
  const list = state.subjects.filter((s) => s.semester === semester);

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
    <AppShell title="Manage Subjects">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
        <label className="block text-xs font-semibold text-muted-foreground">
          Semester
          <select
            value={semester}
            onChange={(e) => setState((s) => ({ ...s, subjectsSemester: Number(e.target.value) }))}
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

      <p className="mt-3 rounded-2xl bg-secondary p-3 text-[11px] text-muted-foreground">
        Subjects added here appear in Attendance and Academics whenever you pick the same semester
        there.
      </p>

      <div className="mt-3 space-y-3">
        {list.length === 0 ? (
          <p className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
            No subjects for Semester {semester} yet. Tap “+ Add Subject”.
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
                  {s.code} · {s.type} · {s.credits} credits
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
      </div>

      <AddSubjectModal
        key={semester}
        open={open}
        defaultSemester={semester}
        onClose={() => setOpen(false)}
      />
    </AppShell>
  );
}
