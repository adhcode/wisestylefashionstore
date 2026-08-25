"use client";

import { useState, useTransition } from "react";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { createTailor, updateTailor } from "@/actions/tailor-actions";
import type { Tailor, TailorInput } from "@/domain/entities";

function toFormState(tailor: Tailor | null): TailorInput {
  if (tailor) {
    return {
      name: tailor.name,
      phone: tailor.phone,
      address: tailor.address,
      dateJoined: tailor.dateJoined,
      rating: tailor.rating,
      notes: tailor.notes,
    };
  }
  return {
    name: "",
    phone: null,
    address: null,
    dateJoined: new Date().toISOString().slice(0, 10),
    rating: 5,
    notes: null,
  };
}

export function TailorForm({ initial, onDone, onCancel }: { initial: Tailor | null; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<TailorInput>(() => toFormState(initial));
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof TailorInput>(key: K, value: TailorInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) {
      setErrors(["Tailor name is required."]);
      return;
    }
    setErrors([]);
    startTransition(async () => {
      const result = initial ? await updateTailor(initial.id, form) : await createTailor(form);
      if (!result.success) {
        setErrors([result.error]);
        return;
      }
      onDone();
    });
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto px-1">
      <ErrorBanner messages={errors} />
      
      {initial && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Weekly wage payments are tracked separately — use the "Wages" button on this tailor's card after saving.
          </p>
        </div>
      )}
      
      <Field label="Tailor Name *">
        <input 
          className={inputCls} 
          value={form.name} 
          onChange={(e) => set("name", e.target.value)}
          placeholder="Enter tailor's full name"
        />
      </Field>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Phone Number">
          <input 
            className={inputCls} 
            value={form.phone ?? ""} 
            onChange={(e) => set("phone", e.target.value)}
            placeholder="e.g., 08012345678"
          />
        </Field>
        <Field label="Date Joined">
          <input 
            type="date" 
            className={inputCls} 
            value={form.dateJoined ?? ""} 
            onChange={(e) => set("dateJoined", e.target.value)} 
          />
        </Field>
      </div>
      
      <Field label="Address">
        <input 
          className={inputCls} 
          value={form.address ?? ""} 
          onChange={(e) => set("address", e.target.value)}
          placeholder="Enter residential address"
        />
      </Field>
      
      <Field label="Notes">
        <textarea 
          rows={3} 
          className={`${inputCls} resize-none`} 
          value={form.notes ?? ""} 
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Add any additional notes about this tailor..."
        />
      </Field>
      
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
          {pending ? "Saving…" : initial ? "Update Tailor" : "Save Tailor"}
        </button>
      </div>
    </div>
  );
}
