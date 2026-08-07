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
    <div>
      <ErrorBanner messages={errors} />
      {initial && (
        <p className="text-xs mb-3 text-slate">
          Weekly wage payments are tracked separately — use the &ldquo;Wages&rdquo; button on this tailor&apos;s card after saving.
        </p>
      )}
      <Field label="Tailor Name *">
        <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Phone Number">
          <input className={inputCls} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Date Joined">
          <input type="date" className={inputCls} value={form.dateJoined ?? ""} onChange={(e) => set("dateJoined", e.target.value)} />
        </Field>
      </div>
      <Field label="Address">
        <input className={inputCls} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field label={`Performance Rating: ${form.rating} / 5`}>
        <input type="range" min="1" max="5" value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} className="w-full" />
      </Field>
      <Field label="Notes">
        <textarea rows={2} className={inputCls} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
      </Field>
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
          {pending ? "Saving…" : "Save Tailor"}
        </button>
      </div>
    </div>
  );
}
