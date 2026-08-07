"use client";

import { useState, useTransition } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { createCustomer, updateCustomer } from "@/actions/customer-actions";
import { resizeImageFile } from "@/lib/resize-image";
import type { Customer, CustomerInput } from "@/domain/entities";

function toFormState(customer: Customer | null): CustomerInput {
  if (customer) {
    return {
      name: customer.name,
      gender: customer.gender,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      email: customer.email,
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
    };
  }
  return {
    name: "",
    gender: "Female",
    phone: "",
    whatsapp: null,
    email: null,
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
  };
}

export function CustomerForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: Customer | null;
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
    <div>
      <ErrorBanner messages={errors} />
      <Field label="Preferred Style Image (optional)">
        <div className="flex items-center gap-3">
          {form.preferredStyleImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.preferredStyleImage}
              alt="Preferred style"
              className="rounded border border-line object-cover"
              style={{ width: 72, height: 72 }}
            />
          ) : (
            <div className="rounded border border-line flex items-center justify-center" style={{ width: 72, height: 72, backgroundColor: "#F7F2E8" }}>
              <ImageIcon size={22} color="#6B6470" />
            </div>
          )}
          <div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold cursor-pointer" style={{ backgroundColor: "#F7F2E8", color: "#241B2E" }}>
              <Upload size={14} />
              {imageBusy ? "Processing…" : form.preferredStyleImage ? "Replace image" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
            {form.preferredStyleImage && (
              <button type="button" onClick={() => set("preferredStyleImage", null)} className="ml-2 text-sm underline" style={{ color: "#B23A48" }}>
                Remove
              </button>
            )}
            {imageError && (
              <p className="text-xs mt-1" style={{ color: "#B23A48" }}>
                {imageError}
              </p>
            )}
          </div>
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Full Name *">
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Gender">
          <select className={inputCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option>Female</option>
            <option>Male</option>
          </select>
        </Field>
        <Field label="Phone Number *">
          <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="WhatsApp Number">
          <input className={inputCls} value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="Email Address">
          <input type="email" className={inputCls} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Occupation">
          <input className={inputCls} value={form.occupation ?? ""} onChange={(e) => set("occupation", e.target.value)} />
        </Field>
        <Field label="State">
          <input className={inputCls} value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} />
        </Field>
        <Field label="City">
          <input className={inputCls} value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
        </Field>
      </div>
      <Field label="Residential Address">
        <textarea className={inputCls} rows={2} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Preferred Style">
          <input className={inputCls} value={form.preferredStyle ?? ""} onChange={(e) => set("preferredStyle", e.target.value)} />
        </Field>
        <Field label="Preferred Fabric">
          <input className={inputCls} value={form.preferredFabric ?? ""} onChange={(e) => set("preferredFabric", e.target.value)} />
        </Field>
        <Field label="Preferred Colours">
          <input className={inputCls} value={form.preferredColours ?? ""} onChange={(e) => set("preferredColours", e.target.value)} />
        </Field>
        <Field label="Occasion">
          <input className={inputCls} value={form.occasion ?? ""} onChange={(e) => set("occasion", e.target.value)} />
        </Field>
      </div>
      <Field label="Customer Interests">
        <input
          className={inputCls}
          placeholder="e.g. weddings, corporate wear, ready-to-wear"
          value={form.interests ?? ""}
          onChange={(e) => set("interests", e.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 mb-4 text-sm text-ink">
        <input type="checkbox" checked={form.returning} onChange={(e) => set("returning", e.target.checked)} />
        Returning customer
      </label>
      <div className="flex justify-end gap-2 pt-3 border-t border-line">
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
          {pending ? "Saving…" : "Save Customer"}
        </button>
      </div>
    </div>
  );
}
