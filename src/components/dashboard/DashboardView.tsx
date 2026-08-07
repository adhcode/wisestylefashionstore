"use client";

import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  Receipt,
  PiggyBank,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatCard } from "@/components/ui/StatCard";
import { OverdueJobsModal } from "./OverdueJobsModal";
import { formatCurrency } from "@/domain/format";
import { PALETTE, PIE_COLORS } from "@/lib/palette";
import type { DashboardMetrics } from "@/services/report-service";

export function DashboardView({ metrics }: { metrics: DashboardMetrics }) {
  const [showOverdue, setShowOverdue] = useState(false);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-ink font-serif">Dashboard</h1>
        <p className="text-sm text-slate">Overview of jobs, customers and finances</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard icon={Briefcase} label="Total Jobs" value={metrics.totalJobs} accent={PALETTE.plum} />
        <StatCard icon={CheckCircle2} label="Completed" value={metrics.completed} accent={PALETTE.emerald} />
        <StatCard icon={Clock} label="In Progress" value={metrics.inProgress} accent={PALETTE.amber} />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={metrics.overdue}
          sub={`${metrics.dueSoon} due within 7 days`}
          accent={PALETTE.rose}
          onClick={() => setShowOverdue(true)}
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard icon={Wallet} label="Total Revenue" value={formatCurrency(metrics.revenue)} accent={PALETTE.gold} />
        <StatCard
          icon={Receipt}
          label="Total Expenses"
          value={formatCurrency(metrics.tailorFeeTotal + metrics.materialBudgetTotal + metrics.officeUtilityTotal + metrics.miscTotal)}
          accent={PALETTE.slate}
        />
        <StatCard icon={PiggyBank} label="Net Profit (30%)" value={formatCurrency(metrics.profitTotal)} accent={PALETTE.emerald} />
        <StatCard icon={TrendingUp} label="Outstanding Balance" value={formatCurrency(metrics.outstandingTotal)} accent={PALETTE.rose} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard
          icon={Users}
          label="Total Customers"
          value={metrics.male + metrics.female}
          sub={`${metrics.male} male • ${metrics.female} female`}
          accent={PALETTE.plum}
        />
        <StatCard icon={Users} label="Repeat Customers" value={metrics.repeat} accent={PALETTE.gold} />
        <StatCard icon={Clock} label="Pending Jobs" value={metrics.pending} accent={PALETTE.gray} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-line">
          <p className="font-semibold mb-2 text-ink">Jobs received per month</p>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={metrics.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.line} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: PALETTE.slate }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: PALETTE.slate }} />
                <Tooltip />
                <Bar dataKey="jobs" fill={PALETTE.plum} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-line">
          <p className="font-semibold mb-2 text-ink">Jobs by style</p>
          <div style={{ width: "100%", height: 260 }}>
            {metrics.byStyle.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate">No jobs yet</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={metrics.byStyle} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name}>
                    {metrics.byStyle.map((_entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {showOverdue && <OverdueJobsModal onClose={() => setShowOverdue(false)} />}
    </div>
  );
}
