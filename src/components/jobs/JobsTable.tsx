"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Eye, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { MeasureBar } from "@/components/ui/MeasureBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { JobForm } from "./JobForm";
import { deleteJob } from "@/actions/job-actions";
import { jobDerived } from "@/domain/calculations";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import { MONTHS, STYLES } from "@/domain/constants";
import type { Customer, Job, JobStatus, Tailor } from "@/domain/entities";

interface JobsTableProps {
  jobs: Job[];
  customers: Customer[];
  tailors: Tailor[];
  canManage: boolean;
}

export function JobsTable({ jobs, customers, tailors, canManage }: JobsTableProps) {
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
          const hay = `${j.customerName} ${j.jobNumber} ${j.style} ${j.tailorName ?? ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.dateReceived ?? "").localeCompare(a.dateReceived ?? ""));
  }, [jobs, styleFilter, monthFilter, statusFilter, search]);

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      await deleteJob(id);
      setDeletingId(null);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink font-serif">Jobs</h1>
          <p className="text-sm text-slate">{jobs.length} job(s)</p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
            style={{ backgroundColor: "#3D2645" }}
          >
            <Plus size={16} /> New Job
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-line rounded px-3 py-2">
          <Search size={15} color="#6B6470" />
          <input
            placeholder="Search customer, job #, tailor…"
            className="text-sm outline-none border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="border border-line rounded px-3 py-2 text-sm bg-white" value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}>
          <option value="All">All styles</option>
          {STYLES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="border border-line rounded px-3 py-2 text-sm bg-white" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="All">All months</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="border border-line rounded px-3 py-2 text-sm bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | "All")}
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#F7F2E8" }}>
              {["Job #", "Customer", "Style", "Received", "Contract", "Progress", "Tailor", "Status", ""].map((h) => (
                <th key={h} className="text-left px-3 py-2 font-semibold text-slate">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate">
                  No jobs match your filters yet.
                </td>
              </tr>
            )}
            {filtered.map((j) => {
              const d = jobDerived(j);
              return (
                <tr key={j.id} className="border-t border-line">
                  <td className="px-3 py-2 font-semibold">{j.jobNumber}</td>
                  <td className="px-3 py-2">{j.customerName}</td>
                  <td className="px-3 py-2">{styleLabelOf(j)}</td>
                  <td className="px-3 py-2">{j.dateReceived}</td>
                  <td className="px-3 py-2">{formatCurrency(d.contractPrice)}</td>
                  <td className="px-3 py-2" style={{ width: 140 }}>
                    <MeasureBar value={d.progress} />
                  </td>
                  <td className="px-3 py-2">{j.tailorName ?? "—"}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Link href={`/jobs/${j.id}`} className="p-1 rounded hover:bg-gray-100" title="View details">
                        <Eye size={15} color="#3D2645" />
                      </Link>
                      {canManage && (
                        <button
                          onClick={() => {
                            setEditing(j);
                            setShowForm(true);
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <Pencil size={15} color="#6B6470" />
                        </button>
                      )}
                      {canManage && (
                        <a href={`/api/documents/invoice/${j.id}`} className="p-1 rounded hover:bg-gray-100" title="Download invoice">
                          <FileText size={15} color="#C9973E" />
                        </a>
                      )}
                      {canManage && (
                        <button onClick={() => setDeletingId(j.id)} className="p-1 rounded hover:bg-gray-100" title="Delete">
                          <Trash2 size={15} color="#B23A48" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? "Edit Job" : "New Job"} onClose={() => setShowForm(false)} wide>
          <JobForm
            initial={editing}
            customers={customers}
            tailors={tailors}
            onDone={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {deletingId && (
        <Modal title="Delete Job" onClose={() => setDeletingId(null)}>
          <p className="text-sm text-ink mb-4">Are you sure you want to delete this job? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded text-sm font-semibold text-slate">
              Cancel
            </button>
            <button
              onClick={() => confirmDelete(deletingId)}
              disabled={pending}
              className="px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#B23A48" }}
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
