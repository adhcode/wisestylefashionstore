"use client";

import { useMemo, useState, useTransition } from "react";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { MeasureBar } from "@/components/ui/MeasureBar";
import { createJob, updateJob } from "@/actions/job-actions";
import { emptyMaterials, jobDerived } from "@/domain/calculations";
import { formatCurrency, monthNameFromDate } from "@/domain/format";
import { MATERIALS_DEF, STYLES } from "@/domain/constants";
import type { Customer, Job, JobInput, MaterialsState, Tailor } from "@/domain/entities";

interface JobFormProps {
  initial: Job | null;
  customers: Customer[];
  tailors: Tailor[];
  onDone: () => void;
  onCancel: () => void;
}

type FormState = JobInput;

function toFormState(job: Job | null): FormState {
  if (job) {
    return {
      customerId: job.customerId,
      style: job.style,
      styleOther: job.styleOther,
      dateReceived: job.dateReceived,
      startDate: job.startDate,
      completionDate: job.completionDate,
      actualCompletionDate: job.actualCompletionDate,
      contractPrice: job.contractPrice,
      depositPaid: job.depositPaid,
      materials: job.materials,
      tailorId: job.tailorId,
      progress: job.progress,
      notes: job.notes,
    };
  }
  return {
    customerId: "",
    style: STYLES[0],
    styleOther: null,
    dateReceived: new Date().toISOString().slice(0, 10),
    startDate: null,
    completionDate: null,
    actualCompletionDate: null,
    contractPrice: 0,
    depositPaid: 0,
    materials: emptyMaterials(),
    tailorId: null,
    progress: 0,
    notes: null,
  };
}

export function JobForm({ initial, customers, tailors, onDone, onCancel }: JobFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setMaterial = (key: keyof MaterialsState, patch: Partial<MaterialsState[keyof MaterialsState]>) =>
    setForm((f) => ({ ...f, materials: { ...f.materials, [key]: { ...f.materials[key], ...patch } } }));

  const derived = useMemo(() => jobDerived({ ...form, payments: initial?.payments ?? [] }), [form, initial]);

  const submit = () => {
    const errs: string[] = [];
    if (!form.customerId) errs.push("Choose a customer.");
    if (form.style === "Others" && !(form.styleOther ?? "").trim()) errs.push('Please specify the style under "Others".');
    if (!form.contractPrice || form.contractPrice <= 0) errs.push("Enter a contract price greater than 0.");
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    startTransition(async () => {
      const result = initial ? await updateJob(initial.id, form) : await createJob(form);
      if (!result.success) {
        setErrors([result.error]);
        return;
      }
      onDone();
    });
  };

  return (
    <div>
      <ErrorBanner messages={errors} />
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Customer *">
          <select className={inputCls} value={form.customerId} onChange={(e) => set("customerId", e.target.value)}>
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
          {customers.length === 0 && (
            <p className="text-xs mt-1 text-slate">No customers yet — add one from the Customers page first.</p>
          )}
        </Field>
        <Field label="Class of Style">
          <select className={inputCls} value={form.style} onChange={(e) => set("style", e.target.value)}>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        {form.style === "Others" && (
          <Field label="Specify Style">
            <input className={inputCls} value={form.styleOther ?? ""} onChange={(e) => set("styleOther", e.target.value)} />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Date Received">
          <input type="date" className={inputCls} value={form.dateReceived ?? ""} onChange={(e) => set("dateReceived", e.target.value)} />
        </Field>
        <Field label="Month Received">
          <input disabled className={`${inputCls} bg-gray-50`} style={{ color: "#6B6470" }} value={monthNameFromDate(form.dateReceived)} readOnly />
        </Field>
        <Field label="Start Date">
          <input type="date" className={inputCls} value={form.startDate ?? ""} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="Expected Completion Date">
          <input type="date" className={inputCls} value={form.completionDate ?? ""} onChange={(e) => set("completionDate", e.target.value)} />
        </Field>
        <Field label="Actual Completion Date">
          <input type="date" className={inputCls} value={form.actualCompletionDate ?? ""} onChange={(e) => set("actualCompletionDate", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Contract Price (₦) *">
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.contractPrice || ""}
            onChange={(e) => set("contractPrice", Number(e.target.value))}
          />
        </Field>
        <Field label="Deposit Paid (₦)">
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.depositPaid || ""}
            onChange={(e) => set("depositPaid", Number(e.target.value))}
          />
        </Field>
      </div>

      <p className="text-xs font-semibold uppercase mt-2 mb-2 text-slate tracking-wide">Materials needed</p>
      <div className="border border-line rounded-lg divide-y divide-line">
        {MATERIALS_DEF.map((d) => {
          const m = form.materials[d.key];
          return (
            <div key={d.key} className="flex items-center gap-3 px-3 py-2">
              <input type="checkbox" checked={m.included} onChange={(e) => setMaterial(d.key, { included: e.target.checked })} />
              <span className="text-sm flex-1 text-ink">{d.label}</span>
              <select
                disabled={!m.included}
                className="border border-line rounded px-2 py-1 text-sm"
                style={{ width: 92 }}
                value={m.qty}
                onChange={(e) => setMaterial(d.key, { qty: Number(e.target.value) })}
              >
                {Array.from({ length: d.max }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {d.unit}
                  </option>
                ))}
              </select>
              <input
                disabled={!m.included}
                type="number"
                min="0"
                placeholder="Unit cost ₦"
                className="border border-line rounded px-2 py-1 text-sm"
                style={{ width: 110 }}
                value={m.cost || ""}
                onChange={(e) => setMaterial(d.key, { cost: Number(e.target.value) })}
              />
              <span className="text-sm font-semibold text-ink" style={{ width: 90, textAlign: "right" }}>
                {m.included ? formatCurrency(m.qty * m.cost) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-x-4 mt-4">
        <Field label="Handling Tailor">
          <select className={inputCls} value={form.tailorId ?? ""} onChange={(e) => set("tailorId", e.target.value || null)}>
            <option value="">Unassigned</option>
            {tailors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={`Work-in-progress: ${form.progress}%`}>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={form.progress}
          onChange={(e) => set("progress", Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-1">
          <MeasureBar value={form.progress} />
        </div>
      </Field>

      <Field label="Notes / Special Instructions">
        <textarea className={inputCls} rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
      </Field>

      <div className="rounded-lg p-3 mt-2" style={{ backgroundColor: "#F7F2E8" }}>
        <p className="text-xs font-semibold uppercase mb-2 text-slate tracking-wide">Contract price allocation</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate">Material Budget (= Materials Needed total)</span>
          <span className="font-semibold text-ink">{formatCurrency(derived.materialBudget)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1 pb-2 border-b border-line">
          <span className="text-slate">Balance after Material Budget</span>
          <span className="font-semibold text-ink">{formatCurrency(derived.balanceAfterMaterial)}</span>
        </div>
        <p className="text-xs mt-2 mb-1 text-slate">Balance shared as:</p>
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <span className="text-slate">Tailor Fee (25%)</span>
          <span className="text-right font-semibold">{formatCurrency(derived.tailorFee)}</span>
          <span className="text-slate">Office &amp; Utility (40%)</span>
          <span className="text-right font-semibold">{formatCurrency(derived.officeUtility)}</span>
          <span className="text-slate">Miscellaneous (5%)</span>
          <span className="text-right font-semibold">{formatCurrency(derived.miscellaneous)}</span>
          <span className="font-bold text-ink">Profit (30%)</span>
          <span className="text-right font-bold" style={{ color: "#1E8A5F" }}>
            {formatCurrency(derived.profit)}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-line">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-sm font-semibold text-slate">
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "#3D2645" }}
        >
          {pending ? "Saving…" : "Save Job"}
        </button>
      </div>
    </div>
  );
}
