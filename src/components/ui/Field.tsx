import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-semibold mb-1 text-slate">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = "w-full border border-line rounded px-3 py-2 text-sm";
