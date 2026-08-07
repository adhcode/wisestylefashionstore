"use client";

import { useState } from "react";
import { AlertTriangle, Download, FileSpreadsheet } from "lucide-react";
import { OverdueJobsModal } from "./OverdueJobsModal";
import { inputCls } from "@/components/ui/Field";
import { STYLES } from "@/domain/constants";

export function DocumentsPanel() {
  const [showOverdue, setShowOverdue] = useState(false);
  const [style, setStyle] = useState("All");
  const [customerType, setCustomerType] = useState("All");
  const [minProfit, setMinProfit] = useState("");

  const params = new URLSearchParams();
  if (style !== "All") params.set("style", style);
  if (customerType !== "All") params.set("customerType", customerType);
  if (minProfit) params.set("minProfit", minProfit);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-ink font-serif">Documents &amp; Reports</h2>
        <button
          onClick={() => setShowOverdue(true)}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold"
          style={{ backgroundColor: "#FBEAEA", color: "#B23A48" }}
        >
          <AlertTriangle size={15} /> View Overdue Jobs
        </button>
      </div>
      <div className="bg-white rounded-lg border border-line p-4" style={{ maxWidth: 420 }}>
        <p className="font-semibold mb-2 flex items-center gap-2 text-ink">
          <FileSpreadsheet size={16} color="#C9973E" /> Excel Report
        </p>
        <div className="space-y-2">
          <select className={inputCls} value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="All">All styles</option>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className={inputCls} value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
            <option value="All">All customers</option>
            <option value="New">New customers only</option>
            <option value="Repeat">Repeat customers only</option>
          </select>
          <input
            type="number"
            placeholder="Minimum profit ₦ (optional)"
            className={inputCls}
            value={minProfit}
            onChange={(e) => setMinProfit(e.target.value)}
          />
        </div>
        <a
          href={`/api/reports/jobs?${params.toString()}`}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
          style={{ backgroundColor: "#3D2645" }}
        >
          <Download size={15} /> Download Excel Report
        </a>
        <p className="text-xs mt-2 text-slate">Includes Summary, Jobs (with profit &amp; delay flags), Customers, and Tailors sheets.</p>
      </div>

      {showOverdue && <OverdueJobsModal onClose={() => setShowOverdue(false)} />}
    </div>
  );
}
