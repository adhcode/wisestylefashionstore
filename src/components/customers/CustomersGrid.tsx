"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Phone, MapPin, Scissors, Mail, MessageCircle, Palette, Heart, Briefcase } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CustomerForm } from "./CustomerForm";
import { deleteCustomer } from "@/actions/customer-actions";
import { jobDerived } from "@/domain/calculations";
import { formatCurrency } from "@/domain/format";
import type { Customer, Job } from "@/domain/entities";

export function CustomersGrid({ customers, jobs }: { customers: Customer[]; jobs: Job[] }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => `${c.name} ${c.phone} ${c.city ?? ""}`.toLowerCase().includes(q));
  }, [customers, search]);

  const shareTotals = useMemo(
    () =>
      jobs.reduce(
        (acc, j) => {
          const d = jobDerived(j);
          acc.tailorFee += d.tailorFee;
          acc.materialBudget += d.materialBudget;
          acc.officeUtility += d.officeUtility;
          acc.misc += d.miscellaneous;
          acc.profit += d.profit;
          return acc;
        },
        { tailorFee: 0, materialBudget: 0, officeUtility: 0, misc: 0, profit: 0 },
      ),
    [jobs],
  );

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      await deleteCustomer(id);
      setDeletingId(null);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink font-serif">Customers</h1>
          <p className="text-sm text-slate">{customers.length} customer(s)</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
          style={{ backgroundColor: "#3D2645" }}
        >
          <Plus size={16} /> New Customer
        </button>
      </div>

      <div className="bg-white rounded-lg border border-line p-4 mb-4">
        <p className="text-xs font-semibold uppercase mb-3 text-slate tracking-wide">Contract price sharing (across all jobs)</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded p-3 text-center" style={{ backgroundColor: "#F7F2E8" }}>
            <p className="text-xs text-slate">Material Budget</p>
            <p className="font-bold mt-1 text-ink">{formatCurrency(shareTotals.materialBudget)}</p>
          </div>
          <div className="rounded p-3 text-center" style={{ backgroundColor: "#E4F3EC" }}>
            <p className="text-xs text-slate">Profit (30%)</p>
            <p className="font-bold mt-1" style={{ color: "#1E8A5F" }}>
              {formatCurrency(shareTotals.profit)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded p-3 text-center" style={{ backgroundColor: "#F7F2E8" }}>
            <p className="text-xs text-slate">Tailor (25%)</p>
            <p className="font-bold mt-1 text-ink">{formatCurrency(shareTotals.tailorFee)}</p>
          </div>
          <div className="rounded p-3 text-center" style={{ backgroundColor: "#F7F2E8" }}>
            <p className="text-xs text-slate">Office &amp; Utility (40%)</p>
            <p className="font-bold mt-1 text-ink">{formatCurrency(shareTotals.officeUtility)}</p>
          </div>
          <div className="rounded p-3 text-center" style={{ backgroundColor: "#F7F2E8" }}>
            <p className="text-xs text-slate">Miscellaneous (5%)</p>
            <p className="font-bold mt-1 text-ink">{formatCurrency(shareTotals.misc)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-line rounded px-3 py-2 mb-4" style={{ maxWidth: 360 }}>
        <Search size={15} color="#6B6470" />
        <input placeholder="Search name, phone, city…" className="text-sm outline-none w-full border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-sm col-span-3 text-slate">No customers match your search.</p>}
        {filtered.map((c) => {
          const jobCount = jobs.filter((j) => j.customerId === c.id).length;
          return (
            <div key={c.id} className="bg-white rounded-lg border border-line p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-ink">{c.name}</p>
                  <p className="text-xs text-slate">
                    {c.customerNumber} • {c.gender}
                  </p>
                </div>
                {c.returning && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "#F7F2E8", color: "#C9973E" }}>
                    Returning
                  </span>
                )}
              </div>
              {c.preferredStyleImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.preferredStyleImage}
                  alt="Preferred style"
                  className="rounded mt-3 border border-line object-cover w-full"
                  style={{ height: 110 }}
                />
              )}
              <div className="mt-3 space-y-1 text-sm text-ink">
                <p className="flex items-center gap-2">
                  <Phone size={13} color="#6B6470" /> {c.phone || "—"}
                </p>
                {c.whatsapp && (
                  <p className="flex items-center gap-2">
                    <MessageCircle size={13} color="#6B6470" /> {c.whatsapp}
                  </p>
                )}
                {c.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={13} color="#6B6470" /> {c.email}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <MapPin size={13} color="#6B6470" /> {c.city || c.state || "—"}
                  {c.address ? ` • ${c.address}` : ""}
                </p>
                {c.occupation && (
                  <p className="flex items-center gap-2">
                    <Briefcase size={13} color="#6B6470" /> {c.occupation}
                  </p>
                )}
                {(c.preferredStyle || c.preferredFabric) && (
                  <p className="flex items-center gap-2">
                    <Scissors size={13} color="#6B6470" /> {[c.preferredStyle, c.preferredFabric].filter(Boolean).join(" • ")}
                  </p>
                )}
                {c.preferredColours && (
                  <p className="flex items-center gap-2">
                    <Palette size={13} color="#6B6470" /> {c.preferredColours}
                  </p>
                )}
                {c.occasion && (
                  <p className="flex items-center gap-2">
                    <Heart size={13} color="#6B6470" /> {c.occasion}
                  </p>
                )}
                {c.interests && <p className="text-xs text-slate">Interests: {c.interests}</p>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                <span className="text-xs text-slate">{jobCount} job(s) on file</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setShowForm(true);
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Pencil size={15} color="#6B6470" />
                  </button>
                  <button onClick={() => setDeletingId(c.id)} className="p-1 rounded hover:bg-gray-100">
                    <Trash2 size={15} color="#B23A48" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit Customer" : "New Customer"} onClose={() => setShowForm(false)}>
          <CustomerForm initial={editing} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {deletingId && (
        <Modal title="Delete Customer" onClose={() => setDeletingId(null)}>
          <p className="text-sm text-ink mb-4">Are you sure you want to delete this customer? This cannot be undone.</p>
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
