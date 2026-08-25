import { z } from "zod";
import { MATERIAL_KEYS, PAYMENT_TYPES, ROLES } from "@/domain/entities";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// `.nullish()` (not `.optional()`) because the domain layer's optional
// string fields are typed `string | null`, and forms send `null` — not
// `undefined` — for untouched fields.
const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? v : null));
const requiredText = z.string().trim().min(1);

export const customerSchema = z.object({
  name: requiredText,
  gender: requiredText,
  phone: requiredText,
  whatsapp: optionalText,
  email: optionalText,
  address: optionalText,
  state: optionalText,
  city: optionalText,
  occupation: optionalText,
  preferredStyle: optionalText,
  preferredFabric: optionalText,
  preferredColours: optionalText,
  occasion: optionalText,
  interests: optionalText,
  returning: z.boolean().default(false),
  preferredStyleImage: optionalText,
  measurements: z.record(z.string(), z.number()).nullable().default(null),
  referrerId: optionalText,
});

export const tailorSchema = z.object({
  name: requiredText,
  phone: optionalText,
  address: optionalText,
  dateJoined: optionalText,
  rating: z.number().int().min(1).max(5).default(5),
  notes: optionalText,
});

export const wagePaymentSchema = z.object({
  weekStart: requiredText,
  amount: z.number().positive(),
  note: optionalText,
  datePaid: requiredText,
});

const materialEntrySchema = z.object({
  included: z.boolean(),
  qty: z.number().int().min(1),
  cost: z.number().min(0),
});

// Materials are now dynamic from database, so accept any string key
export const materialsSchema = z.record(z.string(), materialEntrySchema);

export const jobSchema = z.object({
  customerId: requiredText,
  style: requiredText,
  styleOther: optionalText,
  dateReceived: optionalText,
  startDate: optionalText,
  completionDate: optionalText,
  actualCompletionDate: optionalText,
  contractPrice: z.number().positive(),
  depositPaid: z.number().min(0).default(0),
  materials: materialsSchema,
  tailorId: optionalText,
  progress: z.number().int().min(0).max(100).default(0),
  notes: optionalText,
  measurements: z.record(z.string(), z.number()).nullable().default(null),
});

export const paymentSchema = z.object({
  date: requiredText,
  amount: z.number().positive(),
  method: optionalText,
  note: optionalText,
  type: z.enum(PAYMENT_TYPES),
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  name: requiredText,
  role: z.enum(ROLES),
  password: z.string().min(8, "Password must be at least 8 characters"),
  tailorId: optionalText,
});

export const referrerSchema = z.object({
  name: requiredText,
  phone: requiredText,
  email: optionalText,
  address: optionalText,
  bankName: optionalText,
  accountName: optionalText,
  accountNumber: optionalText,
  notes: optionalText,
});
