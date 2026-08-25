# WiseStyle Financial Calculations Documentation

## 🎯 Business Model Overview

WiseStyle Fashion Store uses a **contract price allocation system** where the contract price for each job is split between materials, tailor wages, operational costs, and profit.

---

## 💰 Calculation Formula

### Step 1: Calculate Material Budget
```
Material Budget = Sum of all selected materials (Quantity × Cost)
```

**Example:**
- Needle: 2 × ₦500 = ₦1,000
- Thread: 3 × ₦1,000 = ₦3,000
- Buttons: 10 × ₦100 = ₦1,000
- Zip: 1 × ₦10,000 = ₦10,000
- **Total Material Budget: ₦15,000**

### Step 2: Calculate Balance After Materials
```
Balance After Materials = Contract Price - Material Budget
(Minimum: ₦0, never negative)
```

**Example:**
```
Contract Price: ₦100,000
Material Budget: ₦15,000
Balance After Materials: ₦100,000 - ₦15,000 = ₦85,000
```

### Step 3: Split Balance into Allocations
The balance after materials is split using **fixed percentages**:

| Allocation | Percentage | Calculation (on ₦85,000) |
|------------|------------|--------------------------|
| **Tailor Fee** | 25% | ₦85,000 × 0.25 = ₦21,250 |
| **Office & Utility** | 40% | ₦85,000 × 0.40 = ₦34,000 |
| **Miscellaneous** | 5% | ₦85,000 × 0.05 = ₦4,250 |
| **Profit** | 30% | ₦85,000 × 0.30 = ₦25,500 |
| **TOTAL** | **100%** | **₦85,000** ✅ |

---

## 👨‍💼 Tailor Compensation

### How Tailors Earn
Tailors earn **25% of the balance after materials** for each job assigned to them.

**Important Notes:**
1. ✅ Tailor fee is calculated **after** subtracting material costs
2. ✅ Tailor fee is **independent of job progress** (they earn the full amount even if job is at 0%)
3. ✅ Total Earned = Sum of tailor fees from **all assigned jobs**
4. ✅ Wage Pending = Total Earned - Wage Paid

### Example: Tailor Dashboard
If a tailor has 3 assigned jobs:

| Job | Contract | Materials | Balance | Tailor Fee (25%) |
|-----|----------|-----------|---------|------------------|
| Job 1 | ₦100,000 | ₦1,000 | ₦99,000 | ₦24,750 |
| Job 2 | ₦80,000 | ₦2,000 | ₦78,000 | ₦19,500 |
| Job 3 | ₦120,000 | ₦0 | ₦120,000 | ₦30,000 |
| **TOTAL** | | | | **₦74,250** |

**On Tailor Dashboard:**
- Total Earned: **₦74,250** (sum of all tailor fees)
- Wage Paid: ₦50,000 (payments made to tailor)
- Wage Pending: **₦24,250** (₦74,250 - ₦50,000)

---

## 📊 Real-Time Calculations in Job Form

The job form displays a **Contract Price Allocation** section that updates in real-time as you:
1. Change the contract price
2. Select/deselect materials
3. Change material quantities
4. Change material costs

### Display Example

```
CONTRACT PRICE ALLOCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Material Budget               ₦15,000
Balance after Materials       ₦85,000
──────────────────────────────────────
Tailor Fee (25%)             ₦21,250
Office & Utility (40%)       ₦34,000
Miscellaneous (5%)            ₦4,250
Profit (30%)                 ₦25,500
```

---

## 🔍 Edge Cases & Business Rules

### Case 1: No Materials Selected
```
Contract Price: ₦100,000
Material Budget: ₦0
Balance: ₦100,000

→ Tailor Fee: ₦25,000 (25% of ₦100,000)
```

### Case 2: Materials Exceed Contract Price
```
Contract Price: ₦100,000
Materials: ₦130,000
Balance: ₦0 (capped at zero, never negative)

→ Tailor Fee: ₦0
→ All allocations: ₦0
```

⚠️ **Important:** If materials exceed the contract price, the business loses money on that job. The system warns about this but allows it (you may need to adjust the contract price).

### Case 3: Dynamic Material Types
The system now supports **dynamic materials** from the database instead of hardcoded values. This means:
- ✅ Admins/Managers can add new material types
- ✅ Material costs are entered per-job
- ✅ Old material keys are preserved in existing jobs
- ✅ Deleted materials still show in old jobs as "Deleted Material (key)"

---

## 🧮 Code Implementation

All calculations are handled in `src/domain/calculations.ts`:

### Key Functions:

1. **`materialTotal(materials)`**
   - Sums all selected materials (qty × cost)
   - Returns the Material Budget

2. **`jobDerived(job)`**
   - Calculates all financial allocations for a job
   - Returns: materialBudget, balanceAfterMaterial, tailorFee, officeUtility, miscellaneous, profit, outstanding

3. **`tailorWageInfo(tailor, jobs, wagePayments)`**
   - Calculates total earned, paid, and pending wages for a tailor
   - Used in Tailor Dashboard

### Constants:

```typescript
// src/domain/constants.ts
export const SHARE = {
  tailor: 0.25,    // 25%
  utility: 0.40,   // 40%
  misc: 0.05,      // 5%
  profit: 0.30,    // 30%
} as const;
```

⚠️ **Never modify these percentages without business approval!** They define the core business model.

---

## ✅ Verification & Testing

Run the financial calculations audit:
```bash
npx tsx test-calculations.ts
```

This test verifies:
- ✅ All percentages sum to 100%
- ✅ Balance after materials is calculated correctly
- ✅ Allocations sum to the balance
- ✅ Edge cases (no materials, materials > contract price)
- ✅ Tailor wage calculations match expected values

---

## 📱 Where Calculations Are Displayed

### 1. Job Form (Create/Edit)
- **Location:** `/jobs/new` and `/jobs/[id]/edit`
- **Shows:** Real-time allocation as you change values
- **Component:** `src/components/jobs/JobForm.tsx`

### 2. Job Details Page
- **Location:** `/jobs/[id]`
- **Shows:** Final calculated allocations for the job
- **Component:** `src/app/(dashboard)/jobs/[id]/page.tsx`

### 3. Tailor Dashboard
- **Location:** `/dashboard` (when logged in as TAILOR)
- **Shows:** 
  - Total Earned (sum of tailor fees from all assigned jobs)
  - Wage Paid (total wages paid to tailor)
  - Wage Pending (earned - paid)
- **Component:** `src/components/dashboard/TailorDashboardView.tsx`

### 4. Admin Dashboard
- **Location:** `/dashboard` (when logged in as ADMIN/MANAGER)
- **Shows:** Overall business metrics including profit margins
- **Component:** `src/components/dashboard/DashboardView.tsx`

---

## 🎓 Business Model Summary

```
Contract Price (₦100,000)
         │
         ├─► Material Budget (₦15,000) ─────────────► Materials purchased
         │
         └─► Balance After Materials (₦85,000)
                     │
                     ├─► Tailor Fee (25% = ₦21,250) ─► Paid to tailor
                     ├─► Office & Utility (40% = ₦34,000) ─► Operational costs
                     ├─► Miscellaneous (5% = ₦4,250) ─► Extra expenses
                     └─► Profit (30% = ₦25,500) ──────► Business profit
```

### Key Principles:
1. **Materials come first** - Always deducted before any splits
2. **Tailor gets 25%** - Of the remaining balance after materials
3. **Largest share to operations** - 40% covers office & utilities
4. **Smallest share to misc** - 5% for unexpected costs
5. **Profit is 30%** - Business margin after all expenses

---

## 🚨 Common Mistakes to Avoid

❌ **Don't calculate tailor fee on the full contract price**
```typescript
// WRONG
tailorFee = contractPrice * 0.25  // ❌ Ignores materials!
```

✅ **Always calculate on balance after materials**
```typescript
// CORRECT
balance = contractPrice - materialBudget
tailorFee = balance * 0.25  // ✅ Correct!
```

❌ **Don't forget to handle negative balances**
```typescript
// WRONG
balance = contractPrice - materialBudget  // Could be negative!
```

✅ **Always cap at zero**
```typescript
// CORRECT
balance = Math.max(0, contractPrice - materialBudget)  // ✅ Never negative
```

---

## 📞 Support

If you notice any calculation errors or have questions about the financial model, please contact the development team immediately. These calculations are **core to the business** and must be accurate at all times.

**Last Verified:** 2026-08-25
**Status:** ✅ All calculations verified and working correctly
