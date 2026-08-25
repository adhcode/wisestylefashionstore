"use client";

import { useEffect, useState, useTransition } from "react";
import { Trash2, DollarSign, Calendar, FileText, Plus, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { addWagePayment, deleteWagePayment, getWagePayments } from "@/actions/tailor-actions";
import { formatCurrency } from "@/domain/format";
import type { Tailor, TailorWageInfo, WagePayment } from "@/domain/entities";

export function WageModal({ tailor, wageInfo, onClose }: { tailor: Tailor; wageInfo: TailorWageInfo; onClose: () => void }) {
  const [payments, setPayments] = useState<WagePayment[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [weekStart, setWeekStart] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      setWeekStart(new Date().toISOString().slice(0, 10));
      setShowAddForm(false);
      refresh();
    });
  };

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      await deleteWagePayment(id);
      setDeletingId(null);
      refresh();
    });
  };

  const sorted = (payments ?? []).slice().sort((a, b) => (b.weekStart || "").localeCompare(a.weekStart || ""));

  return (
    <Modal title="Wage Management" onClose={onClose} wide>
      <div className="max-h-[80vh] overflow-y-auto px-1">
        {/* Header Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{tailor.name}</h3>
          <p className="text-sm text-gray-600">Track and manage weekly wage payments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Earned</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(wageInfo.earned)}</p>
              </div>
            </div>
            <p className="text-xs text-blue-700">From completed jobs (25% of balance after materials)</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Wages Paid</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(wageInfo.paid)}</p>
              </div>
            </div>
            <p className="text-xs text-green-700">{payments?.length || 0} payment{payments?.length !== 1 ? "s" : ""} recorded</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Outstanding</p>
                <p className="text-xl font-bold text-red-900">{formatCurrency(wageInfo.pending)}</p>
              </div>
            </div>
            <p className="text-xs text-red-700">Amount owed to tailor</p>
          </div>
        </div>

        {/* Add Payment Section */}
        {!showAddForm ? (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Record New Wage Payment
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">New Wage Payment</h4>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setError("");
                  setAmount("");
                  setNote("");
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>

            <ErrorBanner messages={error ? [error] : []} />

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Week Starting *">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      className={`${inputCls} pl-10`}
                      value={weekStart}
                      onChange={(e) => setWeekStart(e.target.value)}
                    />
                  </div>
                </Field>

                <Field label="Amount Paid (₦) *">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${inputCls} pl-10`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Note (Optional)">
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea
                    className={`${inputCls} pl-10 resize-none`}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any notes about this payment..."
                    rows={2}
                  />
                </div>
              </Field>

              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors shadow-sm"
              >
                {pending ? "Recording…" : "Record Payment"}
              </button>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment History</h4>

          {payments === null ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-sm text-gray-500">Loading payment history...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="text-gray-400" size={32} />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No payments recorded yet</p>
              <p className="text-xs text-gray-500">Click "Record New Wage Payment" to add the first payment</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
              {sorted.map((p) => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">Week of {p.weekStart}</p>
                    </div>
                    {p.note && (
                      <p className="text-xs text-gray-600 ml-5">{p.note}</p>
                    )}
                    <p className="text-xs text-gray-500 ml-5">Recorded on {p.datePaid}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(p.amount)}
                    </span>
                    <button
                      onClick={() => setDeletingId(p.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete payment"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">How Wages Work</p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Tailors earn 25% of the balance remaining after materials are deducted from each job's contract price. 
                The "Total Earned" shows the sum of all completed jobs. Record weekly payments here to track what has been paid out.
              </p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Payment?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this wage payment? This action cannot be undone.
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
                  {pending ? "Deleting…" : "Delete Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
