"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Select } from "@/components/ui/Select";
import { JobForm } from "./JobForm";
import { jobDerived } from "@/domain/calculations";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import { MONTHS, STYLES } from "@/domain/constants";
import type { Customer, Job, JobStatus, MaterialType, Tailor } from "@/domain/entities";

interface JobsTableProps {
  jobs: Job[];
  customers: Customer[];
  tailors: Tailor[];
  materialTypes: MaterialType[];
  canManage: boolean;
  isAdmin: boolean;
}

export function JobsTable({ jobs, customers, tailors, materialTypes, canManage, isAdmin }: JobsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>(customers);

  const filtered = useMemo(() => {
    return jobs
      .filter((j) => {
        if (styleFilter !== "All" && j.style !== styleFilter) return false;
        if (monthFilter !== "All") {
          const month = j.dateReceived ? MONTHS[new Date(j.dateReceived + "T00:00:00").getMonth()] : null;
          if (month !== monthFilter) return false;
        }
        if (statusFilter !== "All" && jobDerived(j).status !== statusFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          const hay = `${j.customerName} ${j.style} ${j.tailorName ?? ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.dateReceived ?? "").localeCompare(a.dateReceived ?? ""));
  }, [jobs, styleFilter, monthFilter, statusFilter, search]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Jobs</h1>
        <p className="text-sm text-gray-600">{jobs.length} job{jobs.length !== 1 ? "s" : ""} in total</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                placeholder="Search customer, style, tailor…"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              New Job
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select
            value={styleFilter}
            onChange={setStyleFilter}
            options={[
              { value: "All", label: "All styles" },
              ...STYLES.map((s) => ({ value: s, label: s })),
            ]}
            placeholder="All styles"
            searchPlaceholder="Search styles…"
            className="w-48"
          />
          <Select
            value={monthFilter}
            onChange={setMonthFilter}
            options={[
              { value: "All", label: "All months" },
              ...MONTHS.map((m) => ({ value: m, label: m })),
            ]}
            placeholder="All months"
            searchPlaceholder="Search months…"
            className="w-48"
          />
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as JobStatus | "All")}
            options={[
              { value: "All", label: "All statuses" },
              { value: "Pending", label: "Pending" },
              { value: "In Progress", label: "In Progress" },
              { value: "Completed", label: "Completed" },
            ]}
            placeholder="All statuses"
            searchPlaceholder="Search statuses…"
            className="w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Customer", "Style", "Received", "Contract", "Tailor", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No jobs match your filters yet.
                  </td>
                </tr>
              )}
              {filtered.map((j) => {
                const d = jobDerived(j);
                return (
                  <tr
                    key={j.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/jobs/${j.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{j.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{styleLabelOf(j)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{j.dateReceived}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(d.contractPrice)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{j.tailorName ?? "—"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filtered.length} of {jobs.length} job{jobs.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* New Job Modal */}
      {showForm && (
        <Modal title="New Job" onClose={() => setShowForm(false)} wide>
          <JobForm
            initial={null}
            customers={customersList}
            tailors={tailors}
            materialTypes={materialTypes}
            onDone={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
            onCustomerAdded={(newCustomer) => {
              setCustomersList((prev) => [...prev, newCustomer]);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
