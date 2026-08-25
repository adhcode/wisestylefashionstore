# Task 7.2: Mobile Device Testing Checklist

This checklist covers manual testing required for iOS Safari and Android Chrome to ensure the custom Select and DatePicker components work correctly on mobile devices.

## Testing Devices/Browsers

- **iOS Safari**: iOS 14+ on iPhone and iPad
- **Android Chrome**: Android 10+ on various device sizes

## Test Environment Setup

1. Access the application on mobile devices:
   - Use actual physical devices (preferred)
   - Or use browser developer tools device emulation as a preliminary check
2. Navigate to the Jobs page and open the New Job form
3. Navigate to the Jobs table with filters

---

## Select Component - Mobile Testing

### Touch Interactions

- [ ] **Open Dropdown**: Tap the Select trigger button to open the dropdown
  - **Expected**: Dropdown opens smoothly without delay
  - **Expected**: Search input is automatically focused (keyboard appears on mobile)

- [ ] **Close Dropdown**: Tap outside the dropdown to close it
  - **Expected**: Dropdown closes
  - **Expected**: No unintended actions occur (e.g., clicking through to element behind)

- [ ] **Search Input**: Type into the search box
  - **Expected**: Mobile keyboard appears
  - **Expected**: Filtering works in real-time as you type
  - **Expected**: No lag or performance issues

- [ ] **Clear Search**: Tap the X button to clear search text
  - **Expected**: Search clears instantly
  - **Expected**: All options reappear
  - **Expected**: Search input remains focused

- [ ] **Select Option**: Tap an option from the list
  - **Expected**: Option is selected
  - **Expected**: Dropdown closes
  - **Expected**: Selected value appears in the trigger button

- [ ] **Scroll Through Options**: Scroll through a long list of options (e.g., 100+ customers)
  - **Expected**: Scrolling is smooth with no stuttering
  - **Expected**: No accidental option selection while scrolling

### Touch Target Sizes

- [ ] **Trigger Button Size**: Verify trigger button is easy to tap
  - **Minimum**: Should be at least 44x44px (Apple HIG) or 48x48dp (Material Design)
  - **Test**: Can you easily tap it with your thumb without missing?

- [ ] **Option Size**: Verify option items are easy to tap
  - **Minimum**: Should be at least 44px tall
  - **Test**: Can you tap individual options without accidentally selecting the wrong one?

- [ ] **Close Button (X)**: Verify clear search button is easy to tap
  - **Test**: Can you tap the X button without difficulty?

### Viewport and Layout

- [ ] **Dropdown Positioning**: Open dropdown on small screens
  - **Expected**: Dropdown doesn't overflow off the screen
  - **Expected**: Dropdown is fully visible and scrollable

- [ ] **Portrait Orientation**: Test in portrait mode
  - **Expected**: All elements are visible and functional
  - **Expected**: No horizontal scrolling required

- [ ] **Landscape Orientation**: Rotate device to landscape mode
  - **Expected**: Layout adjusts appropriately
  - **Expected**: Dropdown still functions correctly

- [ ] **Small Screens (iPhone SE, small Android)**: Test on smallest supported screen size
  - **Expected**: Everything is still usable
  - **Expected**: Text is readable without zooming

### Mobile Keyboard Behavior

- [ ] **Keyboard Opens on Focus**: When dropdown opens, keyboard should appear
  - **Expected**: Keyboard appears automatically for search input
  - **Expected**: Keyboard doesn't cover the entire dropdown

- [ ] **Keyboard Doesn't Zoom**: Verify font size is adequate (16px+ to prevent auto-zoom on iOS)
  - **Expected**: Page doesn't zoom when focusing search input

- [ ] **Return/Done Key**: Press Return/Done on mobile keyboard
  - **Expected**: Keyboard closes or appropriate action occurs

### Performance on Mobile

- [ ] **Search Performance**: Type quickly into search with 100+ options
  - **Expected**: No lag or stuttering
  - **Expected**: Filtering keeps up with typing speed

- [ ] **Open/Close Speed**: Rapidly open and close dropdown multiple times
  - **Expected**: Smooth animations
  - **Expected**: No visual glitches

---

## DatePicker Component - Mobile Testing

### Touch Interactions

- [ ] **Open Calendar**: Tap the calendar icon button to open the picker
  - **Expected**: Calendar popup opens smoothly
  - **Expected**: Calendar is fully visible on screen

- [ ] **Close Calendar**: Tap outside the calendar to close it
  - **Expected**: Calendar closes
  - **Expected**: No unintended actions occur

- [ ] **Select Date**: Tap a date cell in the calendar
  - **Expected**: Date is selected
  - **Expected**: Calendar closes
  - **Expected**: Selected date appears in the input field formatted correctly

- [ ] **Navigate Months**: Tap previous/next month arrows
  - **Expected**: Month changes smoothly
  - **Expected**: No lag or visual glitches
  - **Expected**: Previous month dates are grayed out appropriately

- [ ] **Today Button**: Tap the "Today" button at the bottom of the calendar
  - **Expected**: Current date is selected
  - **Expected**: Calendar closes
  - **Expected**: Today's date appears in input

- [ ] **Clear Date**: Tap the X button to clear the selected date
  - **Expected**: Date is cleared (input shows placeholder)
  - **Expected**: Calendar doesn't open

### Touch Target Sizes

- [ ] **Calendar Icon Button**: Verify icon button is easy to tap
  - **Minimum**: Should be at least 44x44px
  - **Test**: Can you easily tap it without missing?

- [ ] **Date Cells**: Verify individual date cells are easy to tap
  - **Minimum**: Should be at least 40x40px
  - **Test**: Can you tap specific dates without selecting adjacent dates?

- [ ] **Navigation Arrows**: Verify prev/next month arrows are easy to tap
  - **Test**: Can you tap arrows without difficulty?

- [ ] **Clear Button (X)**: Verify clear date button is easy to tap
  - **Test**: Can you tap it accurately?

- [ ] **Today Button**: Verify Today button is easy to tap
  - **Test**: Full-width button should be easy to press

### Calendar Layout on Mobile

- [ ] **Calendar Size**: Verify calendar popup fits on small screens
  - **Expected**: Calendar doesn't overflow viewport
  - **Expected**: All 42 date cells are visible without scrolling
  - **Expected**: Calendar is not too small to use comfortably

- [ ] **Portrait Orientation**: Test calendar in portrait mode
  - **Expected**: Calendar is centered and visible
  - **Expected**: Date cells are tappable

- [ ] **Landscape Orientation**: Test calendar in landscape mode
  - **Expected**: Calendar adjusts appropriately
  - **Expected**: Still fully functional

- [ ] **Small Screens**: Test on iPhone SE or small Android device
  - **Expected**: Calendar is usable
  - **Expected**: Dates are readable
  - **Expected**: Touch targets are still adequate

### Visual Feedback

- [ ] **Hover States**: Verify that tap gives visual feedback (since hover doesn't exist on mobile)
  - **Expected**: Date cells show active/pressed state when touched
  - **Expected**: Buttons show feedback when tapped

- [ ] **Selected Date Highlighting**: Verify selected date stands out
  - **Expected**: Selected date has distinct purple background
  - **Expected**: Easy to distinguish from today's date (gold border)

- [ ] **Current Month vs Other Months**: Verify dates outside current month are visually distinct
  - **Expected**: Other month dates are grayed out
  - **Expected**: Current month dates are full color

### Date Input Field

- [ ] **Readonly Input**: Verify input field is readonly (can't type directly)
  - **Expected**: Tapping input opens calendar, not keyboard
  - **Expected**: No cursor appears in input field

- [ ] **Formatted Date Display**: Verify date format is readable on mobile
  - **Expected**: Format like "Jun 15, 2026" is clear
  - **Expected**: Text doesn't overflow or get cut off

### Performance on Mobile

- [ ] **Calendar Rendering**: Open calendar with different months
  - **Expected**: Calendar renders instantly (<100ms)
  - **Expected**: No layout shift or flashing

- [ ] **Month Navigation**: Rapidly tap prev/next month buttons
  - **Expected**: Smooth transitions
  - **Expected**: No lag or stuttering

---

## Form Integration - Mobile Testing

### JobForm on Mobile

- [ ] **All Select Fields**: Test Customer, Tailor, and Style Select components
  - **Expected**: All work identically well on mobile

- [ ] **All DatePicker Fields**: Test Date Received, Start Date, Completion Date, Actual Completion Date
  - **Expected**: All work identically well on mobile

- [ ] **Form Scrolling**: Scroll through the entire form
  - **Expected**: Smooth scrolling
  - **Expected**: No elements stick or overlap incorrectly

- [ ] **Field Navigation**: Tap through all form fields in order
  - **Expected**: Focus moves logically
  - **Expected**: No focus traps or skipped fields

- [ ] **Form Submission**: Fill out and submit form on mobile
  - **Expected**: All values are captured correctly
  - **Expected**: Form validation works
  - **Expected**: Success/error messages are visible

### JobsTable Filters on Mobile

- [ ] **Filter Dropdowns**: Test Style, Month, and Status filter Select components
  - **Expected**: All filters work on mobile
  - **Expected**: Filtering updates the table correctly

- [ ] **Search Input**: Type into the search bar on mobile
  - **Expected**: Mobile keyboard appears
  - **Expected**: Search works correctly

- [ ] **Table Responsiveness**: View jobs table on mobile
  - **Expected**: Table is horizontally scrollable if needed
  - **Expected**: Filters are accessible

---

## Cross-Browser Consistency (iOS vs Android)

- [ ] **Visual Consistency**: Compare appearance on iOS Safari vs Android Chrome
  - **Expected**: Components look nearly identical
  - **Expected**: Branding (colors, fonts) is consistent

- [ ] **Functional Consistency**: Compare behavior on both platforms
  - **Expected**: Touch interactions work the same way
  - **Expected**: No platform-specific bugs

- [ ] **Performance Consistency**: Compare speed on both platforms
  - **Expected**: Both platforms feel smooth
  - **Expected**: No significant performance difference

---

## Edge Cases on Mobile

- [ ] **Slow Network**: Test on slow 3G connection
  - **Expected**: Components still function (they're client-side)
  - **Expected**: No blocking or freezing

- [ ] **Low Memory Devices**: Test on older/budget devices
  - **Expected**: Components work without crashes
  - **Expected**: Performance is acceptable

- [ ] **Browser Refresh**: Refresh page while dropdown/calendar is open
  - **Expected**: Page reloads cleanly
  - **Expected**: No errors or broken state

- [ ] **Background Tab**: Open dropdown, switch to another tab, return
  - **Expected**: Dropdown is still open (or closed, depending on implementation)
  - **Expected**: No broken UI

---

## Accessibility on Mobile

- [ ] **VoiceOver (iOS)**: Enable VoiceOver and test components
  - **Note**: This is covered in detail in Task 7.3 (Screen Reader Testing)

- [ ] **TalkBack (Android)**: Enable TalkBack and test components
  - **Note**: This is covered in detail in Task 7.3 (Screen Reader Testing)

- [ ] **Font Scaling**: Increase system font size on device
  - **Expected**: Text scales appropriately
  - **Expected**: Layout doesn't break

- [ ] **Dark Mode**: Enable dark mode on device (if supported)
  - **Expected**: Components are still readable
  - **Note**: WiseStyle theme may not fully support dark mode, which is acceptable

---

## Testing Results

### iOS Safari
- **Device Tested**: _______________
- **iOS Version**: _______________
- **Date Tested**: _______________
- **Pass/Fail**: _______________
- **Notes**: _______________

### Android Chrome
- **Device Tested**: _______________
- **Android Version**: _______________
- **Date Tested**: _______________
- **Pass/Fail**: _______________
- **Notes**: _______________

---

## Issues Found

| Component | Issue Description | Severity | Device/Browser | Status |
|-----------|------------------|----------|----------------|--------|
| Example: Select | Dropdown overflows on iPhone SE | High | iOS Safari | Open |
|  |  |  |  |  |
|  |  |  |  |  |

---

## Sign-Off

**Tester Name**: _______________  
**Date**: _______________  
**Overall Result**: ☐ Pass  ☐ Fail  ☐ Pass with minor issues  

**Recommendations**:
_______________________________________________
_______________________________________________
_______________________________________________
