"use client";

import Link from "next/link";
import { Briefcase, CheckCircle2, Clock, AlertTriangle, Wallet, Banknote } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MeasureBar } from "@/components/ui/MeasureBar";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import { jobDerived } from "@/domain/calculations";
import { PALETTE } from "@/lib/palette";
import type { Job, TailorWageInfo } from "@/domain/entities";
import type { TailorDashboard } from "@/services/report-service";

export function TailorDashboardView({
  dashboard,
  wageInfo,
}: {
  dashboard: TailorDashboard;
  wageInfo: TailorWageInfo | null;
}) {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-ink font-serif">My Jobs</h1>
        <p className="text-sm text-slate">Jobs assigned to you and your wage summary</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard icon={Briefcase} label="Assigned" value={dashboard.jobs.length} accent={PALETTE.plum} />
        <StatCard icon={CheckCircle2} label="Completed" value={dashboard.completed} accent={PALETTE.emerald} />
        <StatCard icon={Clock} label="In Progress" value={dashboard.inProgress} accent={PALETTE.amber} />
        <StatCard icon={AlertTriangle} label="Overdue" value={dashboard.overdue} accent={PALETTE.rose} />
      </div>

      {wageInfo && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard icon={Wallet} label="Total Earned" value={formatCurrency(wageInfo.earned)} accent={PALETTE.plum} />
          <StatCard icon={Banknote} label="Wage Paid" value={formatCurrency(wageInfo.paid)} accent={PALETTE.emerald} />
          <StatCard icon={AlertTriangle} label="Wage Pending" value={formatCurrency(wageInfo.pending)} accent={PALETTE.rose} />
        </div>
      )}

      <div className="bg-white rounded-lg border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#F7F2E8" }}>
              {["Job #", "Customer", "Style", "Expected Completion", "Progress", "Status", ""].map((h) => (
                <th key={h} className="text-left px-3 py-2 font-semibold text-slate">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dashboard.jobs.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate">
                  No jobs assigned to you yet.
                </td>
              </tr>
            )}
            {dashboard.jobs.map((job: Job) => {
              const d = jobDerived(job);
              return (
                <tr key={job.id} className="border-t border-line">
                  <td className="px-3 py-2 font-semibold">{job.jobNumber}</td>
                  <td className="px-3 py-2">{job.customerName}</td>
                  <td className="px-3 py-2">{styleLabelOf(job)}</td>
                  <td className="px-3 py-2">{job.completionDate ?? "—"}</td>
                  <td className="px-3 py-2" style={{ width: 140 }}>
                    <MeasureBar value={d.progress} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/jobs/${job.id}`} className="font-semibold underline" style={{ color: "#3D2645" }}>
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
