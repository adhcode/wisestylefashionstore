"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Banknote, DollarSign } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { TailorForm } from "./TailorForm";
import { WageModal } from "./WageModal";
import { deleteTailor } from "@/actions/tailor-actions";
import { formatCurrency } from "@/domain/format";
import type { Tailor } from "@/domain/entities";
import type { TailorSummary } from "@/services/tailor-service";

export function TailorsGrid({ summaries }: { summaries: TailorSummary[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tailor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [wagesFor, setWagesFor] = useState<TailorSummary | null>(null);
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");

  const wageTotals = useMemo(
    () =>
      summaries.reduce(
        (acc, s) => {
          acc.earned += s.wageInfo.earned;
          acc.paid += s.wageInfo.paid;
          acc.pending += s.wageInfo.pending;
          return acc;
        },
        { earned: 0, paid: 0, pending: 0 },
      ),
    [summaries],
  );

  const filtered = useMemo(() => {
    let result = summaries;
    
    // Filter by tab
    if (activeTab === "active") {
      result = result.filter(s => s.jobsAssigned > 0);
    } else if (activeTab === "inactive") {
      result = result.filter(s => s.jobsAssigned === 0);
    }
    
    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => 
        `${s.tailor.name} ${s.tailor.phone ?? ""} ${s.tailor.tailorNumber}`.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [summaries, search, activeTab]);

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      await deleteTailor(id);
      setDeletingId(null);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Tailors</h1>
        <p className="text-sm text-gray-600">Manage your tailoring team</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{formatCurrency(wageTotals.earned)}</p>
              <p className="text-sm text-gray-600">Total Earned</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <Banknote className="text-green-600" size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{formatCurrency(wageTotals.paid)}</p>
              <p className="text-sm text-gray-600">Wages Paid</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <DollarSign className="text-red-600" size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{formatCurrency(wageTotals.pending)}</p>
              <p className="text-sm text-gray-600">Wages Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "all"
                  ? "text-purple-600 border-purple-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              All Tailors
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {summaries.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "active"
                  ? "text-purple-600 border-purple-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Active Tailors
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {summaries.filter(s => s.jobsAssigned > 0).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "inactive"
                  ? "text-purple-600 border-purple-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Inactive
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {summaries.filter(s => s.jobsAssigned === 0).length}
              </span>
            </button>
          </div>
        </div>

        {/* Table Header with Search and Button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tailors..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Tailor
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tailor Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Avg Rating
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jobs Assigned
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Completed
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Earned
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pending
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    {search ? "No tailors match your search." : "No tailors yet. Add your first tailor!"}
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr 
                  key={s.tailor.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.tailor.name}</p>
                      <p className="text-xs text-gray-500">{s.tailor.tailorNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.tailor.phone || "—"}</td>
                  <td className="px-6 py-4">
                    {s.averageRating !== null ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span 
                              key={i} 
                              className={i < Math.round(s.averageRating!) ? "text-yellow-400" : "text-gray-300"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {s.averageRating.toFixed(1)} ({s.ratingCount})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">No ratings yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                      {s.jobsAssigned}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
                      {s.jobsCompleted}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(s.wageInfo.earned)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${
                      s.wageInfo.pending > 0 ? "text-red-600" : "text-gray-700"
                    }`}>
                      {formatCurrency(s.wageInfo.pending)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setWagesFor(s)}
                        className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Manage wages"
                      >
                        <Banknote size={16} className="text-purple-600" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(s.tailor);
                          setShowForm(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit tailor"
                      >
                        <Pencil size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => setDeletingId(s.tailor.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete tailor"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filtered.length} of {summaries.length} tailor{summaries.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <Modal title={editing ? "Edit Tailor" : "New Tailor"} onClose={() => setShowForm(false)}>
          <TailorForm initial={editing} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {wagesFor && <WageModal tailor={wagesFor.tailor} wageInfo={wagesFor.wageInfo} onClose={() => setWagesFor(null)} />}

      {deletingId && (
        <Modal title="Delete Tailor" onClose={() => setDeletingId(null)}>
          <p className="text-sm text-gray-700 mb-6">
            Are you sure you want to delete this tailor? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmDelete(deletingId)}
              disabled={pending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
            >
              {pending ? "Deleting…" : "Delete Tailor"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
