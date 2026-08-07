"use client";

import { useState, useTransition } from "react";
import { MeasureBar } from "@/components/ui/MeasureBar";
import { updateJobProgress } from "@/actions/job-actions";

export function ProgressUpdater({ jobId, initialProgress }: { jobId: string; initialProgress: number }) {
  const [progress, setProgress] = useState(initialProgress);
  const [saved, setSaved] = useState(true);
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updateJobProgress(jobId, progress);
      setSaved(result.success);
    });
  };

  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: "#F7F2E8" }}>
      <p className="text-xs font-semibold uppercase mb-2 text-slate tracking-wide">Update work-in-progress</p>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={progress}
        onChange={(e) => {
          setProgress(Number(e.target.value));
          setSaved(false);
        }}
        className="w-full"
      />
      <div className="mt-1 mb-3">
        <MeasureBar value={progress} />
      </div>
      <button
        onClick={save}
        disabled={pending || saved}
        className="px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "#3D2645" }}
      >
        {pending ? "Saving…" : saved ? "Saved" : "Save Progress"}
      </button>
    </div>
  );
}
