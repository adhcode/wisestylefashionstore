"use client";

import { useState } from "react";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";

/**
 * Test page for the custom Select component
 * Navigate to /test-select to see the component in action
 */
export default function TestSelectPage() {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Sample customer data (simulating 100+ customers)
  const customerOptions: SelectOption[] = Array.from({ length: 120 }, (_, i) => ({
    value: `customer-${i + 1}`,
    label: `Customer ${i + 1} (${String(i + 1).padStart(4, '0')})`,
  }));

  const styleOptions: SelectOption[] = [
    { value: "agbada", label: "Agbada" },
    { value: "ankara", label: "Ankara" },
    { value: "aso-oke", label: "Aso-Oke" },
    { value: "buba", label: "Buba" },
    { value: "caftan", label: "Caftan" },
    { value: "dashiki", label: "Dashiki" },
    { value: "senator", label: "Senator" },
    { value: "wrapper", label: "Wrapper" },
    { value: "others", label: "Others" },
  ];

  const sizeOptions: SelectOption[] = [
    { value: "xs", label: "Extra Small (XS)" },
    { value: "s", label: "Small (S)" },
    { value: "m", label: "Medium (M)" },
    { value: "l", label: "Large (L)" },
    { value: "xl", label: "Extra Large (XL)" },
    { value: "xxl", label: "2XL" },
    { value: "xxxl", label: "3XL" },
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#FAF7F1" }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#3D2645" }}>
            Custom Select Component Test
          </h1>
          <p className="text-slate">
            Test the searchable dropdown with keyboard navigation and various option list sizes.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-line">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#3D2645" }}>
            Select Components
          </h2>

          <div className="space-y-4">
            {/* Large Option List (120 items) */}
            <Field label="Customer (120 options - test search functionality)">
              <Select
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                options={customerOptions}
                placeholder="Select a customer…"
                searchPlaceholder="Search customers…"
              />
            </Field>

            {/* Medium Option List */}
            <Field label="Style (9 options)">
              <Select
                value={selectedStyle}
                onChange={setSelectedStyle}
                options={styleOptions}
                placeholder="Select a style…"
                searchPlaceholder="Search styles…"
              />
            </Field>

            {/* Small Option List */}
            <Field label="Size (7 options)">
              <Select
                value={selectedSize}
                onChange={setSelectedSize}
                options={sizeOptions}
                placeholder="Select a size…"
              />
            </Field>

            {/* Disabled State */}
            <Field label="Disabled Select">
              <Select
                value=""
                onChange={() => {}}
                options={styleOptions}
                placeholder="This select is disabled"
                disabled={true}
              />
            </Field>

            {/* Empty Options */}
            <Field label="Empty Options List">
              <Select
                value=""
                onChange={() => {}}
                options={[]}
                placeholder="No options available"
              />
            </Field>
          </div>

          {/* Selected Values Display */}
          <div className="mt-6 pt-6 border-t border-line">
            <h3 className="text-sm font-semibold mb-2 text-slate uppercase tracking-wide">
              Selected Values
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Customer:</strong>{" "}
                <span className="text-slate">
                  {selectedCustomer || "(none)"}
                </span>
              </div>
              <div>
                <strong>Style:</strong>{" "}
                <span className="text-slate">
                  {selectedStyle || "(none)"}
                </span>
              </div>
              <div>
                <strong>Size:</strong>{" "}
                <span className="text-slate">
                  {selectedSize || "(none)"}
                </span>
              </div>
            </div>
          </div>

          {/* Testing Instructions */}
          <div className="mt-6 pt-6 border-t border-line bg-panel rounded p-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "#3D2645" }}>
              Testing Checklist
            </h3>
            <ul className="text-sm space-y-1 text-slate">
              <li>✓ Click to open dropdown</li>
              <li>✓ Search with real-time filtering</li>
              <li>✓ Keyboard navigation (↑ ↓ Enter Escape)</li>
              <li>✓ Click outside to close</li>
              <li>✓ Selected option highlighted in gold</li>
              <li>✓ Hover effect on options (light plum)</li>
              <li>✓ "No results" state when search yields nothing</li>
              <li>✓ Disabled state</li>
              <li>✓ Empty options state</li>
              <li>✓ Works with various list sizes (7, 9, 120 items)</li>
              <li>✓ ARIA attributes for accessibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
