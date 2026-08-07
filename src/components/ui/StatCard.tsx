"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  onClick?: () => void;
}

export function StatCard({ icon: Icon, label, value, sub, accent, onClick }: StatCardProps) {
  const color = accent ?? "var(--color-gold)";
  const clickable = typeof onClick === "function";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 border border-line flex items-start justify-between"
      style={{ cursor: clickable ? "pointer" : "default" }}
    >
      <div>
        <p className="text-xs uppercase text-slate tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-1 text-ink font-serif">{value}</p>
        {sub && <p className="text-xs mt-1 text-slate">{sub}</p>}
        {clickable && <p className="text-xs mt-1 font-semibold text-plum">View details →</p>}
      </div>
      <div className="rounded-full p-2 flex items-center justify-center" style={{ backgroundColor: color + "22" }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  );
}
