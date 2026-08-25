"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { Loader2, User, Calendar, DollarSign, Package, Scissors, FileText, UserPlus, Ruler } from "lucide-react";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { MaterialsSection } from "./MaterialsSection";
import { MeasurementsSection } from "./MeasurementsSection";
import { QuickAddCustomer } from "./QuickAddCustomer";
import { createJob, updateJob } from "@/actions/job-actions";
import { emptyMaterials, jobDerived } from "@/domain/calculations";
import { formatCurrency } from "@/domain/format";
import { STYLES, MEASUREMENT_TEMPLATES } from "@/domain/constants";
import type { Customer, Job, JobInput, MaterialsState, MaterialType, Tailor, Measurements } from "@/domain/entities";

interface JobFormProps {
  initial: Job | null;
  customers: Customer[];
  tailors: Tailor[];
  materialTypes: MaterialType[];
  onDone: () => void;
  onCancel: () => void;
  onCustomerAdded?: (customer: Customer) => void;
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
      measurements: job.measurements || {},
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
    measurements: {},
    tailorId: null,
    progress: 0,
    notes: null,
  };
}

export function JobForm({ initial, customers, tailors, materialTypes, onDone, onCancel, onCustomerAdded }: JobFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setMaterial = (key: keyof MaterialsState, patch: Partial<MaterialsState[keyof MaterialsState]>) =>
    setForm((f) => ({ ...f, materials: { ...f.materials, [key]: { ...f.materials[key], ...patch } } }));

  const setMeasurement = (field: string, value: number) =>
    setForm((f) => ({ ...f, measurements: { ...f.measurements, [field]: value } }));

  const addCustomMeasurementField = (fieldName: string) => {
    setForm((f) => ({ ...f, measurements: { ...f.measurements, [fieldName]: 0 } }));
  };

  const removeMeasurementField = (fieldName: string) => {
    setForm((f) => {
      const newMeasurements = { ...f.measurements };
      delete newMeasurements[fieldName];
      return { ...f, measurements: newMeasurements };
    });
  };

  // Get measurement fields for current style
  const measurementFields = useMemo(() => {
    const styleKey = form.style === "Others" && form.styleOther ? form.styleOther : form.style;
    return MEASUREMENT_TEMPLATES[styleKey] || MEASUREMENT_TEMPLATES["Others"];
  }, [form.style, form.styleOther]);

  // Load customer default measurements when customer changes
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === form.customerId),
    [customers, form.customerId]
  );

  useEffect(() => {
    // Only load customer defaults if we're creating a new job (not editing)
    if (!initial && selectedCustomer?.measurements) {
      // Initialize measurements with customer defaults for the current style
      const defaults: Measurements = {};
      measurementFields.forEach((field) => {
        if (selectedCustomer.measurements && selectedCustomer.measurements[field]) {
          defaults[field] = selectedCustomer.measurements[field];
        }
      });
      setForm((f) => ({ ...f, measurements: defaults }));
    }
  }, [selectedCustomer, measurementFields, initial]);

  const derived = useMemo(() => jobDerived({ ...form, payments: initial?.payments ?? [] }), [form, initial]);

  // Transform data for Select component
  const customerOptions = useMemo(
    () => customers.map((c) => ({ value: c.id, label: `${c.name} (${c.phone})` })),
    [customers]
  );

  const tailorOptions = useMemo(
    () => [
      { value: "", label: "Unassigned" },
      ...tailors.map((t) => ({ value: t.id, label: t.name })),
    ],
    [tailors]
  );

  const styleOptions = useMemo(() => STYLES.map((s) => ({ value: s, label: s })), []);

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
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <ErrorBanner messages={errors} />
      
      {/* Customer & Style Section */}
      <div className="bg-white rounded-lg border border-line p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-plum/10 flex items-center justify-center shrink-0">
            <User size={16} className="text-plum" />
          </div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Customer & Style</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field label="Customer *">
                  <Select
                    value={form.customerId}
                    onChange={(value) => set("customerId", value)}
                    options={customerOptions}
                    placeholder="Select a customer…"
                    searchPlaceholder="Search customers by name or phone…"
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddCustomer(true)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-plum border-2 border-plum hover:bg-plum/5 transition-colors flex items-center gap-2 shrink-0"
                title="Quick add a new customer"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
            {customers.length === 0 && (
              <p className="text-xs mt-1 text-slate">No customers yet — add one using the button above.</p>
            )}
          </div>
          
          <Field label="Class of Style *">
            <Select
              value={form.style}
              onChange={(value) => set("style", value)}
              options={styleOptions}
              searchPlaceholder="Search styles…"
            />
          </Field>
          
          {form.style === "Others" && (
            <div className="sm:col-span-2">
              <Field label="Specify Style *">
                <input 
                  className={inputCls} 
                  value={form.styleOther ?? ""} 
                  onChange={(e) => set("styleOther", e.target.value)}
                  placeholder="Enter custom style name…"
                />
              </Field>
            </div>
          )}
        </div>
      </div>

      {/* Dates Section */}
      <div className="bg-white rounded-lg border border-line p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-plum/10 flex items-center justify-center shrink-0">
            <Calendar size={16} className="text-plum" />
          </div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Dates</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date Received">
            <DatePicker
              value={form.dateReceived ?? null}
              onChange={(value) => set("dateReceived", value)}
              placeholder="Select date received…"
            />
          </Field>
          
          <Field label="Start Date">
            <DatePicker
              value={form.startDate}
              onChange={(value) => set("startDate", value)}
              placeholder="Select start date…"
            />
          </Field>
          
          <Field label="Expected Completion">
            <DatePicker
              value={form.completionDate}
              onChange={(value) => set("completionDate", value)}
              placeholder="Select expected completion…"
            />
          </Field>
        </div>
      </div>

      {/* Materials Section - MOVED UP */}
      <div className="bg-white rounded-lg border border-line p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-plum/10 flex items-center justify-center shrink-0">
            <Package size={16} className="text-plum" />
          </div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Materials Needed</h3>
        </div>
        
        <MaterialsSection
          materialTypes={materialTypes}
          materials={form.materials}
          onMaterialChange={setMaterial}
        />
      </div>

      {/* Financials Section - MOVED DOWN (calculated from materials) */}
      <div className="bg-white rounded-lg border border-line p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-plum/10 flex items-center justify-center shrink-0">
            <DollarSign size={16} className="text-plum" />
          </div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Service Fee & Financial Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Contract Price (₦) *">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={inputCls}
              value={form.contractPrice || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                set("contractPrice", value ? Number(value) : 0);
              }}
              placeholder="Enter amount"
            />
          </Field>
          
          <Field label="Deposit Paid (₦)">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={inputCls}
              value={form.depositPaid || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                set("depositPaid", value ? Number(value) : 0);
              }}
              placeholder="Enter deposit amount"
            />
          </Field>
        </div>
        
        {/* Price Allocation Summary */}
        <div className="rounded-lg p-4 bg-panel border border-line/50">
          <p className="text-xs font-bold uppercase mb-3 text-slate tracking-wide">Contract Price Allocation</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate">Material Budget</span>
              <span className="font-semibold text-ink">{formatCurrency(derived.materialBudget)}</span>
            </div>
            <div className="flex items-center justify-between text-sm pb-2.5 border-b border-line">
              <span className="text-slate">Balance after Materials</span>
              <span className="font-semibold text-ink">{formatCurrency(derived.balanceAfterMaterial)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
              <span className="text-slate">Tailor Fee (25%)</span>
              <span className="text-right font-semibold text-ink">{formatCurrency(derived.tailorFee)}</span>
              <span className="text-slate">Office & Utility (40%)</span>
              <span className="text-right font-semibold text-ink">{formatCurrency(derived.officeUtility)}</span>
              <span className="text-slate">Miscellaneous (5%)</span>
              <span className="text-right font-semibold text-ink">{formatCurrency(derived.miscellaneous)}</span>
              <span className="font-bold text-plum">Profit (30%)</span>
              <span className="text-right font-bold text-green-600">{formatCurrency(derived.profit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Measurements Section */}
      <div className="bg-white rounded-lg border border-line p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-plum/10 flex items-center justify-center shrink-0">
            <Ruler size={16} className="text-plum" />
          </div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Measurements</h3>
        </div>
        
        <MeasurementsSection
          measurementFields={measurementFields}
          measurements={form.measurements || {}}
          onMeasurementChange={setMeasurement}
          onAddCustomField={addCustomMeasurementField}
          onRemoveField={removeMeasurementField}
          customerDefaults={selectedCustomer?.measurements}
          allowCustomFields={true}
        />
      </div>

      {/* Assignment Section */}
      <div className="bg-white rounded-lg border border-line p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-plum/10 flex items-center justify-center shrink-0">
            <Scissors size={16} className="text-plum" />
          </div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Assignment</h3>
        </div>
        
        <div className="space-y-4">
          <Field label="Handling Tailor">
            <Select
              value={form.tailorId ?? ""}
              onChange={(value) => set("tailorId", value || null)}
              options={tailorOptions}
              searchPlaceholder="Search tailors…"
            />
          </Field>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-lg border border-line p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-plum/10 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-plum" />
          </div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Notes & Instructions</h3>
        </div>
        
        <Field label="Special Instructions">
          <textarea 
            className={`${inputCls} resize-none`} 
            rows={3} 
            value={form.notes ?? ""} 
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Add any special notes or instructions for this job…"
          />
        </Field>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={pending}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate border-2 border-line hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-plum hover:bg-plum/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? "Saving…" : initial ? "Update Job" : "Create Job"}
        </button>
      </div>

      {/* Quick Add Customer Modal */}
      {showQuickAddCustomer && (
        <QuickAddCustomer
          onSuccess={(newCustomer) => {
            // Add customer to the list
            if (onCustomerAdded) {
              onCustomerAdded(newCustomer);
            }
            // Select the new customer
            set("customerId", newCustomer.id);
            // Close modal
            setShowQuickAddCustomer(false);
          }}
          onCancel={() => setShowQuickAddCustomer(false)}
        />
      )}
    </div>
  );
}
