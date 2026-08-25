"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { createReferrer, updateReferrer } from "@/actions/referrer-actions";
import type { Referrer } from "@/domain/entities";

interface ReferrerFormProps {
  initial: Referrer | null;
  onDone: () => void;
  onCancel: () => void;
}

export function ReferrerForm({ initial, onDone, onCancel }: ReferrerFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [bankName, setBankName] = useState(initial?.bankName ?? "");
  const [accountName, setAccountName] = useState(initial?.accountName ?? "");
  const [accountNumber, setAccountNumber] = useState(initial?.accountNumber ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const submit = () => {
    setErrors([]);
    startTransition(async () => {
      const input = {
        name,
        phone,
        email: email || null,
        address: address || null,
        bankName: bankName || null,
        accountName: accountName || null,
        accountNumber: accountNumber || null,
        notes: notes || null,
      };

      const result = initial
        ? await updateReferrer(initial.id, input)
        : await createReferrer(input);

      if (!result.success) {
        setErrors([result.error]);
        return;
      }

      router.refresh();
      onDone();
    });
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto px-1">
      <ErrorBanner messages={errors} />

      <Field label="Full Name *">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., John Doe"
        />
      </Field>

      <Field label="Phone Number *">
        <input
          className={inputCls}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g., 08012345678"
        />
      </Field>

      <Field label="Email (Optional)">
        <input
          type="email"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., john@example.com"
        />
      </Field>

      <Field label="Address (Optional)">
        <input
          className={inputCls}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., 123 Main Street, Lagos"
        />
      </Field>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Bank Details (Optional - for future commission payments)
        </h3>

        <Field label="Bank Name">
          <input
            className={inputCls}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g., First Bank"
          />
        </Field>

        <Field label="Account Name">
          <input
            className={inputCls}
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., John Doe"
          />
        </Field>

        <Field label="Account Number">
          <input
            className={inputCls}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="e.g., 1234567890"
          />
        </Field>
      </div>

      <Field label="Notes (Optional)">
        <textarea
          className={`${inputCls} resize-none`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information..."
          rows={3}
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
          {pending ? (initial ? "Updating…" : "Creating…") : initial ? "Update Referrer" : "Create Referrer"}
        </button>
      </div>
    </div>
  );
}
