import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  CalendarCheck,
  Receipt,
  ListTodo,
  Sparkles,
  BookOpen,
  Pencil,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Student Portal — Attendance, Fees & Tasks" },
      {
        name: "description",
        content:
          "Track attendance, timetable, semester fees and assignment deadlines in one clean student app.",
      },
      { property: "og:title", content: "Smart Student Portal" },
      {
        property: "og:description",
        content: "One app for university attendance, fees and assignment deadlines.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-navy text-primary-foreground">
      {/* Soft academic canvas blobs */}
      <div
        aria-hidden
        className="animate-canvas-blob-1 pointer-events-none absolute -left-12 top-[18%] h-40 w-40 rounded-full bg-sky/15 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-canvas-blob-2 pointer-events-none absolute -right-12 bottom-[28%] h-48 w-48 rounded-full bg-teal/15 blur-3xl"
      />

      {/* Screen content unfolds like a digital canvas */}
      <div className="animate-canvas-reveal flex min-h-screen flex-col justify-between px-6 py-14">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Student canvas — rings, cap and orbiting study tools */}
          <div className="relative flex h-64 w-full items-center justify-center">
            {/* Rotating compass rings */}
            <div
              aria-hidden
              className="absolute h-56 w-56 rounded-full border-2 border-sky/20 animate-[spin_20s_linear_infinite]"
            />
            <div
              aria-hidden
              className="absolute h-64 w-64 rounded-full border border-dashed border-teal/30 animate-[spin_15s_linear_infinite_reverse]"
            />

            {/* Central graduation cap */}
            <div className="animate-canvas-cap-pop relative z-10 grid h-32 w-32 place-items-center rounded-[2rem] bg-white shadow-[0_20px_50px_rgba(59,130,246,0.25)]">
              <GraduationCap className="h-16 w-16 text-navy" />
            </div>

            {/* Orbiting student assets */}
            <div
              aria-hidden
              className="animate-canvas-orbit pointer-events-none absolute left-1/2 top-1/2 -ml-5 -mt-5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-lg">
                <Sparkles className="h-5 w-5 text-warning" />
              </div>
            </div>
            <div
              aria-hidden
              className="animate-canvas-orbit-reverse pointer-events-none absolute left-1/2 top-1/2 -ml-6 -mt-6 [animation-delay:-6s]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-lg">
                <BookOpen className="h-6 w-6 text-teal" />
              </div>
            </div>
            <div
              aria-hidden
              className="animate-canvas-orbit pointer-events-none absolute left-1/2 top-1/2 -ml-4 -mt-4 [animation-delay:-3s] [animation-duration:9s]"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white shadow-md">
                <Pencil className="h-5 w-5 text-sky" />
              </div>
            </div>
          </div>

          <h1 className="animate-fade-in mt-8 text-3xl font-extrabold tracking-tight [animation-delay:600ms] [animation-fill-mode:both]">
            Smart Student Portal
          </h1>
          <p className="animate-fade-in mt-3 max-w-xs text-sm text-white/70 [animation-delay:750ms] [animation-fill-mode:both]">
            Attendance, timetable, fees and deadlines — organised in one place for your whole degree.
          </p>

          <ul className="mt-10 grid w-full gap-3 text-left">
            {[
              { icon: CalendarCheck, text: "Mark daily attendance in seconds" },
              { icon: Receipt, text: "Track 8 semesters of fees & receipts" },
              { icon: ListTodo, text: "Never miss an assignment deadline" },
            ].map(({ icon: Icon, text }, i) => (
              <li
                key={text}
                className="animate-fade-in flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 [animation-fill-mode:both]"
                style={{ animationDelay: `${900 + i * 120}ms` }}
              >
                <Icon className="h-5 w-5 shrink-0 text-teal" />
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-in space-y-3 [animation-delay:1300ms] [animation-fill-mode:both]">
          <Link
            to="/signup"
            className="block rounded-2xl bg-teal py-3.5 text-center text-sm font-bold text-accent-foreground"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="block rounded-2xl border border-white/25 py-3.5 text-center text-sm font-semibold"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}
