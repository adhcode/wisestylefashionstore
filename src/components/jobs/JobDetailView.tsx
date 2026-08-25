"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Pencil, Trash2, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Select } from "@/components/ui/Select";
import { JobForm } from "@/components/jobs/JobForm";
import { SatisfactionRatingModal } from "@/components/jobs/SatisfactionRatingModal";
import { deleteJob, updateJob, updateJobSatisfactionRating } from "@/actions/job-actions";
import { jobDerived } from "@/domain/calculations";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import { getMaterialLabel, getMaterialUnit, isMaterialDeleted, getUsedMaterialKeys } from "@/domain/material-helpers";
import type { Job, Customer, Tailor, MaterialType, JobStatus, PaymentLedgerEntry } from "@/domain/entities";

interface JobDetailViewProps {
  job: Job;
  customers: Customer[];
  tailors: Tailor[];
  materialTypes: MaterialType[];
  payments: PaymentLedgerEntry[];
  canManage: boolean;
  isAdmin: boolean;
  canSeeFinancials: boolean;
}

export function JobDetailView({
  job,
  customers,
  tailors,
  materialTypes,
  payments,
  canManage,
  isAdmin,
  canSeeFinancials,
}: JobDetailViewProps) {
  const router = useRouter();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [pending, startTransition] = useTransition();
  const [customersList, setCustomersList] = useState<Customer[]>(customers);

  const d = jobDerived(job);
  const usedMaterialKeys = getUsedMaterialKeys(job.materials);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteJob(job.id);
      setShowDeleteModal(false);
      router.push("/jobs");
    });
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    // If changing to completed and no satisfaction rating yet, show modal
    if (newStatus === "Completed" && !job.satisfactionRating && job.tailorId) {
      setShowSatisfactionModal(true);
      return;
    }

    // Otherwise, update status normally
    startTransition(async () => {
      let newProgress = job.progress;
      let actualCompletionDate = job.actualCompletionDate;
      
      if (newStatus === "Completed") {
        newProgress = 100;
        actualCompletionDate = actualCompletionDate || new Date().toISOString().slice(0, 10);
      } else if (newStatus === "Pending") {
        newProgress = 0;
        actualCompletionDate = null;
      } else if (newStatus === "In Progress") {
        if (newProgress === 0 || newProgress === 100) {
          newProgress = 50;
        }
        actualCompletionDate = null;
      }

      await updateJob(job.id, {
        customerId: job.customerId,
        style: job.style,
        styleOther: job.styleOther,
        dateReceived: job.dateReceived,
        startDate: job.startDate,
        completionDate: job.completionDate,
        actualCompletionDate,
        contractPrice: job.contractPrice,
        depositPaid: job.depositPaid,
        materials: job.materials,
        measurements: job.measurements,
        tailorId: job.tailorId,
        progress: newProgress,
        notes: job.notes,
      });
      router.refresh();
    });
  };

  const handleSatisfactionSubmit = (rating: number) => {
    startTransition(async () => {
      // First, update the satisfaction rating
      await updateJobSatisfactionRating(job.id, rating);
      
      // Then, update the job status to completed
      await updateJob(job.id, {
        customerId: job.customerId,
        style: job.style,
        styleOther: job.styleOther,
        dateReceived: job.dateReceived,
        startDate: job.startDate,
        completionDate: job.completionDate,
        actualCompletionDate: job.actualCompletionDate || new Date().toISOString().slice(0, 10),
        contractPrice: job.contractPrice,
        depositPaid: job.depositPaid,
        materials: job.materials,
        measurements: job.measurements,
        tailorId: job.tailorId,
        progress: 100,
        notes: job.notes,
      });
      
      setShowSatisfactionModal(false);
      router.refresh();
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-600 mb-6 hover:text-purple-600 transition-colors">
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {styleLabelOf(job)}
            </h1>
            <p className="text-sm text-gray-600">{job.jobNumber} • {job.customerName}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={d.status} />
            
            {canManage && (
              <>
                <Select
                  value={d.status}
                  onChange={(value) => handleStatusChange(value as JobStatus)}
                  options={[
                    { value: "Pending", label: "Set to Pending" },
                    { value: "In Progress", label: "Set to In Progress" },
                    { value: "Completed", label: "Set to Completed" },
                  ]}
                  placeholder="Change status"
                  className="w-full sm:w-48"
                  disabled={pending}
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit job"
                  >
                    <Pencil size={18} className="text-gray-600" />
                  </button>

                  <a 
                    href={`/api/documents/invoice/${job.id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download invoice"
                  >
                    <FileText size={18} className="text-purple-600" />
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete job (Admin only)"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dates Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Received</p>
            <p className="text-sm font-medium text-gray-900">{job.dateReceived ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Start</p>
            <p className="text-sm font-medium text-gray-900">{job.startDate ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Expected</p>
            <p className="text-sm font-medium text-gray-900">{job.completionDate ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Completed</p>
            <p className="text-sm font-medium text-gray-900">{job.actualCompletionDate ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Materials Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Materials Needed</h2>
        {usedMaterialKeys.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No materials selected for this job.</p>
        ) : (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
            {usedMaterialKeys.map((key) => {
              const m = job.materials[key];
              const isDeleted = isMaterialDeleted(materialTypes, key);
              const label = getMaterialLabel(materialTypes, key);
              const unit = getMaterialUnit(materialTypes, key);

              return (
                <div
                  key={key}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 ${
                    isDeleted ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className={`text-sm font-medium ${isDeleted ? "italic text-gray-500" : "text-gray-900"}`}>
                      {label}
                    </span>
                    {isDeleted && (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full"
                        title="This material type has been removed from the system"
                      >
                        <AlertCircle size={12} />
                        Deleted
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`${isDeleted ? "text-gray-500" : "text-gray-700"}`}>
                      {m.qty} {unit} × {formatCurrency(m.cost)}
                    </span>
                    {canSeeFinancials && (
                      <span className={`font-semibold min-w-20 text-right ${isDeleted ? "text-gray-600" : "text-gray-900"}`}>
                        {formatCurrency(m.qty * m.cost)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {canSeeFinancials && usedMaterialKeys.length > 0 && (
              <div className="bg-purple-50 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Material Budget</span>
                <span className="text-lg font-bold text-purple-600">{formatCurrency(d.materialBudget)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Financials Section */}
      {canSeeFinancials && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Breakdown</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Contract Price</span>
                <span className="font-semibold text-gray-900">{formatCurrency(d.contractPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                <span className="text-gray-600">Balance after Materials</span>
                <span className="font-semibold text-gray-900">{formatCurrency(d.balanceAfterMaterial)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm pt-3">
                <span className="text-gray-600">Tailor Fee (25%)</span>
                <span className="text-right font-semibold text-gray-900">{formatCurrency(d.tailorFee)}</span>
                <span className="text-gray-600">Office & Utility (40%)</span>
                <span className="text-right font-semibold text-gray-900">{formatCurrency(d.officeUtility)}</span>
                <span className="text-gray-600">Miscellaneous (5%)</span>
                <span className="text-right font-semibold text-gray-900">{formatCurrency(d.miscellaneous)}</span>
                <span className="font-semibold text-purple-600">Profit (30%)</span>
                <span className="text-right font-bold text-green-600">{formatCurrency(d.profit)}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(d.totalPaid)}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(d.outstanding)}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Tailor</p>
              <p className="text-xl font-bold text-gray-900 truncate">{job.tailorName ?? "—"}</p>
            </div>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {payments.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3">
                    <span className="text-sm text-gray-700">
                      {p.date || "—"} • {p.type === "refund" ? "Refund" : p.method || "—"}
                    </span>
                    <span className={`text-sm font-semibold ${p.type === "refund" ? "text-red-600" : "text-green-600"}`}>
                      {p.type === "refund" ? "-" : ""}
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Notes Section */}
      {job.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes & Instructions</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.notes}</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && (
        <Modal title="Edit Job" onClose={() => setShowEditForm(false)} wide>
          <JobForm
            initial={job}
            customers={customersList}
            tailors={tailors}
            materialTypes={materialTypes}
            onDone={() => {
              setShowEditForm(false);
              router.refresh();
            }}
            onCancel={() => setShowEditForm(false)}
            onCustomerAdded={(newCustomer) => {
              setCustomersList((prev) => [...prev, newCustomer]);
            }}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal title="Delete Job" onClose={() => setShowDeleteModal(false)}>
          <p className="text-sm text-gray-700 mb-6">
            Are you sure you want to delete this job? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
            >
              {pending ? "Deleting…" : "Delete Job"}
            </button>
          </div>
        </Modal>
      )}

      {/* Satisfaction Rating Modal */}
      {showSatisfactionModal && (
        <SatisfactionRatingModal
          jobNumber={job.jobNumber}
          tailorName={job.tailorName}
          onSubmit={handleSatisfactionSubmit}
          onCancel={() => setShowSatisfactionModal(false)}
          pending={pending}
        />
      )}
    </div>
  );
}
