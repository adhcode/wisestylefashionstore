"use client";

import { useState } from "react";
import { X, Download, FileSpreadsheet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { STYLES } from "@/domain/constants";

export function ReportsModal({ onClose }: { onClose: () => void }) {
  const [style, setStyle] = useState("All");
  const [customerType, setCustomerType] = useState("All");
  const [minProfit, setMinProfit] = useState("");

  const params = new URLSearchParams();
  if (style !== "All") params.set("style", style);
  if (customerType !== "All") params.set("customerType", customerType);
  if (minProfit) params.set("minProfit", minProfit);

  return (
    <Modal title="Export Reports" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <FileSpreadsheet className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Excel Report</p>
            <p className="text-xs text-blue-700">
              Includes Summary, Jobs (with profit & delay flags), Customers, and Tailors sheets.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Filter by Style
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="All">All styles</option>
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Filter by Customer Type
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={customerType} 
              onChange={(e) => setCustomerType(e.target.value)}
            >
              <option value="All">All customers</option>
              <option value="New">New customers only</option>
              <option value="Repeat">Repeat customers only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Minimum Profit (optional)
            </label>
            <input
              type="number"
              placeholder="e.g., 10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={minProfit}
              onChange={(e) => setMinProfit(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <a
            href={`/api/reports/jobs?${params.toString()}`}
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Download Report
          </a>
        </div>
      </div>
    </Modal>
  );
}
