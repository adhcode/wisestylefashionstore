"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Banknote, Wallet, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { TailorForm } from "./TailorForm";
import { WageModal } from "./WageModal";
import { deleteTailor } from "@/actions/tailor-actions";
import { formatCurrency } from "@/domain/format";
import { PALETTE } from "@/lib/palette";
import type { Tailor } from "@/domain/entities";
import type { TailorSummary } from "@/services/tailor-service";

export function TailorsGrid({ summaries }: { summaries: TailorSummary[] }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tailor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [wagesFor, setWagesFor] = useState<TailorSummary | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!search) return summaries;
    const q = search.toLowerCase();
    return summaries.filter((s) => `${s.tailor.name} ${s.tailor.phone ?? ""} ${s.tailor.tailorNumber}`.toLowerCase().includes(q));
  }, [summaries, search]);

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

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      await deleteTailor(id);
      setDeletingId(null);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink font-serif">Tailors</h1>
          <p className="text-sm text-slate">{summaries.length} tailor(s)</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
          style={{ backgroundColor: "#3D2645" }}
        >
          <Plus size={16} /> New Tailor
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard icon={Wallet} label="Total Wages Earned" value={formatCurrency(wageTotals.earned)} accent={PALETTE.plum} />
        <StatCard icon={Banknote} label="Wage Paid (weekly)" value={formatCurrency(wageTotals.paid)} accent={PALETTE.emerald} />
        <StatCard icon={AlertTriangle} label="Wage Pending" value={formatCurrency(wageTotals.pending)} accent={PALETTE.rose} />
      </div>

      <div className="flex items-center gap-2 bg-white border border-line rounded px-3 py-2 mb-4" style={{ maxWidth: 360 }}>
        <Search size={15} color="#6B6470" />
        <input placeholder="Search name, phone, tailor #…" className="text-sm outline-none w-full border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-sm col-span-3 text-slate">{summaries.length === 0 ? "No tailors yet." : "No tailors match your search."}</p>}
        {filtered.map((s) => (
          <div key={s.tailor.id} className="bg-white rounded-lg border border-line p-4">
            <p className="font-bold text-ink">{s.tailor.name}</p>
            <p className="text-xs text-slate">
              {s.tailor.tailorNumber} • Joined {s.tailor.dateJoined ?? "—"}
            </p>
            <p className="text-xs mt-1 text-slate">
              Rating: {"★".repeat(s.tailor.rating)}
              {"☆".repeat(5 - s.tailor.rating)}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div>
                <p className="text-lg font-bold text-ink">{s.jobsAssigned}</p>
                <p className="text-xs text-slate">Assigned</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "#1E8A5F" }}>
                  {s.jobsCompleted}
                </p>
                <p className="text-xs text-slate">Completed</p>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#C9973E" }}>
                  {formatCurrency(s.wageInfo.earned)}
                </p>
                <p className="text-xs text-slate">Earned</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-center">
              <div className="rounded p-1" style={{ backgroundColor: "#E4F3EC" }}>
                <p className="text-sm font-bold" style={{ color: "#1E8A5F" }}>
                  {formatCurrency(s.wageInfo.paid)}
                </p>
                <p className="text-xs text-slate">Wage Paid</p>
              </div>
              <div className="rounded p-1" style={{ backgroundColor: "#FBEAEA" }}>
                <p className="text-sm font-bold" style={{ color: "#B23A48" }}>
                  {formatCurrency(s.wageInfo.pending)}
                </p>
                <p className="text-xs text-slate">Wage Pending</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
              <button onClick={() => setWagesFor(s)} className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#3D2645" }}>
                <Banknote size={15} /> Wages
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(s.tailor);
                    setShowForm(true);
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Pencil size={15} color="#6B6470" />
                </button>
                <button onClick={() => setDeletingId(s.tailor.id)} className="p-1 rounded hover:bg-gray-100">
                  <Trash2 size={15} color="#B23A48" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit Tailor" : "New Tailor"} onClose={() => setShowForm(false)}>
          <TailorForm initial={editing} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {wagesFor && <WageModal tailor={wagesFor.tailor} wageInfo={wagesFor.wageInfo} onClose={() => setWagesFor(null)} />}

      {deletingId && (
        <Modal title="Delete Tailor" onClose={() => setDeletingId(null)}>
          <p className="text-sm text-ink mb-4">Are you sure you want to delete this tailor? This cannot be undone.</p>
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
