# DatePicker Component Documentation

## Overview

The `DatePicker` component is a custom, fully-featured date selection component designed for the WiseStyle Fashion House application. It provides a visual calendar interface that replaces native HTML date inputs with a consistent, brand-aligned experience across all browsers and devices.

## Features

### Core Functionality
- ✅ **Visual Calendar Grid** - 6 weeks × 7 days display
- ✅ **Month/Year Navigation** - Previous/next month buttons
- ✅ **Today Highlighting** - Gold border on today's date
- ✅ **Selected Date Highlighting** - Plum background on selected date
- ✅ **Clear Functionality** - X button to clear selected date
- ✅ **Today Button** - Quick selection of today's date

### User Experience
- ✅ **Click Outside to Close** - Intuitive dismiss behavior
- ✅ **Escape Key Support** - Keyboard accessibility
- ✅ **Touch-Friendly** - Optimized for mobile devices
- ✅ **Responsive Design** - Works on all screen sizes

### Technical Excellence
- ✅ **ISO Date Format** - Works with yyyy-mm-dd strings
- ✅ **Leap Year Handling** - Correctly handles February 29
- ✅ **Month Boundary Handling** - Proper date rollover
- ✅ **Timezone Independent** - Consistent local date handling
- ✅ **ARIA Compliant** - Full accessibility support

### Brand Integration
- ✅ **WiseStyle Colors** - Plum (#3D2645) and Gold (#C9973E) palette
- ✅ **Consistent Styling** - Matches existing UI components
- ✅ **Professional Appearance** - Clean, modern design

## Installation

The component is located at `src/components/ui/DatePicker.tsx` and can be imported as:

```typescript
import { DatePicker } from "@/components/ui/DatePicker";
```

## Usage

### Basic Example

```typescript
import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Field } from "@/components/ui/Field";

function MyForm() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <Field label="Select Date">
      <DatePicker
        value={date}
        onChange={setDate}
        placeholder="Choose a date…"
      />
    </Field>
  );
}
```

### Pre-populated Date

```typescript
const [date, setDate] = useState<string | null>("2026-06-15");

<DatePicker
  value={date}
  onChange={setDate}
/>
```

### Disabled State

```typescript
<DatePicker
  value={date}
  onChange={setDate}
  disabled={true}
/>
```

### Custom Placeholder

```typescript
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Pick a start date…"
/>
```

## Props Interface

```typescript
interface DatePickerProps {
  value: string | null;           // ISO date string (yyyy-mm-dd) or null
  onChange: (value: string | null) => void;  // Callback when date changes
  placeholder?: string;            // Placeholder text (default: "Select a date…")
  className?: string;              // Additional CSS classes
  disabled?: boolean;              // Disable the picker (default: false)
}
```

## Date Format

### Input/Output Format
- **ISO Date String**: `yyyy-mm-dd` (e.g., `"2026-06-15"`)
- **Null Value**: `null` (no date selected)

### Display Format
- **Input Field**: `"MMM DD, YYYY"` (e.g., `"Jun 15, 2026"`)
- **Calendar Header**: `"MMMM YYYY"` (e.g., `"June 2026"`)
- **ARIA Labels**: `"MMMM DD, YYYY"` (e.g., `"June 15, 2026"`)

## Component Behavior

### Opening the Calendar
- Click the calendar icon button
- Click the input field itself
- Calendar appears as an overlay below the input

### Selecting a Date
- Click any date in the calendar
- Click the "Today" button for quick selection
- Calendar closes automatically after selection

### Clearing a Date
- Click the X button (only visible when a date is selected)
- Sets the value to `null`

### Navigating Months
- Click the left arrow (◀) to go to previous month
- Click the right arrow (▶) to go to next month
- Navigation wraps across year boundaries

### Closing the Calendar
- Click outside the calendar
- Press the Escape key
- Select a date (auto-closes)

## Accessibility

### ARIA Attributes
- `role="dialog"` on calendar popup
- `role="grid"` on calendar grid
- `role="gridcell"` on each date cell
- `role="columnheader"` on weekday headers
- `aria-expanded` on input field
- `aria-selected` on selected date
- `aria-label` on all interactive elements

### Keyboard Support
- **Escape**: Close the calendar
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons

### Screen Reader Support
- Proper labeling of all elements
- Date announcements in full format
- Navigation button labels
- Selected state announcements

## Styling

### Brand Colors
```css
--color-plum: #3D2645      /* Selected date background, focus states */
--color-gold: #C9973E       /* Today's date border */
--color-line: #E7E1D8       /* Borders */
--color-panel: #F7F2E8      /* Header background */
--color-ink: #241B2E        /* Text */
--color-slate: #6B6470      /* Secondary text */
--color-gray: #9C9591       /* Outside month dates */
```

### Visual States
- **Today**: Gold ring border (`ring-2 ring-gold`)
- **Selected**: Plum background with white text
- **Hover**: Light plum background (10% opacity)
- **Outside Month**: Gray text
- **Disabled**: Gray background, no interaction

### Responsive Design
- Minimum calendar width: 280px
- Touch targets: Adequate size for mobile (>36px)
- Popup positioning: Below input with shadow

## Edge Cases

### Leap Years
Correctly handles February 29 in leap years:
- 2024: Leap year (29 days)
- 2026: Not a leap year (28 days)
- 2000: Leap year (divisible by 400)
- 1900: Not a leap year (divisible by 100 but not 400)

### Month Boundaries
- Properly transitions between months
- Handles year rollover (Dec → Jan)
- Shows trailing/leading days from adjacent months

### Invalid Dates
- Validates parsed dates
- Returns null for invalid input
- Handles malformed date strings gracefully

### Time Zones
- Works with local dates only
- No timezone conversion
- Consistent behavior across all timezones

## Integration Examples

### Job Form Integration

```typescript
// JobForm.tsx
const [form, setForm] = useState({
  dateReceived: new Date().toISOString().slice(0, 10),
  startDate: null,
  completionDate: null,
  actualCompletionDate: null,
});

<Field label="Date Received">
  <DatePicker
    value={form.dateReceived}
    onChange={(value) => setForm(f => ({ ...f, dateReceived: value }))}
  />
</Field>

<Field label="Start Date">
  <DatePicker
    value={form.startDate}
    onChange={(value) => setForm(f => ({ ...f, startDate: value }))}
  />
</Field>
```

### Date Range Validation

```typescript
function validateDateRange(start: string | null, end: string | null): boolean {
  if (!start || !end) return true; // Optional dates
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  return startDate <= endDate;
}

const isValid = validateDateRange(form.startDate, form.completionDate);
```

## Testing

The DatePicker component has comprehensive test coverage:

### Feature Tests (46 tests)
- Calendar grid generation
- Month/year navigation
- Date highlighting
- ISO date conversion
- Display formatting
- Clear functionality
- Brand colors
- Accessibility
- Touch-friendly
- Click outside
- Disabled state
- Today button
- Keyboard navigation
- Placeholders
- View date initialization
- Weekday headers
- Month names

### Integration Tests (30 tests)
- Job form workflows
- Date range validation
- Cross-browser handling
- Mobile touch interaction
- Keyboard accessibility
- Edge cases and error handling
- Display format consistency
- State persistence
- Today button functionality
- Month boundary cases

### Run Tests
```bash
npm test -- datepicker
```

## Performance

### Optimizations
- Calendar grid memoization (useMemo)
- Efficient date calculations
- Minimal re-renders
- No external dependencies

### Bundle Size
- Zero external dependencies
- Uses lucide-react icons (already in project)
- Minimal CSS footprint

## Browser Support

- ✅ Chrome/Edge: Latest 2 versions
- ✅ Firefox: Latest 2 versions
- ✅ Safari: Latest 2 versions
- ✅ Mobile Safari (iOS 14+)
- ✅ Mobile Chrome (Android 10+)

## Comparison to Native Date Input

### Advantages Over Native `<input type="date">`
1. **Consistent UI**: Same experience across all browsers
2. **Brand Alignment**: Matches WiseStyle aesthetic
3. **Better UX**: Visual calendar is more intuitive
4. **Accessibility**: Full ARIA support
5. **Touch-Friendly**: Optimized for mobile
6. **No Browser Quirks**: Controlled behavior

### Trade-offs
- Slightly larger bundle size
- Requires JavaScript (graceful degradation possible)
- Manual maintenance vs. browser-provided

## Future Enhancements (Not in Scope)

Potential future improvements:
- Date range picker (select start and end)
- Min/max date constraints
- Disabled dates (blacklist specific dates)
- Multiple date selection
- Week number display
- Time picker integration
- Keyboard navigation within calendar (arrow keys between dates)
- Month/year dropdown selectors
- Localization/i18n support

## Troubleshooting

### Calendar Not Opening
- Check if `disabled` prop is set
- Verify click event is not being prevented
- Check z-index conflicts with other elements

### Date Not Updating
- Ensure `onChange` callback is properly connected
- Verify parent state is updating
- Check for controlled component issues

### Styling Issues
- Verify Tailwind CSS classes are available
- Check for CSS conflicts
- Ensure color variables are defined in globals.css

### Accessibility Issues
- Test with screen reader (VoiceOver, NVDA)
- Verify ARIA attributes in DevTools
- Check keyboard navigation

## Support

For issues or questions about the DatePicker component:
1. Check this documentation
2. Review the test files for usage examples
3. Inspect the component source code
4. Consult the design document in `.kiro/specs/job-form-ux-improvements/`

## Version History

- **v1.0.0** (Current) - Initial implementation with all core features
  - Visual calendar grid
  - Month/year navigation
  - Today/selected highlighting
  - Clear functionality
  - Full accessibility
  - Comprehensive test coverage
