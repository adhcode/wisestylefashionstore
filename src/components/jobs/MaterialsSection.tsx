"use client";

import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/domain/format";
import { getMaterialLabel, isMaterialDeleted } from "@/domain/material-helpers";
import type { MaterialType, MaterialsState, MaterialEntry } from "@/domain/entities";

interface MaterialsSectionProps {
  materialTypes: MaterialType[];
  materials: MaterialsState;
  onMaterialChange: (key: string, patch: Partial<MaterialEntry>) => void;
}

export function MaterialsSection({
  materialTypes,
  materials,
  onMaterialChange,
}: MaterialsSectionProps) {
  // Calculate total
  const total = Object.entries(materials).reduce((sum, [key, entry]) => {
    if (entry.included) {
      return sum + entry.qty * entry.cost;
    }
    return sum;
  }, 0);

  // Get all material keys (active and deleted)
  const allMaterialKeys = [
    ...materialTypes.map((mt) => mt.key),
    ...Object.keys(materials).filter((key) => 
      materials[key]?.included && !materialTypes.some(mt => mt.key === key)
    ),
  ];

  if (materialTypes.length === 0 && allMaterialKeys.length === 0) {
    return (
      <div className="rounded-lg p-4 text-center bg-panel">
        <p className="text-sm text-slate">
          No materials configured. Contact administrator.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {allMaterialKeys.map((key) => {
          const mt = materialTypes.find((m) => m.key === key);
          const m = materials[key] || { included: false, qty: 1, cost: 0 };
          const subtotal = m.included ? m.qty * m.cost : 0;
          const isDeleted = !mt;
          const label = getMaterialLabel(materialTypes, key);
          const unit = mt?.unit || "units";
          const maxQuantity = mt?.maxQuantity || 50;

          // Generate quantity options
          const quantityOptions = useMemo(() => 
            Array.from({ length: maxQuantity }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1} ${unit}`,
            })),
            [maxQuantity, unit]
          );

          return (
            <div
              key={key}
              className={`rounded-lg border transition-all ${
                isDeleted
                  ? "bg-gray-50 border-gray-300"
                  : m.included
                  ? "bg-plum/5 border-plum/30 shadow-sm"
                  : "bg-white border-line hover:border-plum/30"
              }`}
            >
              <div className="p-4">
                {/* Header with checkbox and label */}
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={m.included}
                    onChange={(e) =>
                      onMaterialChange(key, { included: e.target.checked })
                    }
                    disabled={isDeleted}
                    className="mt-1 w-4 h-4 rounded border-line text-plum focus:ring-plum focus:ring-offset-0 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isDeleted ? "italic text-gray-600" : "text-ink"
                        }`}
                      >
                        {label}
                      </span>
                      {isDeleted && (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-slate bg-gray-200 px-2 py-0.5 rounded-full"
                          title="This material type has been removed from the system. Values are read-only."
                        >
                          <AlertCircle size={12} />
                          Deleted
                        </span>
                      )}
                    </div>
                    {m.included && (
                      <div className="text-xs text-slate mt-0.5">
                        Subtotal: <span className="font-semibold text-plum">{formatCurrency(subtotal)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity and Cost inputs */}
                {m.included && (
                  <div className="grid grid-cols-2 gap-3 ml-7">
                    <div>
                      <label className="block text-xs font-medium text-slate mb-1">Quantity</label>
                      <Select
                        value={String(m.qty)}
                        onChange={(value) => onMaterialChange(key, { qty: Number(value) })}
                        options={quantityOptions}
                        disabled={isDeleted}
                        searchPlaceholder="Search quantity…"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate mb-1">Unit Cost (₦)</label>
                      <input
                        disabled={isDeleted}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter cost"
                        className="w-full bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum"
                        value={m.cost || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          onMaterialChange(key, { cost: value ? Number(value) : 0 });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between items-center px-4 py-3 rounded-lg border-2 border-gold bg-gradient-to-r from-gold/5 to-gold/10">
        <span className="text-sm font-bold text-ink">Total Material Budget</span>
        <span className="text-xl font-bold text-gold">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
