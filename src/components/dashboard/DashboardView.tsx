"use client";

import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  PiggyBank,
  TrendingUp,
  Users,
  Download,
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
import { OverdueJobsModal } from "./OverdueJobsModal";
import { ReportsModal } from "./ReportsModal";
import { formatCurrency } from "@/domain/format";
import { PIE_COLORS } from "@/lib/palette";
import type { DashboardMetrics } from "@/services/report-service";

export function DashboardView({ metrics }: { metrics: DashboardMetrics }) {
  const [showOverdue, setShowOverdue] = useState(false);
  const [showReports, setShowReports] = useState(false);

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-600">Overview of jobs, customers and finances</p>
        </div>
        <button
          onClick={() => setShowReports(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Export Reports</span>
          <span className="sm:hidden">Reports</span>
        </button>
      </div>

      {/* Jobs Stats */}
      <div className="mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Job Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <Briefcase className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.totalJobs}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.completed}</p>
                <p className="text-xs sm:text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.inProgress}</p>
                <p className="text-xs sm:text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowOverdue(true)}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.overdue}</p>
                <p className="text-xs sm:text-sm text-gray-600">Overdue</p>
                {metrics.dueSoon > 0 && (
                  <p className="text-xs text-red-600 mt-1">{metrics.dueSoon} due soon</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Financial Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Wallet className="text-green-600" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(metrics.revenue)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <PiggyBank className="text-emerald-600" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(metrics.profitTotal)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Net Profit</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <TrendingUp className="text-red-600" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(metrics.outstandingTotal)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Outstanding</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.male + metrics.female}</p>
                <p className="text-xs sm:text-sm text-gray-600">Customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Jobs per Month</h3>
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '13px'
                  }} 
                />
                <Bar dataKey="jobs" fill="#9333ea" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Jobs by Style</h3>
          <div className="w-full h-64 sm:h-72">
            {metrics.byStyle.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">No jobs yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={metrics.byStyle} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={window.innerWidth < 640 ? 70 : 90}
                    label={(e) => window.innerWidth >= 640 ? e.name : null}
                  >
                    {metrics.byStyle.map((_entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {showOverdue && <OverdueJobsModal onClose={() => setShowOverdue(false)} />}
      {showReports && <ReportsModal onClose={() => setShowReports(false)} />}
    </div>
  );
}
