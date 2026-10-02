import { Link, useRouterState } from "@tanstack/react-router";
import { Home, CalendarCheck, GraduationCap, User, Bell, FileText, Megaphone } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/student/assignments", label: "Work", icon: FileText },
  { to: "/academics", label: "Academics", icon: GraduationCap },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({
  title = "Smart Student Portal",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 bg-navy px-4 pt-5 pb-4 text-primary-foreground shadow-lg">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h1 className="truncate text-base font-bold tracking-tight">{title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/tasks"
              aria-label="Tasks and reminders"
              className="relative grid h-9 w-9 place-items-center rounded-full bg-white/10"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive" />
            </Link>
            <Link
              to="/student/notices"
              aria-label="Notices from faculty"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10"
            >
              <Megaphone className="h-4.5 w-4.5" />
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10"
            >
              <User className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-28">{children}</main>

      <nav className="fixed bottom-0 z-20 w-full max-w-md border-t border-border bg-card px-2 pt-2 pb-3">
        <ul className="grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                    active ? "text-sky" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 150,
  stroke = 14,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-teal transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="font-extrabold text-navy"
          style={{ fontSize: Math.max(10, Math.round(size * 0.17)) }}
        >
          {value}%
        </span>
        {label ? (
          <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
