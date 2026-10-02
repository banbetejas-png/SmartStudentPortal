import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "student";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  roll_no: string | null;
  branch: string | null;
  semester: number | null;
};

export type AuthState = {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
};

async function loadAccount(userId: string) {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  return {
    profile: (profile as Profile | null) ?? null,
    role: ((roles?.[0]?.role as Role | undefined) ?? null) as Role | null,
  };
}

/** Current signed-in user, their profile row and their role. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    userId: null,
    email: null,
    profile: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    async function sync(userId: string | null, email: string | null) {
      if (!userId) {
        if (active) setState({ userId: null, email: null, profile: null, role: null, loading: false });
        return;
      }
      const { profile, role } = await loadAccount(userId);
      if (active) setState({ userId, email, profile, role, loading: false });
    }

    supabase.auth.getSession().then(({ data }) => {
      void sync(data.session?.user.id ?? null, data.session?.user.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      void sync(session?.user.id ?? null, session?.user.email ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOutEverywhere() {
  await supabase.auth.signOut();
}

export type SubjectRow = {
  id: string;
  name: string;
  code: string;
  semester: number;
  created_by: string | null;
};

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function dueLabel(due: string) {
  const diff = new Date(due).getTime() - Date.now();
  if (diff < 0) return { text: "Overdue", tone: "bg-destructive/10 text-destructive" };
  const days = Math.ceil(diff / 86_400_000);
  if (days <= 2) return { text: `Due in ${days}d`, tone: "bg-amber-100 text-amber-700" };
  return { text: `Due in ${days}d`, tone: "bg-teal/10 text-teal" };
}

/** Signed URL for a stored file, valid for an hour. */
export async function fileUrl(bucket: string, path: string) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
