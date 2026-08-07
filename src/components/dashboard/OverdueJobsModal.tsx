"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { MeasureBar } from "@/components/ui/MeasureBar";
import { getOverdueJobsAction } from "@/actions/report-actions";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import type { Job, JobDerived } from "@/domain/entities";

interface OverdueEntry {
  job: Job;
  derived: JobDerived;
  daysOverdue: number;
}

export function OverdueJobsModal({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<OverdueEntry[] | null>(null);

  useEffect(() => {
    let active = true;
    getOverdueJobsAction().then((data) => {
      if (active) setEntries(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Modal title={`Overdue Jobs${entries ? ` (${entries.length})` : ""}`} onClose={onClose} wide>
      {!entries ? (
        <p className="text-sm text-slate">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate">No overdue jobs right now — everything is on schedule.</p>
      ) : (
        <>
          <div className="border border-line rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#F7F2E8" }}>
                  {["Job #", "Customer", "Style", "Expected Completion", "Days Overdue", "Progress", "Tailor", "Outstanding"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-slate">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(({ job, derived, daysOverdue }) => (
                  <tr key={job.id} className="border-t border-line">
                    <td className="px-3 py-2 font-semibold">{job.jobNumber}</td>
                    <td className="px-3 py-2">{job.customerName}</td>
                    <td className="px-3 py-2">{styleLabelOf(job)}</td>
                    <td className="px-3 py-2">{job.completionDate}</td>
                    <td className="px-3 py-2 font-semibold" style={{ color: "#B23A48" }}>
                      {daysOverdue} day(s)
                    </td>
                    <td className="px-3 py-2" style={{ width: 120 }}>
                      <MeasureBar value={derived.progress} />
                    </td>
                    <td className="px-3 py-2">{job.tailorName ?? "—"}</td>
                    <td className="px-3 py-2">{formatCurrency(derived.outstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            href="/api/reports/overdue"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
            style={{ backgroundColor: "#3D2645" }}
          >
            <Download size={15} /> Download Overdue Jobs Report (Excel)
          </a>
        </>
      )}
    </Modal>
  );
}
