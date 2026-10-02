import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create Account — Smart Student Portal" },
      {
        name: "description",
        content: "Register as a student to start using the portal.",
      },
      { property: "og:title", content: "Create Account — Smart Student Portal" },
      {
        property: "og:description",
        content: "Register as a student.",
      },
    ],
  }),
  component: SignupPage,
});

const field =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-sky focus:ring-2 focus:ring-sky/25";

function SignupPage() {
  const navigate = useNavigate();
  const role = "student" as const;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    email: "",
    branch: "",
    year: "",
    semester: "",
    password: "",
  });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const email = form.email.trim().toLowerCase();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (signUpError || !data.user) {
      setBusy(false);
      setError(signUpError?.message ?? "Could not create the account.");
      return;
    }

    const semester = Number(String(form.semester).replace(/\D/g, "")) || null;
    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      full_name: form.fullName,
      roll_no: role === "student" ? form.studentId : null,
      branch: form.branch || null,
      semester: role === "student" ? semester : null,
    });
    await supabase.from("user_roles").insert({ user_id: data.user.id, role });

    setBusy(false);

    setState((s) => ({ ...s, student: { ...form }, loggedIn: true }));
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <div className="bg-navy px-6 pt-14 pb-10 text-primary-foreground">
        <h1 className="text-2xl font-extrabold">Welcome!</h1>
        <p className="mt-1 text-sm text-white/70">Create your portal account.</p>
      </div>

      <form onSubmit={submit} className="-mt-6 space-y-3.5 rounded-t-3xl bg-background px-6 pt-8 pb-12">
        <input className={field} placeholder="Full Name" value={form.fullName} onChange={set("fullName")} required />
        {role === "student" ? (
          <input className={field} placeholder="Student ID" value={form.studentId} onChange={set("studentId")} required />
        ) : null}
        <input className={field} type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input className={field} placeholder="Branch / Department" value={form.branch} onChange={set("branch")} required />
        {role === "student" ? (
          <>
            <select className={field} value={form.year} onChange={set("year")} required>
              <option value="">Year</option>
              {["First Year", "Second Year", "Third Year", "Final Year"].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <select className={field} value={form.semester} onChange={set("semester")} required>
              <option value="">Semester</option>
              {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </>
        ) : null}
        <input
          className={field}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={set("password")}
          required
          minLength={6}
        />
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-navy py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create Account"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-sky">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
