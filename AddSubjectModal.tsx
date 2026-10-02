import { useState } from "react";
import { X } from "lucide-react";
import { setState, uid, type ExamScheme, type SubjectType } from "@/lib/store";

const SCHEME_PRESETS = [
  { label: "20 + 20 IA / 60 External", scheme: { iaMax: 20, externalMax: 60 } },
  { label: "15 + 15 IA / 45 External", scheme: { iaMax: 15, externalMax: 45 } },
  { label: "10 + 10 IA / 30 External", scheme: { iaMax: 10, externalMax: 30 } },
] as const;

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-sky";

export function AddSubjectModal({
  open,
  defaultSemester,
  onClose,
}: {
  open: boolean;
  defaultSemester: number;
  onClose: () => void;
}) {
  const [semester, setSemester] = useState(defaultSemester);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<SubjectType>("Theory");
  const [credits, setCredits] = useState("3");
  const [preset, setPreset] = useState<string>("0");
  const [customIa, setCustomIa] = useState("20");
  const [customExt, setCustomExt] = useState("60");

  if (!open) return null;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const scheme: ExamScheme =
      preset === "custom"
        ? {
            iaMax: Math.max(1, Number(customIa) || 20),
            externalMax: Math.max(1, Number(customExt) || 60),
          }
        : { ...SCHEME_PRESETS[Number(preset)]!.scheme };
    setState((s) => ({
      ...s,
      subjects: [
        ...s.subjects,
        {
          id: uid(),
          name: name.trim(),
          code: code.trim() || "—",
          semester: Number(semester),
          type,
          credits: Number(credits) || 0,
          scheme,
        },
      ],
    }));
    setName("");
    setCode("");
    setCredits("3");
    setType("Theory");
    setPreset("0");
    setCustomIa("20");
    setCustomExt("60");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 backdrop-blur-sm sm:place-items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-2xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h2 className="truncate text-base font-extrabold text-navy">Add Subject</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={save} className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-muted-foreground">
            Target Semester
            <select
              className={`mt-1 ${field}`}
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Semester {n}
                </option>
              ))}
            </select>
          </label>

          <input
            className={field}
            placeholder="Subject Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={field}
            placeholder="Subject Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
            {(["Theory", "Lab"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg py-2 text-xs font-bold transition-colors ${
                  type === t ? "bg-navy text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            className={field}
            type="number"
            min="0"
            placeholder="Credits"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
          />

          <label className="block text-xs font-semibold text-muted-foreground">
            Exam Scheme
            <select
              className={`mt-1 ${field}`}
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
            >
              {SCHEME_PRESETS.map((p, i) => (
                <option key={p.label} value={String(i)}>
                  {p.label}
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
          </label>

          {preset === "custom" ? (
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-semibold text-muted-foreground">
                IA max (each)
                <input
                  className={`mt-1 ${field}`}
                  type="number"
                  min="1"
                  value={customIa}
                  onChange={(e) => setCustomIa(e.target.value)}
                />
              </label>
              <label className="block text-[11px] font-semibold text-muted-foreground">
                External max
                <input
                  className={`mt-1 ${field}`}
                  type="number"
                  min="1"
                  value={customExt}
                  onChange={(e) => setCustomExt(e.target.value)}
                />
              </label>
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-navy py-3.5 text-sm font-bold text-primary-foreground"
          >
            Save Subject
          </button>
        </form>
      </div>
    </div>
  );
}
