"use client";

import { useEffect, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { addWagePayment, deleteWagePayment, getWagePayments } from "@/actions/tailor-actions";
import { formatCurrency } from "@/domain/format";
import type { Tailor, TailorWageInfo, WagePayment } from "@/domain/entities";

export function WageModal({ tailor, wageInfo, onClose }: { tailor: Tailor; wageInfo: TailorWageInfo; onClose: () => void }) {
  const [payments, setPayments] = useState<WagePayment[] | null>(null);
  const [weekStart, setWeekStart] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const refresh = () => {
    getWagePayments(tailor.id).then(setPayments);
  };

  useEffect(refresh, [tailor.id]);

  const submit = () => {
    const amt = Number(amount);
    if (!weekStart) {
      setError("Choose the week starting date.");
      return;
    }
    if (!amount || Number.isNaN(amt) || amt <= 0) {
      setError("Enter a wage amount greater than 0.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await addWagePayment(tailor.id, {
        weekStart,
        amount: amt,
        note: note || null,
        datePaid: new Date().toISOString().slice(0, 10),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAmount("");
      setNote("");
      refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await deleteWagePayment(id);
      refresh();
    });
  };

  const sorted = (payments ?? []).slice().sort((a, b) => (b.weekStart || "").localeCompare(a.weekStart || ""));

  return (
    <Modal title={`Weekly Wages — ${tailor.name}`} onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F7F2E8" }}>
          <p className="text-xs text-slate">Total Earned</p>
          <p className="font-bold text-ink">{formatCurrency(wageInfo.earned)}</p>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#E4F3EC" }}>
          <p className="text-xs text-slate">Wage Paid</p>
          <p className="font-bold" style={{ color: "#1E8A5F" }}>
            {formatCurrency(wageInfo.paid)}
          </p>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#FBEAEA" }}>
          <p className="text-xs text-slate">Wage Pending</p>
          <p className="font-bold" style={{ color: "#B23A48" }}>
            {formatCurrency(wageInfo.pending)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <ErrorBanner messages={error ? [error] : []} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Week Starting">
            <input type="date" className={inputCls} value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
          </Field>
          <Field label="Amount Paid (₦)">
            <input type="number" min="0" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Note (optional)">
            <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "#3D2645" }}
        >
          Record Wage Payment
        </button>
      </div>

      <p className="text-xs font-semibold uppercase mb-2 text-slate tracking-wide">Payment history</p>
      <div className="border border-line rounded-lg divide-y divide-line">
        {payments === null && <p className="text-sm px-3 py-3 text-slate">Loading…</p>}
        {payments?.length === 0 && <p className="text-sm px-3 py-3 text-slate">No wage payments recorded yet.</p>}
        {sorted.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
            <div>
              <p className="text-ink">Week of {p.weekStart}</p>
              {p.note && <p className="text-xs text-slate">{p.note}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold" style={{ color: "#1E8A5F" }}>
                {formatCurrency(p.amount)}
              </span>
              <button onClick={() => remove(p.id)} className="p-1 rounded hover:bg-gray-100">
                <Trash2 size={14} color="#B23A48" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
