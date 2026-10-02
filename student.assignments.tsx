import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Paperclip, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { dueLabel, fileUrl, formatDateTime, useAuth } from "@/lib/cloud";

export const Route = createFileRoute("/student/assignments")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Assignments — Smart Student Portal" },
      { name: "description", content: "See assignments posted by faculty, submit your work and view marks." },
      { property: "og:title", content: "Assignments — Smart Student Portal" },
      { property: "og:description", content: "Submit assignments and view marks and feedback." },
    ],
  }),
  component: StudentAssignments,
});

type Row = {
  id: string;
  title: string;
  description: string;
  max_marks: number;
  due_at: string;
  attachment_path: string | null;
  subject_id: string;
  subjects: { name: string } | null;
};

type Submission = {
  id: string;
  assignment_id: string;
  file_path: string | null;
  submitted_at: string;
  received: boolean;
  marks: number | null;
  feedback: string | null;
};

const card = "rounded-2xl bg-card p-4 shadow-sm";

function StudentAssignments() {
  const { userId, loading } = useAuth();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const assignments = useQuery({
    queryKey: ["student-assignments"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*, subjects(name)")
        .order("due_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const mine = useQuery({
    queryKey: ["my-submissions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", userId!);
      if (error) throw error;
      return (data ?? []) as Submission[];
    },
  });

  async function submitFile(assignmentId: string, file: File) {
    if (!userId) return;
    setBusyId(assignmentId);
    const path = `${userId}/${assignmentId}-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("submissions").upload(path, file);
    if (!error) {
      const existing = mine.data?.find((s) => s.assignment_id === assignmentId);
      if (existing) {
        await supabase
          .from("submissions")
          .update({ file_path: path, submitted_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("submissions")
          .insert({ assignment_id: assignmentId, student_id: userId, file_path: path });
      }
      await qc.invalidateQueries({ queryKey: ["my-submissions"] });
    }
    setBusyId(null);
  }

  async function openFile(bucket: string, path: string) {
    const url = await fileUrl(bucket, path);
    if (url) window.open(url, "_blank");
  }

  return (
    <AppShell title="Assignments">
      {loading ? (
        <p className={`${card} text-xs text-muted-foreground`}>Loading…</p>
      ) : !userId ? (
        <p className={`${card} text-xs text-muted-foreground`}>
          Sign in with your college account to see assignments from your faculty.
        </p>
      ) : (assignments.data ?? []).length === 0 ? (
        <p className={`${card} text-xs text-muted-foreground`}>No assignments posted yet.</p>
      ) : (
        <ul className="space-y-3">
          {(assignments.data ?? []).map((a) => {
            const sub = mine.data?.find((s) => s.assignment_id === a.id);
            const tag = dueLabel(a.due_at);
            return (
              <li key={a.id} className={card}>
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm font-bold text-navy">{a.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tag.tone}`}>
                    {tag.text}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.subjects?.name ?? "Subject"} • {a.max_marks} marks • due {formatDateTime(a.due_at)}
                </p>
                {a.description ? (
                  <p className="mt-1.5 text-xs text-foreground/80">{a.description}</p>
                ) : null}

                {a.attachment_path ? (
                  <button
                    onClick={() => openFile("assignments", a.attachment_path!)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky"
                  >
                    <Paperclip className="h-3.5 w-3.5" /> Question paper
                  </button>
                ) : null}

                <div className="mt-3 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        sub ? "bg-teal/10 text-teal" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {sub ? "Submitted" : "Pending"}
                    </span>
                    {sub?.received ? (
                      <span className="text-[11px] font-semibold text-teal">Received by faculty</span>
                    ) : null}
                  </div>
                  {sub ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Sent {formatDateTime(sub.submitted_at)}
                      {sub.file_path ? (
                        <>
                          {" • "}
                          <button
                            onClick={() => openFile("submissions", sub.file_path!)}
                            className="font-semibold text-sky"
                          >
                            View my file
                          </button>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                  {sub?.marks != null ? (
                    <p className="mt-1 text-xs font-semibold text-navy">
                      Marks: {sub.marks} / {a.max_marks}
                    </p>
                  ) : null}
                  {sub?.feedback ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">Feedback: {sub.feedback}</p>
                  ) : null}

                  <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    {busyId === a.id ? "Uploading…" : sub ? "Replace my file" : "Upload my work"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void submitFile(a.id, f);
                      }}
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
