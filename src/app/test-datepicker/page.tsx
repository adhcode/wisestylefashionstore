"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Field } from "@/components/ui/Field";

/**
 * Test page for the DatePicker component
 * This allows visual verification of the component in isolation
 */
export default function TestDatePickerPage() {
  const [date1, setDate1] = useState<string | null>(null);
  const [date2, setDate2] = useState<string | null>("2026-06-15");
  const [date3, setDate3] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-plum mb-2">DatePicker Component Test</h1>
        <p className="text-slate mb-8">Visual verification of the custom DatePicker component</p>

        <div className="bg-white border border-line rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-ink mb-4">Basic Usage</h2>
          
          <Field label="Empty Date Picker">
            <DatePicker
              value={date1}
              onChange={setDate1}
              placeholder="Select a date…"
            />
          </Field>

          <div className="text-sm text-slate mb-4">
            Selected value: <code className="bg-panel px-2 py-1 rounded">{date1 || "null"}</code>
          </div>

          <Field label="Pre-populated Date Picker">
            <DatePicker
              value={date2}
              onChange={setDate2}
              placeholder="Select a date…"
            />
          </Field>

          <div className="text-sm text-slate mb-4">
            Selected value: <code className="bg-panel px-2 py-1 rounded">{date2 || "null"}</code>
          </div>

          <Field label="Disabled Date Picker">
            <DatePicker
              value={date3}
              onChange={setDate3}
              placeholder="Select a date…"
              disabled={true}
            />
          </Field>

          <div className="text-sm text-slate">
            Selected value: <code className="bg-panel px-2 py-1 rounded">{date3 || "null"}</code>
          </div>
        </div>

        <div className="bg-white border border-line rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-ink mb-4">Feature Checklist</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Visual calendar grid (6 weeks × 7 days)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Month/year navigation (previous/next buttons)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Today's date highlighted with gold border</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Selected date highlighted with plum background</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Clear date button (X icon)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Click outside to close</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Escape key to close</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Touch-friendly for mobile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">ARIA attributes for accessibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">WiseStyle brand colors (plum/gold palette)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Handles leap years and month boundaries</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">✓</span>
              <span className="text-ink">Today button for quick selection</span>
            </li>
          </ul>
        </div>

        <div className="bg-panel border border-line rounded-lg p-6">
          <h2 className="text-xl font-semibold text-ink mb-4">Test Instructions</h2>
          <ol className="space-y-2 text-sm text-slate list-decimal list-inside">
            <li>Click the calendar icon to open the date picker</li>
            <li>Navigate between months using the arrow buttons</li>
            <li>Click on a date to select it</li>
            <li>Verify today's date has a gold border</li>
            <li>Verify the selected date has a plum background</li>
            <li>Click the X button to clear the selected date</li>
            <li>Click outside the calendar to close it</li>
            <li>Press Escape to close the calendar</li>
            <li>Try on mobile/touch device to verify touch-friendliness</li>
            <li>Test with screen reader to verify accessibility</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
