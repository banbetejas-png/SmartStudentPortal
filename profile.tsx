import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { overallAttendance, setState, useAppState } from "@/lib/store";
import { clearSession } from "@/lib/auth";
import { signOutEverywhere } from "@/lib/cloud";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Smart Student Portal" },
      {
        name: "description",
        content: "View your student details, app preferences and sign out of the portal.",
      },
      { property: "og:title", content: "Profile — Smart Student Portal" },
      { property: "og:description", content: "Student details, preferences and logout." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const state = useAppState();
  const navigate = useNavigate();
  const s = state.student;

  const rows = [
    ["Full Name", s?.fullName],
    ["Student ID", s?.studentId],
    ["Email", s?.email],
    ["Branch", s?.branch],
    ["Year", s?.year],
    ["Semester", s?.semester],
  ] as const;

  return (
    <AppShell title="Profile">
      <section className="flex items-center gap-3 rounded-2xl bg-navy p-4 text-primary-foreground">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/15">
          <User className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold">{s?.fullName ?? "Guest Student"}</p>
          <p className="truncate text-xs text-white/70">{s?.email ?? "Not signed in"}</p>
          <p className="mt-1 text-[11px] font-semibold text-teal">
            {overallAttendance(state)}% overall attendance
          </p>
        </div>
      </section>

      <section className="mt-4 divide-y divide-border rounded-2xl bg-card px-4 shadow-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="truncate text-xs font-semibold text-navy">{value || "—"}</span>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="text-sm font-bold text-navy">App Preferences</h3>
        <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
          <li className="flex justify-between">
            <span>Deadline reminders</span>
            <span className="font-semibold text-teal">On</span>
          </li>
          <li className="flex justify-between">
            <span>Attendance target</span>
            <span className="font-semibold text-navy">75%</span>
          </li>
          <li className="flex justify-between">
            <span>Data storage</span>
            <span className="font-semibold text-navy">This device</span>
          </li>
        </ul>
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="text-sm font-bold text-navy">About Us</h3>
        <p className="mt-1 text-xs font-semibold text-sky">Developed by ATMS</p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {["Tejas Banbe", "Atharva Bahulekar", "Mayur Bhoi", "Soham Bendal"].map((n) => (
            <li key={n}>• {n}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Smart Student Portal • Version 1.0 (NEP Compliant)
        </p>
      </section>

      <button
        onClick={async () => {
          clearSession();
          await signOutEverywhere();
          setState((prev) => ({ ...prev, loggedIn: false }));
          navigate({ to: "/login", replace: true });
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive py-3.5 text-sm font-bold text-destructive-foreground"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </AppShell>
  );
}
