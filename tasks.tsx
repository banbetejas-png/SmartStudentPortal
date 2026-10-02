import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BellRing, Plus, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { setState, uid, useAppState, type Task } from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks & Reminders — Smart Student Portal" },
      {
        name: "description",
        content: "Track assignment and journal deadlines with due-soon warnings and history.",
      },
      { property: "og:title", content: "Tasks & Reminders — Smart Student Portal" },
      {
        property: "og:description",
        content: "Assignments, journals and deadlines with due-soon alerts.",
      },
    ],
  }),
  component: TasksPage,
});

function daysLeft(due: string) {
  const diff = new Date(due).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

function TasksPage() {
  const { tasks } = useAppState();
  const [tab, setTab] = useState<"Active" | "History">("Active");
  const [open, setOpen] = useState(false);

  const list = tasks.filter((t) => (tab === "Active" ? !t.done : t.done));

  return (
    <AppShell title="Tasks & Reminders">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
        {(["Active", "History"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl py-2 text-xs font-bold ${
              tab === t ? "bg-navy text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "Active" ? "Active Tasks" : "Completed History"}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <p className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
            Nothing here yet.
          </p>
        ) : (
          list.map((t) => <TaskRow key={t.id} task={t} />)
        )}
      </div>

      {open ? <AddTask onClose={() => setOpen(false)} /> : null}

      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-20 flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-xs font-bold text-primary-foreground shadow-lg"
      >
        <Plus className="h-4 w-4" /> Add Task
      </button>
    </AppShell>
  );
}

function TaskRow({ task }: { task: Task }) {
  const left = daysLeft(task.due);
  const urgent = !task.done && left <= 3;

  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
      <button
        aria-label="Mark as done"
        onClick={() =>
          setState((s) => ({
            ...s,
            tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, done: !x.done } : x)),
          }))
        }
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
          task.done ? "border-teal bg-teal text-accent-foreground" : "border-border"
        }`}
      >
        {task.done ? <Check className="h-4 w-4" /> : null}
      </button>
      <div className="min-w-0">
        <p
          className={`truncate text-sm font-bold ${
            task.done ? "text-muted-foreground line-through" : "text-navy"
          }`}
        >
          {task.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {task.subject} · Due {new Date(task.due).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>
      {urgent ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[10px] font-bold text-destructive">
          <BellRing className="h-3 w-3" /> {left < 0 ? "Overdue" : "Urgent"}
        </span>
      ) : null}
    </article>
  );
}

function AddTask({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-sky";

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !due) return;
          setState((s) => ({
            ...s,
            tasks: [
              ...s.tasks,
              { id: uid(), title: title.trim(), subject: subject.trim() || "General", due, done: false },
            ],
          }));
          onClose();
        }}
        className="mx-auto w-full max-w-md space-y-3 rounded-t-3xl bg-card p-5"
      >
        <h3 className="text-sm font-bold text-navy">New Task</h3>
        <input className={field} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={field} placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <input className={field} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <button className="w-full rounded-xl bg-navy py-3 text-xs font-bold text-primary-foreground">
          Add Task
        </button>
      </form>
    </div>
  );
}
