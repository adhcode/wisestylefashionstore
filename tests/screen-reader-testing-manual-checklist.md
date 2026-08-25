# Task 7.3: Screen Reader Testing Checklist

This checklist covers manual testing with screen readers to ensure the custom Select and DatePicker components are fully accessible to users with visual impairments.

## Testing Tools

- **VoiceOver (macOS/iOS)**: Built-in screen reader for Apple devices
- **NVDA (Windows)**: Free screen reader for Windows (https://www.nvaccess.org/)
- **JAWS (Windows)**: Commercial screen reader (alternative to NVDA)
- **TalkBack (Android)**: Built-in screen reader for Android devices

## Getting Started

### Activating Screen Readers

- **VoiceOver (Mac)**: Cmd + F5 or System Preferences > Accessibility > VoiceOver
- **VoiceOver (iOS)**: Settings > Accessibility > VoiceOver
- **NVDA (Windows)**: Ctrl + Alt + N (after installation)
- **TalkBack (Android)**: Settings > Accessibility > TalkBack

### Basic Navigation Commands

- **VoiceOver**: 
  - Navigate: VO + Arrow keys (VO = Control + Option)
  - Activate: VO + Space
  - Read all: VO + A

- **NVDA**:
  - Navigate: Arrow keys or Tab
  - Activate: Enter or Space
  - Read all: NVDA + Down Arrow

---

## Select Component - Screen Reader Testing

### Component Discovery

- [ ] **Trigger Button Announced Correctly**
  - Navigate to the Select trigger button
  - **Expected Announcement**: "Select a customer, button, collapsed" or "John Doe (08012345678), button, collapsed"
  - **Check**: Role is announced as "combobox" or "button"
  - **Check**: Current value is announced (or placeholder if empty)
  - **Check**: State is announced (collapsed/expanded)

- [ ] **Trigger Button Purpose is Clear**
  - **Check**: Label/purpose is understandable ("Customer", "Tailor", "Style")
  - **Check**: User can understand what selecting will do

### Opening the Dropdown

- [ ] **Open Dropdown with Keyboard**
  - With focus on trigger, press Enter or Space
  - **Expected**: Dropdown opens
  - **Expected Announcement**: "Expanded" or "menu opened" or focus moves to search input

- [ ] **Focus Moves to Search Input**
  - When dropdown opens, focus should move to search input
  - **Expected Announcement**: "Search customers by name or phone, search box" or similar
  - **Check**: User knows they can type to search

### Search Functionality

- [ ] **Search Input Announced**
  - Navigate to search input (should be auto-focused)
  - **Expected Announcement**: "Search [placeholder text], search box" or "edit text"
  - **Check**: Placeholder text is announced
  - **Check**: Role is announced as "searchbox" or "edit text"

- [ ] **Typing Feedback**
  - Type a search query
  - **Expected**: Characters are echoed as you type (screen reader default behavior)
  - **Expected**: No additional distracting announcements

- [ ] **Filtered Results Count** (if implemented)
  - After typing, check if results count is announced
  - **Nice to have**: "5 results found" announcement
  - **Check**: User can understand how many options match their search

### Navigating Options

- [ ] **Options List Announced**
  - Navigate from search input to options list (usually Tab or Arrow Down)
  - **Expected Announcement**: "List box with [N] items" or "menu"
  - **Check**: Number of options is announced

- [ ] **Individual Options Announced**
  - Navigate through options with Arrow keys
  - **Expected Announcement**: "John Doe (08012345678), option 1 of 5" or similar
  - **Check**: Option text is announced
  - **Check**: Position in list is announced ("1 of 5", "2 of 5", etc.)

- [ ] **Selected Option State**
  - Navigate to the currently selected option
  - **Expected Announcement**: "John Doe (08012345678), selected" or "option, selected"
  - **Check**: Selection state is announced

- [ ] **Highlighted vs Selected**
  - **Check**: Screen reader distinguishes between:
    - Currently highlighted option (keyboard focus)
    - Currently selected option (the value)

### Empty States

- [ ] **No Results Message**
  - Search for something that doesn't exist
  - Navigate to the results area
  - **Expected Announcement**: "No results for 'xyz'" or "0 items"
  - **Check**: Empty state message is accessible

- [ ] **Empty Options List**
  - Test Select with no options (e.g., no customers yet)
  - **Expected Announcement**: "No options available" or "0 items"
  - **Check**: User understands the list is empty

### Selecting an Option

- [ ] **Select with Keyboard**
  - Highlight an option and press Enter
  - **Expected**: Option is selected
  - **Expected**: Dropdown closes
  - **Expected Announcement**: Focus returns to trigger button, new value is announced

- [ ] **Confirm Selection**
  - After selecting, navigate back to trigger button
  - **Expected Announcement**: "Jane Smith (08087654321), button, collapsed"
  - **Check**: New selected value is announced

### Closing the Dropdown

- [ ] **Close with Escape**
  - With dropdown open, press Escape
  - **Expected**: Dropdown closes
  - **Expected**: Focus returns to trigger button
  - **Expected Announcement**: Trigger button is announced with "collapsed" state

- [ ] **Close by Clicking Outside** (Mouse + Screen Reader)
  - With dropdown open, click outside
  - **Expected**: Dropdown closes
  - **Expected**: Focus returns to trigger button or remains where clicked

### ARIA Attributes Verification

- [ ] **aria-expanded**
  - **Check**: Trigger button has `aria-expanded="false"` when closed
  - **Check**: Trigger button has `aria-expanded="true"` when open

- [ ] **aria-haspopup**
  - **Check**: Trigger button has `aria-haspopup="listbox"` or similar

- [ ] **aria-controls**
  - **Check**: Trigger button references the dropdown ID with `aria-controls`

- [ ] **aria-activedescendant** (if used)
  - **Check**: Trigger or listbox has `aria-activedescendant` pointing to highlighted option

- [ ] **aria-selected**
  - **Check**: Selected option has `aria-selected="true"`

- [ ] **role="combobox"**
  - **Check**: Trigger has `role="combobox"`

- [ ] **role="listbox"**
  - **Check**: Options container has `role="listbox"`

- [ ] **role="option"**
  - **Check**: Each option has `role="option"`

- [ ] **role="searchbox"**
  - **Check**: Search input has `role="searchbox"`

### Disabled State

- [ ] **Disabled Select Announced**
  - Navigate to a disabled Select component (if implemented in tests)
  - **Expected Announcement**: "Customer, button, disabled" or "unavailable"
  - **Check**: Disabled state is clearly announced
  - **Check**: User cannot activate it

---

## DatePicker Component - Screen Reader Testing

### Component Discovery

- [ ] **Input Field Announced Correctly**
  - Navigate to the DatePicker input field
  - **Expected Announcement**: "Date Received, edit text, Jan 15, 2026" or "Date Received, edit text, Select a date"
  - **Check**: Label is announced
  - **Check**: Current value or placeholder is announced
  - **Check**: Role is announced

- [ ] **Calendar Button Announced**
  - Navigate to the calendar icon button (usually next button after input)
  - **Expected Announcement**: "Open calendar, button" or "Choose date, button"
  - **Check**: Button purpose is clear
  - **Check**: User knows it will open a calendar

- [ ] **Clear Button Announced** (if date is selected)
  - Navigate to the clear (X) button
  - **Expected Announcement**: "Clear date, button"
  - **Check**: Purpose is clear

### Opening the Calendar

- [ ] **Open Calendar with Keyboard**
  - Focus on input or calendar button, press Enter or Space
  - **Expected**: Calendar popup opens
  - **Expected Announcement**: "Calendar, dialog" or "Choose date"

- [ ] **Calendar Structure Announced**
  - When calendar opens, check initial announcement
  - **Expected**: Month and year are announced ("June 2026")
  - **Expected**: User understands they're in a calendar

### Calendar Navigation

- [ ] **Previous Month Button**
  - Navigate to the previous month button
  - **Expected Announcement**: "Previous month, button"
  - **Check**: Purpose is clear

- [ ] **Next Month Button**
  - Navigate to the next month button
  - **Expected Announcement**: "Next month, button"
  - **Check**: Purpose is clear

- [ ] **Month/Year Header**
  - Navigate to the month/year display
  - **Expected Announcement**: "June 2026" or "June 2026, heading"
  - **Check**: Current month and year are announced

### Date Grid Navigation

- [ ] **Weekday Headers**
  - Navigate to the weekday row
  - **Expected Announcement**: "Sun", "Mon", "Tue", etc. with "column header" or similar
  - **Check**: Weekday headers are properly announced

- [ ] **Date Cells Announced**
  - Navigate through date cells with Arrow keys
  - **Expected Announcement**: "June 15, 2026, button" or "15, gridcell, June 2026"
  - **Check**: Full date is announced (month, day, year)
  - **Check**: Role is announced (button or gridcell)

- [ ] **Today's Date Highlighted**
  - Navigate to today's date
  - **Expected Announcement**: "Today, June 15, 2026" or "June 15, 2026, selected"
  - **Check**: Today is distinguished from other dates

- [ ] **Selected Date Highlighted**
  - Navigate to the currently selected date
  - **Expected Announcement**: "June 15, 2026, selected" or similar
  - **Check**: Selection state is announced

- [ ] **Dates Outside Current Month**
  - Navigate to dates from previous/next month
  - **Expected Announcement**: "May 31, 2026" (clearly different month)
  - **Check**: User can distinguish current month from other months

### Grid Navigation Patterns

- [ ] **Arrow Key Navigation**
  - Test all 4 arrow keys in the date grid
  - **Up**: Moves up one week (same day, previous week)
  - **Down**: Moves down one week (same day, next week)
  - **Left**: Moves to previous day
  - **Right**: Moves to next day
  - **Check**: All arrow keys work logically

- [ ] **Home/End Keys** (if implemented)
  - **Home**: Jumps to first day of week
  - **End**: Jumps to last day of week
  - **Check**: Navigation is logical

### Today Button

- [ ] **Today Button Announced**
  - Navigate to the "Today" button at bottom of calendar
  - **Expected Announcement**: "Today, button"
  - **Check**: Purpose is clear
  - **Check**: User knows it will select today's date

- [ ] **Today Button Action**
  - Activate Today button
  - **Expected**: Today's date is selected
  - **Expected**: Calendar closes
  - **Expected**: Focus returns to input
  - **Expected Announcement**: Input field with today's date

### Selecting a Date

- [ ] **Select Date with Keyboard**
  - Navigate to a date cell and press Enter or Space
  - **Expected**: Date is selected
  - **Expected**: Calendar closes
  - **Expected**: Focus returns to input field
  - **Expected Announcement**: Input field with selected date

- [ ] **Confirm Selection**
  - After selecting, check input field value
  - **Expected Announcement**: "Date Received, Jan 15, 2026, edit text"
  - **Check**: Selected date is announced

### Closing the Calendar

- [ ] **Close with Escape**
  - With calendar open, press Escape
  - **Expected**: Calendar closes
  - **Expected**: Focus returns to input field
  - **Expected Announcement**: Input field is announced

- [ ] **Close by Selecting Date**
  - Select a date
  - **Expected**: Calendar closes automatically
  - **Expected**: Focus returns to input field

### Clearing a Date

- [ ] **Clear Button with Screen Reader**
  - Navigate to clear button (X) when date is selected
  - Activate button
  - **Expected**: Date is cleared
  - **Expected Announcement**: Input field with placeholder
  - **Check**: User knows the date was cleared

### ARIA Attributes Verification

- [ ] **aria-label or aria-labelledby**
  - **Check**: Calendar dialog has descriptive label

- [ ] **aria-expanded**
  - **Check**: Input or calendar button has `aria-expanded="false"` when closed
  - **Check**: `aria-expanded="true"` when open

- [ ] **role="dialog"**
  - **Check**: Calendar popup has `role="dialog"`

- [ ] **role="grid"**
  - **Check**: Date grid has `role="grid"`

- [ ] **role="gridcell"**
  - **Check**: Each date cell has `role="gridcell"`

- [ ] **role="columnheader"**
  - **Check**: Weekday headers have `role="columnheader"`

- [ ] **aria-selected**
  - **Check**: Selected date cell has `aria-selected="true"`

- [ ] **aria-label on date cells**
  - **Check**: Each date cell has descriptive `aria-label` (e.g., "June 15, 2026")

- [ ] **aria-label on navigation buttons**
  - **Check**: Prev/Next buttons have descriptive labels

### Disabled State

- [ ] **Disabled DatePicker Announced**
  - Navigate to a disabled DatePicker (if implemented in tests)
  - **Expected Announcement**: "Date Received, edit text, disabled" or "unavailable"
  - **Check**: Disabled state is clearly announced
  - **Check**: User cannot activate calendar button

---

## Form Integration - Screen Reader Testing

### JobForm Navigation

- [ ] **Logical Reading Order**
  - Navigate through the entire JobForm with screen reader
  - **Expected**: Fields are announced in logical order
  - **Expected**: No skipped or out-of-order fields

- [ ] **Field Labels Associated**
  - For each field, check that label is announced with the input
  - **Check**: "Customer, combobox" not just "combobox"
  - **Check**: "Date Received, edit text" not just "edit text"

- [ ] **Required Fields Indicated**
  - Navigate to required fields (Customer, Contract Price)
  - **Expected**: Required state is announced ("required" or "*")
  - **Check**: User knows which fields are mandatory

- [ ] **Field Relationships**
  - When "Others" style is selected, a new "Specify Style" field appears
  - **Check**: User can discover and navigate to the new field
  - **Check**: Relationship is clear (conditional field)

### Form Validation with Screen Reader

- [ ] **Validation Errors Announced**
  - Submit form with validation errors
  - **Expected**: Error messages are announced
  - **Expected**: Focus moves to first error or error banner
  - **Check**: User knows what went wrong

- [ ] **Error Banner**
  - Navigate to the ErrorBanner component (if errors exist)
  - **Expected Announcement**: Each error message is announced
  - **Check**: User can understand all errors

- [ ] **Field-Level Errors** (if implemented)
  - Navigate to a field with an error
  - **Expected**: Error message is associated and announced
  - **Check**: `aria-describedby` or `aria-invalid` is used

### JobsTable Filters with Screen Reader

- [ ] **Filter Selects Announced**
  - Navigate to Style, Month, Status filters
  - **Expected**: Each filter is announced with its purpose
  - **Check**: Labels are clear ("Style filter", "Month filter", etc.)

- [ ] **Search Input Announced**
  - Navigate to the search input in JobsTable
  - **Expected Announcement**: "Search customer, job #, tailor, search box"
  - **Check**: Placeholder or label is announced

- [ ] **Table Updates Announced** (if live region is implemented)
  - Change a filter and check if table update is announced
  - **Nice to have**: "Showing 15 results" or similar announcement
  - **Check**: User knows the table content changed

---

## Cross-Screen Reader Testing

### VoiceOver (Mac/iOS)

- [ ] **Test on macOS Safari**
  - Complete all Select and DatePicker tests above
  - **Notes**: ____________________________

- [ ] **Test on iOS Safari**
  - Complete mobile-specific tests
  - **Notes**: ____________________________

### NVDA (Windows)

- [ ] **Test on Windows Chrome**
  - Complete all Select and DatePicker tests above
  - **Notes**: ____________________________

- [ ] **Test on Windows Firefox**
  - Complete all Select and DatePicker tests above
  - **Notes**: ____________________________

### JAWS (Windows) - Optional

- [ ] **Test on Windows Chrome**
  - Complete all Select and DatePicker tests above
  - **Notes**: ____________________________

### TalkBack (Android) - Optional

- [ ] **Test on Android Chrome**
  - Complete mobile-specific tests
  - **Notes**: ____________________________

---

## Common Issues to Watch For

- [ ] **Missing Labels**: Buttons or inputs without accessible names
- [ ] **Incorrect Roles**: Using div instead of button, etc.
- [ ] **Missing State Announcements**: Expanded/collapsed, selected, disabled not announced
- [ ] **Focus Lost**: Focus disappears after closing dropdown/calendar
- [ ] **No Keyboard Access**: Cannot operate with keyboard alone
- [ ] **Verbose Announcements**: Too much information announced at once
- [ ] **Ambiguous Labels**: "Button" without context
- [ ] **Live Region Overuse**: Too many dynamic announcements causing confusion

---

## Testing Results

### VoiceOver (macOS)
- **Browser**: _______________
- **macOS Version**: _______________
- **Date Tested**: _______________
- **Pass/Fail**: _______________
- **Notes**: _______________

### NVDA (Windows)
- **Browser**: _______________
- **Windows Version**: _______________
- **NVDA Version**: _______________
- **Date Tested**: _______________
- **Pass/Fail**: _______________
- **Notes**: _______________

---

## Issues Found

| Component | Issue Description | Severity | Screen Reader | Status |
|-----------|------------------|----------|---------------|--------|
| Example: Select | Selected option not announced | High | VoiceOver | Open |
|  |  |  |  |  |
|  |  |  |  |  |

---

## Sign-Off

**Tester Name**: _______________  
**Date**: _______________  
**Overall Result**: ☐ Pass  ☐ Fail  ☐ Pass with minor issues  

**Accessibility Compliance Level**: ☐ WCAG 2.1 Level A  ☐ WCAG 2.1 Level AA  ☐ Not Compliant  

**Recommendations**:
_______________________________________________
_______________________________________________
_______________________________________________

---

## Additional Resources

- [WAI-ARIA Authoring Practices - Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [WAI-ARIA Authoring Practices - Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WAI-ARIA Authoring Practices - Date Picker](https://www.w3.org/WAI/ARIA/apg/patterns/datepicker/)
- [WebAIM: Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
