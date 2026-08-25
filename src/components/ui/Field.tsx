import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium mb-2 text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = "w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors";
