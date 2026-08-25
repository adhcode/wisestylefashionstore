"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { createCustomer } from "@/actions/customer-actions";
import type { Customer, CustomerInput } from "@/domain/entities";

interface QuickAddCustomerProps {
  onSuccess: (customer: Customer) => void;
  onCancel: () => void;
}

export function QuickAddCustomer({ onSuccess, onCancel }: QuickAddCustomerProps) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Female");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Basic validation
    const errs: string[]  = [];
    if (!name.trim()) errs.push("Customer name is required");
    if (!phone.trim()) errs.push("Phone number is required");

    if (errs.length) {
      setErrors(errs);
      return;
    }

    const input: CustomerInput = {
      name: name.trim(),
      gender,
      phone: phone.trim(),
      whatsapp: phone.trim(),
      email: email.trim() || null,
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
      measurements: null,
      referrerId: null,
    };

    startTransition(async () => {
      const result = await createCustomer(input);
      if (!result.success) {
        setErrors([result.error]);
        return;
      }
      // Pass the full customer object back
      onSuccess(result.data);
    });
  };

  return (
    <Modal title="Quick Add Customer" onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <ErrorBanner messages={errors} />
        
        <p className="text-sm text-slate mb-4">
          Add a new customer quickly with just the essential details.
        </p>

        <Field label="Name *">
          <input
            type="text"
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer full name"
            autoFocus
            disabled={pending}
          />
        </Field>

        <Field label="Gender *">
          <select
            className={inputCls}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={pending}
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </Field>

        <Field label="Phone Number *">
          <input
            type="tel"
            className={inputCls}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            disabled={pending}
          />
        </Field>

        <Field label="Email (Optional)">
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            disabled={pending}
          />
        </Field>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate border-2 border-line hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-plum hover:bg-plum/90 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {pending && <Loader2 size={16} className="animate-spin" />}
            {pending ? "Adding..." : "Add Customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
