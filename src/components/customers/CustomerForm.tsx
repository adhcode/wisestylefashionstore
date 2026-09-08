"use client";

import { useState, useTransition } from "react";
import { Upload, Image as ImageIcon, Ruler } from "lucide-react";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { MeasurementsSection } from "@/components/jobs/MeasurementsSection";
import { createCustomer, updateCustomer } from "@/actions/customer-actions";
import { resizeImageFile } from "@/lib/resize-image";
import type { Customer, CustomerInput, Measurements, Referrer } from "@/domain/entities";

function toFormState(customer: Customer | null): CustomerInput {
  if (customer) {
    return {
      name: customer.name,
      gender: customer.gender,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      email: customer.email,
      birthdate: customer.birthdate,
      address: customer.address,
      state: customer.state,
      city: customer.city,
      occupation: customer.occupation,
      preferredStyle: customer.preferredStyle,
      preferredFabric: customer.preferredFabric,
      preferredColours: customer.preferredColours,
      occasion: customer.occasion,
      interests: customer.interests,
      returning: customer.returning,
      preferredStyleImage: customer.preferredStyleImage,
      measurements: customer.measurements || {},
      referrerId: customer.referrerId,
    };
  }
  return {
    name: "",
    gender: "Female",
    phone: "",
    whatsapp: null,
    email: null,
    birthdate: null,
    address: null,
    state: null,
    city: null,
    occupation: null,
    preferredStyle: null,
    preferredFabric: null,
    preferredColours: null,
    occasion: null,
    interests: null,
    returning: false,
    preferredStyleImage: null,
    measurements: {},
    referrerId: null,
  };
}

export function CustomerForm({
  initial,
  referrers,
  onDone,
  onCancel,
}: {
  initial: Customer | null;
  referrers: Referrer[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CustomerInput>(() => toFormState(initial));
  const [errors, setErrors] = useState<string[]>([]);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setMeasurement = (field: string, value: number) =>
    setForm((f) => ({ ...f, measurements: { ...((f.measurements as Measurements) || {}), [field]: value } }));

  const addCustomMeasurementField = (fieldName: string) => {
    setForm((f) => ({ ...f, measurements: { ...((f.measurements as Measurements) || {}), [fieldName]: 0 } }));
  };

  const removeMeasurementField = (fieldName: string) => {
    setForm((f) => {
      const newMeasurements = { ...((f.measurements as Measurements) || {}) };
      delete newMeasurements[fieldName];
      return { ...f, measurements: newMeasurements };
    });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      return;
    }
    setImageBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      set("preferredStyleImage", dataUrl);
      setImageError("");
    } catch {
      setImageError("Could not process that image. Try another file.");
    } finally {
      setImageBusy(false);
    }
  };

  const submit = () => {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Full name is required.");
    if (!form.phone.trim()) errs.push("Phone number is required.");
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    startTransition(async () => {
      const result = initial ? await updateCustomer(initial.id, form) : await createCustomer(form);
      if (!result.success) {
        setErrors([result.error]);
        return;
      }
      onDone();
    });
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <ErrorBanner messages={errors} />
      
      {/* Style Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">Preferred Style Image (optional)</label>
        <div className="flex items-center gap-4">
          {form.preferredStyleImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.preferredStyleImage}
              alt="Preferred style"
              className="rounded-lg border-2 border-gray-200 object-cover shadow-sm"
              style={{ width: 80, height: 80 }}
            />
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50" style={{ width: 80, height: 80 }}>
              <ImageIcon size={24} className="text-gray-400" />
            </div>
          )}
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm">
              <Upload size={16} />
              {imageBusy ? "Processing…" : form.preferredStyleImage ? "Replace Image" : "Upload Image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={imageBusy} />
            </label>
            {form.preferredStyleImage && (
              <button 
                type="button" 
                onClick={() => set("preferredStyleImage", null)} 
                className="ml-3 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Remove
              </button>
            )}
            {imageError && (
              <p className="text-xs mt-2 text-red-600">
                {imageError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Full Name *">
          <input 
            className={inputCls} 
            value={form.name} 
            onChange={(e) => set("name", e.target.value)}
            placeholder="Enter full name"
          />
        </Field>
        <Field label="Gender">
          <select className={inputCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option>Female</option>
            <option>Male</option>
          </select>
        </Field>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Phone Number *">
          <input 
            className={inputCls} 
            value={form.phone} 
            onChange={(e) => set("phone", e.target.value)}
            placeholder="e.g., 08012345678"
          />
        </Field>
        <Field label="WhatsApp Number">
          <input 
            className={inputCls} 
            value={form.whatsapp ?? ""} 
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="e.g., 08012345678"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Email Address">
          <input 
            type="email" 
            className={inputCls} 
            value={form.email ?? ""} 
            onChange={(e) => set("email", e.target.value)}
            placeholder="e.g., customer@example.com"
          />
        </Field>
        <Field label="Date of Birth">
          <input 
            type="date"
            className={inputCls} 
            value={form.birthdate ?? ""} 
            onChange={(e) => set("birthdate", e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">We'll send a birthday greeting</p>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Occupation">
          <input 
            className={inputCls} 
            value={form.occupation ?? ""} 
            onChange={(e) => set("occupation", e.target.value)}
            placeholder="e.g., Business Owner"
          />
        </Field>
        <Field label="Referrer (Optional)">
          <select
            className={inputCls}
            value={form.referrerId ?? ""}
            onChange={(e) => set("referrerId", e.target.value || null)}
          >
            <option value="">None</option>
            {referrers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.phone})
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="State">
          <input 
            className={inputCls} 
            value={form.state ?? ""} 
            onChange={(e) => set("state", e.target.value)}
            placeholder="e.g., Lagos"
          />
        </Field>
        <Field label="City">
          <input 
            className={inputCls} 
            value={form.city ?? ""} 
            onChange={(e) => set("city", e.target.value)}
            placeholder="e.g., Ikeja"
          />
        </Field>
      </div>

      <Field label="Residential Address">
        <textarea 
          className={`${inputCls} resize-none`} 
          rows={2} 
          value={form.address ?? ""} 
          onChange={(e) => set("address", e.target.value)}
          placeholder="Enter full address"
        />
      </Field>

      {/* Referral */}
      <Field label="Referred By (Optional)">
        <select 
          className={inputCls} 
          value={form.referrerId ?? ""} 
          onChange={(e) => set("referrerId", e.target.value || null)}
        >
          <option value="">No referrer</option>
          {referrers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.referrerNumber})
            </option>
          ))}
        </select>
      </Field>

      {/* Preferences */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Style Preferences</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Preferred Style">
            <input 
              className={inputCls} 
              value={form.preferredStyle ?? ""} 
              onChange={(e) => set("preferredStyle", e.target.value)}
              placeholder="e.g., Kaftan, Agbada"
            />
          </Field>
          <Field label="Preferred Fabric">
            <input 
              className={inputCls} 
              value={form.preferredFabric ?? ""} 
              onChange={(e) => set("preferredFabric", e.target.value)}
              placeholder="e.g., Lace, Senator"
            />
          </Field>
          <Field label="Preferred Colours">
            <input 
              className={inputCls} 
              value={form.preferredColours ?? ""} 
              onChange={(e) => set("preferredColours", e.target.value)}
              placeholder="e.g., Blue, Gold"
            />
          </Field>
          <Field label="Occasion">
            <input 
              className={inputCls} 
              value={form.occasion ?? ""} 
              onChange={(e) => set("occasion", e.target.value)}
              placeholder="e.g., Wedding, Corporate"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Customer Interests">
            <input
              className={inputCls}
              placeholder="e.g., weddings, corporate wear, ready-to-wear"
              value={form.interests ?? ""}
              onChange={(e) => set("interests", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Measurements Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Ruler size={16} className="text-purple-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">Default Measurements</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          These measurements will be used as defaults when creating jobs for this customer.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <MeasurementsSection
            measurementFields={[]}
            measurements={(form.measurements as Measurements) || {}}
            onMeasurementChange={setMeasurement}
            onAddCustomField={addCustomMeasurementField}
            onRemoveField={removeMeasurementField}
            allowCustomFields={true}
          />
        </div>
      </div>

      {/* Customer Status */}
      <div className="mb-6">
        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
          <input 
            type="checkbox" 
            checked={form.returning} 
            onChange={(e) => set("returning", e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-900">Mark as Returning Customer</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={pending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-60 shadow-sm"
        >
          {pending ? "Saving…" : initial ? "Update Customer" : "Save Customer"}
        </button>
      </div>
    </div>
  );
}
