# WiseStyle Fashion Store

A Next.js application for managing a fashion tailoring business, featuring job tracking, customer management, tailor coordination, and automated birthday emails.

## Features

- 👔 Job tracking and management
- 👥 Customer relationship management
- ✂️ Tailor coordination and wage tracking
- 📊 Financial reporting and analytics
- 📄 Invoice and receipt generation (PDF)
- 🎂 **Automated birthday emails** (Free!)
- 📱 Responsive mobile-first design
- 🔐 Role-based access control

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Development Setup

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `RESEND_API_KEY` - For birthday emails (from resend.com)
- `FROM_EMAIL` - Email sender address
- `CRON_SECRET` - Cron job authentication (generate with `openssl rand -base64 32`)

## Automated Birthday Emails 🎂

WiseStyle automatically sends personalized birthday emails to customers on their special day.

**Quick Setup:** See `QUICK_START_BIRTHDAY_EMAILS.md` for 10-minute setup guide.

**Features:**
- ✅ Runs daily at 8:00 AM UTC (9:00 AM WAT)
- ✅ Beautiful HTML email templates with WiseStyle branding
- ✅ No duplicate emails (tracks last sent date)
- ✅ **100% Free** (Vercel Cron + Resend free tier)
- ✅ Zero maintenance required

**Documentation:**
- `QUICK_START_BIRTHDAY_EMAILS.md` - Fast setup guide
- `BIRTHDAY_EMAIL_PRODUCTION_CHECKLIST.md` - Detailed production guide
- `VERCEL_CRON_TESTING.md` - Testing instructions

**Health Check:**
```bash
curl https://your-app.vercel.app/api/health/birthday-cron
```

## Custom UI Components

WiseStyle includes custom-built UI components designed for efficient data entry and brand consistency.

### Select Component

A searchable dropdown component that replaces native `<select>` elements.

**Location**: `src/components/ui/Select.tsx`

**Features**:
- Real-time search filtering
- Keyboard navigation (↑↓ arrows, Enter, Escape, Home, End)
- Click-outside-to-close
- Fully accessible (ARIA compliant)
- WiseStyle brand styling

**Usage**:

```tsx
import { Select } from "@/components/ui/Select";

const [selectedStyle, setSelectedStyle] = useState("");

<Select
  value={selectedStyle}
  onChange={setSelectedStyle}
  options={[
    { value: "casual", label: "Casual" },
    { value: "formal", label: "Formal" },
    { value: "wedding", label: "Wedding Dress" }
  ]}
  placeholder="Select a style..."
  searchPlaceholder="Search styles..."
/>
```

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Currently selected value |
| `onChange` | `(value: string) => void` | Yes | Callback when selection changes |
| `options` | `SelectOption[]` | Yes | Array of `{ value, label }` objects |
| `placeholder` | `string` | No | Text shown when no option selected |
| `searchPlaceholder` | `string` | No | Text shown in search input |
| `className` | `string` | No | Additional CSS classes |
| `disabled` | `boolean` | No | Disables all interactions |

**Keyboard Shortcuts**:
- `↓` - Open dropdown or move to next option
- `↑` - Move to previous option
- `Enter` - Select highlighted option
- `Escape` - Close dropdown
- `Home` - Jump to first option
- `End` - Jump to last option

### DatePicker Component

A visual calendar picker that replaces native date inputs.

**Location**: `src/components/ui/DatePicker.tsx`

**Features**:
- Interactive calendar grid (6 weeks × 7 days)
- Month/year navigation
- Today highlighting (gold ring)
- Selected date highlighting (plum background)
- Clear button to remove date
- Touch-friendly for mobile
- Fully accessible (ARIA compliant)
- Browser-consistent appearance

**Usage**:

```tsx
import { DatePicker } from "@/components/ui/DatePicker";

const [dueDate, setDueDate] = useState<string | null>(null);

<DatePicker
  value={dueDate}
  onChange={setDueDate}
  placeholder="Select due date..."
/>
```

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string \| null` | Yes | ISO date string (yyyy-mm-dd) or null |
| `onChange` | `(value: string \| null) => void` | Yes | Callback when date changes or is cleared |
| `placeholder` | `string` | No | Text shown when no date selected |
| `className` | `string` | No | Additional CSS classes |
| `disabled` | `boolean` | No | Disables all interactions |

**Date Format**:
- **Value prop**: ISO 8601 format (`"2026-01-15"`)
- **Display format**: User-friendly (`"Jan 15, 2026"`)

**Example with Field wrapper**:

```tsx
import { Field } from "@/components/ui/Field";
import { DatePicker } from "@/components/ui/DatePicker";

<Field label="Order Date *">
  <DatePicker
    value={form.orderDate}
    onChange={(date) => setForm({ ...form, orderDate: date })}
    placeholder="When was this ordered?"
  />
</Field>
```

### Migration from Native Inputs

If you're updating existing forms:

**Before** (native select):
```tsx
<select value={style} onChange={(e) => setStyle(e.target.value)}>
  <option value="">Select...</option>
  <option value="casual">Casual</option>
  <option value="formal">Formal</option>
</select>
```

**After** (Select component):
```tsx
<Select
  value={style}
  onChange={setStyle}
  options={[
    { value: "casual", label: "Casual" },
    { value: "formal", label: "Formal" }
  ]}
  placeholder="Select..."
/>
```

**Before** (native date input):
```tsx
<input
  type="date"
  value={dueDate ?? ""}
  onChange={(e) => setDueDate(e.target.value)}
/>
```

**After** (DatePicker component):
```tsx
<DatePicker
  value={dueDate}
  onChange={setDueDate}
/>
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
