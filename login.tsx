import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState, useAppState } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Login — Smart Student Portal" },
      { name: "description", content: "Sign in to your Smart Student Portal account." },
      { property: "og:title", content: "Login — Smart Student Portal" },
      { property: "og:description", content: "Sign in to your student portal account." },
    ],
  }),
  component: LoginPage,
});

const field =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-sky focus:ring-2 focus:ring-sky/25";

function LoginPage() {
  const { student } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (data?.user && !signInError) {
      setBusy(false);
      setState((s) => ({ ...s, loggedIn: true }));
      navigate({ to: "/dashboard" });
      return;
    }

    // Fall back to an account created on this device before cloud sign-in existed.
    if (
      student &&
      student.email.toLowerCase() === email.trim().toLowerCase() &&
      student.password === password
    ) {
      setBusy(false);
      setState((s) => ({ ...s, loggedIn: true }));
      navigate({ to: "/dashboard" });
      return;
    }

    setBusy(false);
    setError(signInError?.message ?? "Incorrect email or password.");
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <div className="bg-navy px-6 pt-14 pb-10 text-primary-foreground">
        <h1 className="text-2xl font-extrabold">Welcome back!</h1>
        <p className="mt-1 text-sm text-white/70">Sign in to continue to your portal.</p>
      </div>

      <form onSubmit={submit} className="-mt-6 space-y-4 rounded-t-3xl bg-background px-6 pt-8 pb-12">
        <input
          className={field}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={field}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-navy py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Login"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-sky">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
