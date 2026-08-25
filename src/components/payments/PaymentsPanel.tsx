"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Plus, Receipt, Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { addJobPayment } from "@/actions/job-actions";
import { buildPaymentEntries, jobDerived } from "@/domain/calculations";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import { STYLES } from "@/domain/constants";
import type { Job, JobStatus, PaymentType } from "@/domain/entities";

export function PaymentsPanel({ jobs }: { jobs: Job[] }) {
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStyle, setFilterStyle] = useState("All");
  const [filterStatus, setFilterStatus] = useState<JobStatus | "All">("All");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<"All" | "Outstanding" | "Fully Paid">("All");
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [payType, setPayType] = useState<PaymentType>("payment");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payNote, setPayNote] = useState("");
  const [payError, setPayError] = useState("");
  const [pending, startTransition] = useTransition();

  const jobsWithPaymentInfo = useMemo(() => {
    return jobs.map((j) => {
      const d = jobDerived(j);
      return {
        job: j,
        derived: d,
        entries: buildPaymentEntries(j),
      };
    });
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobsWithPaymentInfo.filter(({ job, derived }) => {
      if (filterStyle !== "All" && job.style !== filterStyle) return false;
      if (filterStatus !== "All" && derived.status !== filterStatus) return false;
      if (filterPaymentStatus === "Outstanding" && derived.outstanding <= 0) return false;
      if (filterPaymentStatus === "Fully Paid" && derived.outstanding > 0) return false;
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        if (!`${job.customerName} ${job.jobNumber}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [jobsWithPaymentInfo, filterStyle, filterStatus, filterPaymentStatus, filterSearch]);

  // Calculate stats
  const totalRevenue = jobs.reduce((sum, j) => sum + jobDerived(j).contractPrice, 0);
  const totalPaid = jobs.reduce((sum, j) => sum + jobDerived(j).totalPaid, 0);
  const totalOutstanding = jobs.reduce((sum, j) => sum + jobDerived(j).outstanding, 0);

  const openPaymentModal = (job: Job) => {
    setSelectedJob(job);
    setPayType("payment");
    setPayAmount("");
    setPayNote("");
    setPayError("");
    setShowPaymentModal(true);
  };

  const handleRecordPayment = () => {
    if (!selectedJob) return;
    
    const amt = Number(payAmount);
    if (!payAmount || Number.isNaN(amt) || amt <= 0) {
      setPayError("Enter an amount greater than 0.");
      return;
    }

    const entries = buildPaymentEntries(selectedJob);
    const paidSoFar = entries.length ? entries[entries.length - 1].runningTotal : 0;
    
    if (payType === "refund" && amt > paidSoFar) {
      setPayError(`Refund cannot exceed the total amount paid so far (${formatCurrency(paidSoFar)}).`);
      return;
    }
    
    setPayError("");
    startTransition(async () => {
      const result = await addJobPayment(selectedJob.id, {
        date: payDate,
        amount: amt,
        method: payType === "refund" ? "Refund" : payMethod,
        note: payNote || null,
        type: payType,
      });
      if (!result.success) {
        setPayError(result.error);
        return;
      }
      setPayAmount("");
      setPayNote("");
      setPayType("payment");
      setShowPaymentModal(false);
      setSelectedJob(null);
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments & Receipts</h1>
        <p className="text-sm text-gray-600">Track payments and manage outstanding balances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Receipt className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Receipt className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
              <p className="text-sm text-gray-600">Total Paid</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Receipt className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
              <p className="text-sm text-gray-600">Outstanding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                placeholder="Search customer or job #…" 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                value={filterSearch} 
                onChange={(e) => setFilterSearch(e.target.value)} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
            value={filterStyle} 
            onChange={(e) => setFilterStyle(e.target.value)}
          >
            <option value="All">All styles</option>
            {STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as JobStatus | "All")}
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value as "All" | "Outstanding" | "Fully Paid")}
          >
            <option value="All">All payment statuses</option>
            <option value="Outstanding">Outstanding balance</option>
            <option value="Fully Paid">Fully paid</option>
          </select>
        </div>
      </div>

      {/* Jobs Payment Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Job
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contract Price
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Paid
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Balance
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No jobs match your filters.
                  </td>
                </tr>
              )}
              {filteredJobs.map(({ job, derived, entries }) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.jobNumber}</p>
                      <p className="text-xs text-gray-500">{styleLabelOf(job)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{job.customerName}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={derived.status} />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(derived.contractPrice)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(derived.totalPaid)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${
                      derived.outstanding > 0 ? "text-red-600" : "text-gray-500"
                    }`}>
                      {formatCurrency(derived.outstanding)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openPaymentModal(job)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Record payment"
                      >
                        <Plus size={14} />
                        Payment
                      </button>
                      {entries.length > 0 && (
                        <a
                          href={`/api/documents/receipt/${job.id}/${entries[entries.length - 1].id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download latest receipt"
                        >
                          <Download size={14} />
                          Receipt
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredJobs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} job{jobs.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedJob && (
        <Modal 
          title={`Record Payment - ${selectedJob.jobNumber}`} 
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedJob(null);
          }}
        >
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Customer</p>
                <p className="font-semibold text-gray-900">{selectedJob.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Contract Price</p>
                <p className="font-semibold text-gray-900">{formatCurrency(jobDerived(selectedJob).contractPrice)}</p>
              </div>
              <div>
                <p className="text-gray-600">Paid So Far</p>
                <p className="font-semibold text-green-600">{formatCurrency(jobDerived(selectedJob).totalPaid)}</p>
              </div>
              <div>
                <p className="text-gray-600">Outstanding</p>
                <p className="font-semibold text-red-600">{formatCurrency(jobDerived(selectedJob).outstanding)}</p>
              </div>
            </div>
          </div>

          <ErrorBanner messages={payError ? [payError] : []} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Type">
              <select className={inputCls} value={payType} onChange={(e) => setPayType(e.target.value as PaymentType)}>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </select>
            </Field>
            <Field label="Date">
              <input type="date" className={inputCls} value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </Field>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Amount (₦)">
              <input 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="0.00" 
                className={inputCls} 
                value={payAmount} 
                onChange={(e) => setPayAmount(e.target.value)} 
              />
            </Field>
            {payType === "payment" ? (
              <Field label="Payment Method">
                <select className={inputCls} value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>POS</option>
                  <option>Other</option>
                </select>
              </Field>
            ) : (
              <Field label="Method">
                <input 
                  disabled 
                  className={inputCls} 
                  style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }} 
                  value="Refund" 
                  readOnly 
                />
              </Field>
            )}
          </div>
          
          <Field label={payType === "refund" ? "Reason for refund (optional)" : "Note (optional)"}>
            <input
              placeholder={payType === "refund" ? "Reason for refund" : "Additional notes"}
              className={inputCls}
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
            />
          </Field>

          {/* Payment History */}
          {buildPaymentEntries(selectedJob).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment History</h3>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden max-h-48 overflow-y-auto">
                {buildPaymentEntries(selectedJob).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-700">
                      {entry.date || "—"} • {entry.type === "refund" ? "Refund" : entry.method || "Payment"}
                    </span>
                    <span className={`font-semibold ${entry.type === "refund" ? "text-red-600" : "text-green-600"}`}>
                      {entry.type === "refund" ? "-" : ""}
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedJob(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRecordPayment}
              disabled={pending}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-colors ${
                payType === "refund" ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {pending ? "Recording…" : payType === "refund" ? "Record Refund" : "Record Payment"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
