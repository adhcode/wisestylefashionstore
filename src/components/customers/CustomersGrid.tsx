"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Users, RefreshCw, Briefcase } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CustomerForm } from "./CustomerForm";
import { deleteCustomer } from "@/actions/customer-actions";
import type { Customer, Job, Referrer } from "@/domain/entities";

export function CustomersGrid({ customers, jobs, referrers }: { customers: Customer[]; jobs: Job[]; referrers: Referrer[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "new">("all");

  const filtered = useMemo(() => {
    let result = customers;
    
    // Filter by tab
    if (activeTab === "active") {
      result = result.filter(c => c.returning);
    } else if (activeTab === "new") {
      result = result.filter(c => !c.returning);
    }
    
    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => 
        `${c.name} ${c.phone} ${c.email ?? ""} ${c.city ?? ""}`.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [customers, search, activeTab]);

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      await deleteCustomer(id);
      setDeletingId(null);
      router.refresh();
    });
  };

  const getJobCount = (customerId: string) => {
    return jobs.filter((j) => j.customerId === customerId).length;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Customers</h1>
        <p className="text-sm text-gray-600">Manage your customer database</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{customers.length}</p>
              <p className="text-sm text-gray-600">Total Customers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <RefreshCw className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {customers.filter(c => c.returning).length}
              </p>
              <p className="text-sm text-gray-600">Returning Customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <Briefcase className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{jobs.length}</p>
              <p className="text-sm text-gray-600">Total Jobs</p>
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
              All Customers
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {customers.length}
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
              Active Members
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {customers.filter(c => c.returning).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "new"
                  ? "text-purple-600 border-purple-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              New Customers
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {customers.filter(c => !c.returning).length}
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
                  placeholder="Search customers..."
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
              Add Customer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jobs
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    {search ? "No customers match your search." : "No customers yet. Add your first customer!"}
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const jobCount = getJobCount(c.id);
                return (
                  <tr 
                    key={c.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/customers/${c.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.customerNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{c.phone || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{c.email || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {c.city || c.state || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{jobCount}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        c.returning 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {c.returning ? "Active" : "New"}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(c);
                            setShowForm(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit customer"
                        >
                          <Pencil size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(c.id);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete customer"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
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
              Showing {filtered.length} of {customers.length} customer{customers.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {showForm && (
        <Modal title={editing ? "Edit Customer" : "New Customer"} onClose={() => setShowForm(false)}>
          <CustomerForm initial={editing} referrers={referrers} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal title="Delete Customer" onClose={() => setDeletingId(null)}>
          <p className="text-sm text-gray-700 mb-6">
            Are you sure you want to delete this customer? This action cannot be undone.
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
              {pending ? "Deleting…" : "Delete Customer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
