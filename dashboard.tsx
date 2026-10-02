import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookPlus,
  ChevronRight,
  GraduationCap,
  ListTodo,
} from "lucide-react";
import { AppShell, ProgressRing } from "@/components/AppShell";
import {
  DAYS,
  dayName,
  overallAttendance,
  setState,
  todayKey,
  useAppState,
  type AttendanceMark,
} from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Student Portal" },
      {
        name: "description",
        content: "See today's classes, mark attendance instantly and track upcoming deadlines.",
      },
      { property: "og:title", content: "Dashboard — Smart Student Portal" },
      {
        property: "og:description",
        content: "Today's schedule, instant attendance marking and deadlines at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const MARK_STYLES: Record<AttendanceMark, { label: string; active: string }> = {
  present: { label: "P", active: "bg-teal text-accent-foreground" },
  absent: { label: "A", active: "bg-destructive text-destructive-foreground" },
  off: { label: "Off", active: "bg-navy text-primary-foreground" },
};

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatDue(due: string) {
  const d = new Date(`${due}T00:00:00`);
  return `due ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

function Dashboard() {
  const state = useAppState();
  const pct = overallAttendance(state);
  const today = dayName();
  const key = todayKey();
  const isClassDay = (DAYS as readonly string[]).includes(today);
  const todaysClasses: string[] = isClassDay ? (state.timetable[today] ?? []) : [];
  const todaysMarks = state.attendance[key] ?? {};

  const pending = state.tasks
    .filter((t) => !t.done)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 3);

  const mark = (subjectId: string, value: AttendanceMark) =>
    setState((s) => {
      const day = { ...(s.attendance[key] ?? {}) };
      if (day[subjectId] === value) {
        delete day[subjectId];
      } else {
        day[subjectId] = value;
      }
      return { ...s, attendance: { ...s.attendance, [key]: day } };
    });

  return (
    <AppShell>
      <section className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-extrabold text-navy">
            {state.student?.fullName
              ? `Hi, ${state.student.fullName.split(" ")[0]}`
              : "Dashboard"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatToday()} · {todaysClasses.length}{" "}
            {todaysClasses.length === 1 ? "class" : "classes"} today
          </p>
          <p className="mt-2 text-[11px] font-medium text-muted-foreground">
            Tap P / A to mark attendance below.
          </p>
        </div>
        <ProgressRing value={pct} size={104} stroke={11} label="Attendance" />
      </section>

      <section className="mt-5 rounded-2xl bg-card p-4 shadow-sm">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h3 className="truncate text-sm font-bold text-navy">
            Today&apos;s Schedule ({today})
          </h3>
          <Link to="/attendance" className="shrink-0 text-xs font-semibold text-sky">
            Timetable
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {todaysClasses.length === 0 ? (
            <li className="text-xs text-muted-foreground">
              {isClassDay
                ? "No classes scheduled today. Add them from the Timetable tab."
                : "No classes today — enjoy your day off."}
            </li>
          ) : (
            todaysClasses.map((id: string) => {
              const subject = state.subjects.find((s) => s.id === id);
              if (!subject) return null;
              const current = todaysMarks[id] as AttendanceMark | undefined;
              return (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy">
                      {subject.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {subject.code}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-1">
                    {(Object.keys(MARK_STYLES) as AttendanceMark[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => mark(id, m)}
                        aria-label={`Mark ${subject.name} ${m}`}
                        className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-[11px] font-bold transition-colors ${
                          current === m
                            ? MARK_STYLES[m].active
                            : "bg-card text-muted-foreground"
                        }`}
                      >
                        {MARK_STYLES[m].label}
                      </button>
                    ))}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section className="mt-5 rounded-2xl bg-card p-4 shadow-sm">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h3 className="truncate text-sm font-bold text-navy">Upcoming Deadlines</h3>
          <Link to="/tasks" className="shrink-0 text-xs font-semibold text-sky">
            See All
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {pending.length === 0 ? (
            <li className="text-xs text-muted-foreground">
              Nothing pending — you&apos;re all caught up.
            </li>
          ) : (
            pending.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5"
              >
                <ListTodo className="h-4 w-4 shrink-0 text-teal" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-navy">
                    {task.title}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {task.subject} · {formatDue(task.due)}
                  </span>
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-5 grid gap-3">
        <Link
          to="/subjects"
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-navy p-3 text-primary-foreground"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
            <BookPlus className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">Manage Subjects</span>
            <span className="block truncate text-[11px] text-white/70">
              Semester-wise, synced with attendance &amp; marks
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
        <Link
          to="/academics"
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-teal p-3 text-accent-foreground"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/10">
            <GraduationCap className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">Marks &amp; Fees</span>
            <span className="block truncate text-[11px] text-accent-foreground/70">
              IA, external marks and semester fees
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      </section>
    </AppShell>
  );
}
