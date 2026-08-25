"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Props for the DatePicker component.
 */
export interface DatePickerProps {
  /** ISO date string (yyyy-mm-dd format) representing the selected date, or null if no date selected */
  value: string | null;
  /** Callback fired when user selects or clears a date */
  onChange: (value: string | null) => void;
  /** Placeholder text shown when no date is selected */
  placeholder?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** If true, disables all interactions */
  disabled?: boolean;
}

/**
 * Custom DatePicker component with visual calendar interface.
 * 
 * A replacement for native HTML `<input type="date">` that provides:
 * - **Visual calendar grid** - Interactive 6-week calendar display
 * - **Month/year navigation** - Previous/next buttons to browse months
 * - **Today highlighting** - Current date marked with gold ring
 * - **Selected date highlighting** - Chosen date shown in plum background
 * - **Clear functionality** - X button to remove selected date
 * - **Touch-friendly** - Large tap targets for mobile devices
 * - **Full accessibility** - ARIA compliant with dialog role and labels
 * - **WiseStyle branding** - Styled with plum/gold color palette
 * - **Browser-consistent** - Same appearance across all browsers
 * 
 * The component uses ISO 8601 date format (yyyy-mm-dd) for the value prop,
 * but displays dates in a user-friendly format (e.g., "Jan 15, 2026").
 * 
 * @example Basic usage
 * ```tsx
 * const [dueDate, setDueDate] = useState<string | null>(null);
 * 
 * <DatePicker
 *   value={dueDate}
 *   onChange={setDueDate}
 *   placeholder="Select due date..."
 * />
 * ```
 * 
 * @example With initial value
 * ```tsx
 * const [startDate, setStartDate] = useState<string | null>("2026-01-15");
 * 
 * <DatePicker
 *   value={startDate}
 *   onChange={setStartDate}
 *   placeholder="Select start date..."
 * />
 * ```
 * 
 * @example Disabled state
 * ```tsx
 * <DatePicker
 *   value={value}
 *   onChange={setValue}
 *   disabled={true}
 * />
 * ```
 * 
 * @example In a form with Field wrapper
 * ```tsx
 * <Field label="Order Date *">
 *   <DatePicker
 *     value={form.orderDate}
 *     onChange={(date) => setForm({ ...form, orderDate: date })}
 *     placeholder="When was this ordered?"
 *   />
 * </Field>
 * ```
 * 
 * @component
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Select a date…",
  className = "",
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    // Initialize viewDate to the selected date or today
    if (value) {
      const parsed = parseISODate(value);
      return parsed || new Date();
    }
    return new Date();
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const dialogId = useId();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Update viewDate when value changes externally
  useEffect(() => {
    if (value) {
      const parsed = parseISODate(value);
      if (parsed) {
        setViewDate(parsed);
      }
    }
  }, [value]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelectDate = (date: Date) => {
    onChange(toISODate(date));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  };

  // Format the display value
  const displayValue = value ? formatDisplayDate(value) : "";

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {/* Input Field with Calendar Button */}
      <div className="relative">
        <input
          id={triggerId}
          type="text"
          readOnly
          disabled={disabled}
          value={displayValue}
          placeholder={placeholder}
          onClick={handleToggle}
          className={`w-full border border-line rounded px-3 py-2 text-sm pr-20 cursor-pointer
            ${disabled ? "bg-gray-50 text-slate cursor-not-allowed" : "bg-white text-ink"}
            ${isOpen ? "border-plum ring-2 ring-plum ring-opacity-20" : ""}
            ${!displayValue && !disabled ? "text-slate" : ""}
          `}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={dialogId}
        />
        
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded hover:bg-plum hover:bg-opacity-10 text-slate hover:text-ink transition-colors"
              aria-label="Clear date"
              tabIndex={-1}
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={`p-1.5 rounded transition-colors
              ${disabled ? "text-slate cursor-not-allowed" : "text-slate hover:bg-plum hover:bg-opacity-10 hover:text-ink"}
            `}
            aria-label="Open calendar"
            tabIndex={-1}
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div
          id={dialogId}
          role="dialog"
          aria-label="Calendar"
          aria-modal="false"
          className="absolute z-50 mt-1 bg-white border border-line rounded-lg shadow-lg overflow-hidden"
          style={{ minWidth: "280px" }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-panel border-b border-line">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-plum hover:bg-opacity-10 text-slate hover:text-ink transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="text-sm font-semibold text-ink">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-plum hover:bg-opacity-10 text-slate hover:text-ink transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendar Grid */}
          <CalendarGrid
            viewDate={viewDate}
            selectedDate={value ? parseISODate(value) : null}
            onSelectDate={handleSelectDate}
          />
        </div>
      )}
    </div>
  );
}

interface CalendarGridProps {
  viewDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

function CalendarGrid({ viewDate, selectedDate, onSelectDate }: CalendarGridProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Generate calendar grid (6 weeks × 7 days = 42 cells)
  const calendarDays = generateCalendarGrid(year, month);

  return (
    <div className="p-3">
      {/* Weekday Headers */}
      <div
        role="grid"
        aria-label="Calendar grid"
        className="grid grid-cols-7 gap-1 mb-2"
      >
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            role="columnheader"
            className="text-xs font-semibold text-slate text-center py-1"
          >
            {day}
          </div>
        ))}

        {/* Date Cells */}
        {calendarDays.map((dayInfo, index) => {
          const isToday = isSameDay(dayInfo.date, today);
          const isSelected = selectedDate && isSameDay(dayInfo.date, selectedDate);
          const isCurrentMonth = dayInfo.date.getMonth() === month;

          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-selected={isSelected || undefined}
              aria-label={formatAriaDate(dayInfo.date)}
              onClick={() => onSelectDate(dayInfo.date)}
              className={`
                relative text-sm py-2 rounded transition-colors
                ${isCurrentMonth ? "text-ink" : "text-gray"}
                ${isSelected ? "bg-plum text-white font-semibold hover:bg-plum-light" : ""}
                ${!isSelected && isToday ? "font-bold" : ""}
                ${!isSelected ? "hover:bg-plum hover:bg-opacity-10" : ""}
                ${isToday && !isSelected ? "ring-2 ring-gold ring-inset" : ""}
              `}
            >
              {dayInfo.day}
            </button>
          );
        })}
      </div>

      {/* Today Button */}
      <div className="pt-2 border-t border-line">
        <button
          type="button"
          onClick={() => onSelectDate(new Date())}
          className="w-full px-3 py-1.5 text-xs font-semibold rounded text-plum hover:bg-plum hover:bg-opacity-10 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
}

// ===== Helper Functions =====

interface DayInfo {
  date: Date;
  day: number;
}

/**
 * Generates a 6×7 grid of dates for the calendar.
 * Includes trailing days from previous month and leading days from next month.
 */
function generateCalendarGrid(year: number, month: number): DayInfo[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get day of week for first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();
  
  // Start from the previous month to fill the first week
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);
  
  // Generate 42 days (6 weeks × 7 days)
  const days: DayInfo[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push({
      date: new Date(currentDate),
      day: currentDate.getDate(),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

/**
 * Checks if two dates are the same day (ignoring time).
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Converts a Date to ISO date string (yyyy-mm-dd).
 */
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses an ISO date string (yyyy-mm-dd) to a Date object.
 * Returns null for invalid dates.
 */
function parseISODate(isoString: string): Date | null {
  if (!isoString) return null;
  
  // Parse yyyy-mm-dd format
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
  const day = parseInt(match[3], 10);
  
  const date = new Date(year, month, day);
  
  // Validate the date (handles invalid dates like Feb 30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  
  return date;
}

/**
 * Formats an ISO date string to a display format (e.g., "Jan 15, 2026").
 */
function formatDisplayDate(isoString: string): string {
  const date = parseISODate(isoString);
  if (!date) return "";
  
  const month = MONTHS_SHORT[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Formats a date for ARIA labels (e.g., "January 15, 2026").
 */
function formatAriaDate(date: Date): string {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

// ===== Constants =====

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
