"use client";

import { useState } from "react";
import { Ruler, Plus, X } from "lucide-react";
import type { Measurements } from "@/domain/entities";

interface MeasurementsSectionProps {
  measurementFields: string[];
  measurements: Measurements;
  onMeasurementChange: (field: string, value: number) => void;
  onAddCustomField?: (fieldName: string) => void;
  onRemoveField?: (fieldName: string) => void;
  customerDefaults?: Measurements | null;
  allowCustomFields?: boolean;
}

export function MeasurementsSection({
  measurementFields,
  measurements,
  onMeasurementChange,
  onAddCustomField,
  onRemoveField,
  customerDefaults,
  allowCustomFields = false,
}: MeasurementsSectionProps) {
  const [newFieldName, setNewFieldName] = useState("");
  const [showAddField, setShowAddField] = useState(false);

  // Combine predefined fields with any custom fields in measurements
  const allFields = Array.from(
    new Set([...measurementFields, ...Object.keys(measurements)])
  );

  const handleAddCustomField = () => {
    if (newFieldName.trim() && onAddCustomField) {
      onAddCustomField(newFieldName.trim());
      setNewFieldName("");
      setShowAddField(false);
    }
  };

  if (allFields.length === 0 && !allowCustomFields) {
    return (
      <div className="rounded-lg p-4 text-center bg-panel">
        <p className="text-sm text-slate">
          No measurements configured. Click "Add Custom" to add measurements.
        </p>
      </div>
    );
  }

  return (
    <div>
      {customerDefaults && Object.keys(customerDefaults).length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-cream border border-gold/30">
          <p className="text-xs text-slate flex items-center gap-2">
            <Ruler size={14} className="text-gold" />
            <span>Customer default measurements loaded. You can modify them for this job.</span>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {allFields.map((field) => {
          const value = measurements[field] || 0;
          const hasDefault = customerDefaults && customerDefaults[field];
          const isCustom = !measurementFields.includes(field);
          
          return (
            <div key={field} className="relative">
              <label className="block text-xs font-medium text-slate mb-1">
                {field}
                {hasDefault && (
                  <span className="ml-1 text-gold text-[10px]">(default: {customerDefaults[field]})</span>
                )}
                {isCustom && (
                  <span className="ml-1 text-plum text-[10px]">(custom)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  placeholder="0"
                  className="w-full bg-white border border-line rounded-lg px-3 py-2 pr-20 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum"
                  value={value || ""}
                  onChange={(e) => {
                    const numValue = e.target.value.replace(/[^0-9.]/g, '');
                    onMeasurementChange(field, numValue ? parseFloat(numValue) : 0);
                  }}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-xs text-slate pointer-events-none">inches</span>
                  {onRemoveField && isCustom && (
                    <button
                      type="button"
                      onClick={() => onRemoveField(field)}
                      className="p-1 rounded hover:bg-rose/10 text-rose transition-colors"
                      title="Remove this measurement"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {allowCustomFields && (
        <div>
          {showAddField ? (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate mb-1">
                  Custom Measurement Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Neck, Thigh, Ankle"
                  className="w-full bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomField();
                    } else if (e.key === "Escape") {
                      setShowAddField(false);
                      setNewFieldName("");
                    }
                  }}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-plum hover:bg-plum/90 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddField(false);
                  setNewFieldName("");
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate border border-line hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddField(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-plum border-2 border-plum/30 hover:bg-plum/5 transition-colors"
            >
              <Plus size={16} />
              Add Custom Measurement
            </button>
          )}
        </div>
      )}
    </div>
  );
}
