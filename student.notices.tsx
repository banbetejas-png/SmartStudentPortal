import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { formatDateTime, useAuth } from "@/lib/cloud";

export const Route = createFileRoute("/student/notices")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Notices — Smart Student Portal" },
      { name: "description", content: "Important messages and announcements from your faculty." },
      { property: "og:title", content: "Notices — Smart Student Portal" },
      { property: "og:description", content: "Announcements from your faculty." },
    ],
  }),
  component: StudentNotices,
});

type Notice = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  subject_id: string | null;
  subjects: { name: string } | null;
};

const card = "rounded-2xl bg-card p-4 shadow-sm";

function StudentNotices() {
  const { userId, loading } = useAuth();
  const qc = useQueryClient();

  const notices = useQuery({
    queryKey: ["student-notices"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*, subjects(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Notice[];
    },
  });

  const reads = useQuery({
    queryKey: ["notice-reads", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notice_reads")
        .select("notice_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.notice_id as string);
    },
  });

  useEffect(() => {
    if (!userId || !notices.data || !reads.data) return;
    const unread = notices.data.filter((n) => !reads.data!.includes(n.id));
    if (unread.length === 0) return;
    void (async () => {
      await supabase
        .from("notice_reads")
        .insert(unread.map((n) => ({ notice_id: n.id, user_id: userId })));
      await qc.invalidateQueries({ queryKey: ["notice-reads"] });
    })();
  }, [userId, notices.data, reads.data, qc]);

  return (
    <AppShell title="Notices">
      {loading ? (
        <p className={`${card} text-xs text-muted-foreground`}>Loading…</p>
      ) : !userId ? (
        <p className={`${card} text-xs text-muted-foreground`}>
          Sign in with your college account to see faculty notices.
        </p>
      ) : (notices.data ?? []).length === 0 ? (
        <p className={`${card} text-xs text-muted-foreground`}>No notices yet.</p>
      ) : (
        <ul className="space-y-3">
          {(notices.data ?? []).map((n) => {
            const unread = reads.data ? !reads.data.includes(n.id) : false;
            return (
              <li key={n.id} className={card}>
                <div className="flex items-start gap-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy">
                      {n.title}
                      {unread ? (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-destructive align-middle" />
                      ) : null}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {n.subjects?.name ?? "Whole class"} • {formatDateTime(n.created_at)}
                    </p>
                    {n.message ? (
                      <p className="mt-1.5 text-xs text-foreground/80">{n.message}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
