"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Users, DollarSign, TrendingUp } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ReferrerForm } from "./ReferrerForm";
import { deleteReferrer } from "@/actions/referrer-actions";
import { formatCurrency } from "@/domain/format";
import type { Referrer } from "@/domain/entities";
import type { ReferrerSummary } from "@/services/referrer-service";

export function ReferrersGrid({ summaries }: { summaries: ReferrerSummary[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Referrer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!search) return summaries;
    
    const q = search.toLowerCase();
    return summaries.filter((s) => 
      `${s.referrer.name} ${s.referrer.phone} ${s.referrer.referrerNumber}`.toLowerCase().includes(q)
    );
  }, [summaries, search]);

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, s) => {
        acc.totalReferrers += 1;
        acc.totalCustomers += s.customersReferred;
        acc.totalValue += s.totalJobValue;
        return acc;
      },
      { totalReferrers: 0, totalCustomers: 0, totalValue: 0 }
    );
  }, [summaries]);

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      await deleteReferrer(id);
      setDeletingId(null);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Partners</h1>
        <p className="text-sm text-gray-600">Track people who bring customers to your business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totals.totalReferrers}</p>
              <p className="text-sm text-gray-600">Total Referrers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totals.totalCustomers}</p>
              <p className="text-sm text-gray-600">Customers Referred</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{formatCurrency(totals.totalValue)}</p>
              <p className="text-sm text-gray-600">Total Job Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Search and Add Button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search referrers..."
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
              Add Referrer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Referrer
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customers
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {search ? "No referrers match your search." : "No referrers yet. Add your first referrer!"}
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr key={s.referrer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.referrer.name}</p>
                      <p className="text-xs text-gray-500">{s.referrer.referrerNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.referrer.phone || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.referrer.email || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                      {s.customersReferred}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(s.totalJobValue)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(s.referrer);
                          setShowForm(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit referrer"
                      >
                        <Pencil size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => setDeletingId(s.referrer.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete referrer"
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
              Showing {filtered.length} of {summaries.length} referrer{summaries.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <Modal title={editing ? "Edit Referrer" : "New Referrer"} onClose={() => setShowForm(false)}>
          <ReferrerForm 
            initial={editing} 
            onDone={() => setShowForm(false)} 
            onCancel={() => setShowForm(false)} 
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal title="Delete Referrer" onClose={() => setDeletingId(null)}>
          <p className="text-sm text-gray-700 mb-6">
            Are you sure you want to delete this referrer? This action cannot be undone.
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
              {pending ? "Deleting…" : "Delete Referrer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
