// Domain types. This module has zero framework or database imports —
// it describes the business shapes shared by every other layer.

export const ROLES = ["ADMIN", "MANAGER", "TAILOR"] as const;
export type Role = (typeof ROLES)[number];

export const PAYMENT_TYPES = ["payment", "refund"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export type JobStatus = "Pending" | "In Progress" | "Completed";

export const MATERIAL_KEYS = [
  "fabric",
  "lining",
  "needle",
  "stay",
  "buttons",
  "monogramFull",
  "monogramPartial",
  "zip",
  "thread",
  "underlay",
] as const;
export type MaterialKey = (typeof MATERIAL_KEYS)[number];

export interface MaterialEntry {
  included: boolean;
  qty: number;
  cost: number;
}

// Dynamic materials from database
export interface MaterialType {
  id: string;
  key: string;
  label: string;
  unit: string;
  maxQuantity: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export type MaterialTypeInput = Omit<
  MaterialType,
  "id" | "key" | "createdAt" | "updatedAt"
>;

// Updated to support dynamic material keys (string instead of MaterialKey)
export type MaterialsState = Record<string, MaterialEntry>;

// Measurements for a customer or job (e.g., {"Shoulder": 18, "Chest": 42})
export type Measurements = Record<string, number>;

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  gender: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  state: string | null;
  city: string | null;
  occupation: string | null;
  preferredStyle: string | null;
  preferredFabric: string | null;
  preferredColours: string | null;
  occasion: string | null;
  interests: string | null;
  returning: boolean;
  preferredStyleImage: string | null;
  measurements: Measurements | null;
  referrerId: string | null;
}

export type CustomerInput = Omit<Customer, "id" | "customerNumber">;

export interface Tailor {
  id: string;
  tailorNumber: string;
  name: string;
  phone: string | null;
  address: string | null;
  dateJoined: string | null; // ISO date (yyyy-mm-dd)
  rating: number;
  notes: string | null;
}

export type TailorInput = Omit<Tailor, "id" | "tailorNumber">;

export interface WagePayment {
  id: string;
  tailorId: string;
  weekStart: string; // ISO date
  amount: number;
  note: string | null;
  datePaid: string; // ISO date
}

export type WagePaymentInput = Omit<WagePayment, "id" | "tailorId">;

export interface Payment {
  id: string;
  jobId: string;
  date: string; // ISO date
  amount: number;
  method: string | null;
  note: string | null;
  type: PaymentType;
}

export type PaymentInput = Omit<Payment, "id" | "jobId">;

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  style: string;
  styleOther: string | null;
  dateReceived: string | null;
  startDate: string | null;
  completionDate: string | null;
  actualCompletionDate: string | null;
  contractPrice: number;
  depositPaid: number;
  materials: MaterialsState;
  tailorId: string | null;
  tailorName: string | null;
  progress: number;
  notes: string | null;
  satisfactionRating: number | null;
  payments: Payment[];
  measurements: Measurements | null;
}

export type JobInput = Omit<
  Job,
  "id" | "jobNumber" | "customerName" | "tailorName" | "payments" | "satisfactionRating"
>;

export interface JobDerived {
  contractPrice: number;
  deposit: number;
  paymentsTotal: number;
  totalPaid: number;
  matCostActual: number;
  materialBudget: number;
  balanceAfterMaterial: number;
  tailorFee: number;
  officeUtility: number;
  miscellaneous: number;
  profit: number;
  outstanding: number;
  progress: number;
  status: JobStatus;
}

export interface PaymentLedgerEntry {
  id: string;
  date: string;
  amount: number;
  method: string | null;
  note: string | null;
  type: PaymentType;
  runningTotal: number;
  outstandingAfter: number;
}

export interface TailorWageInfo {
  earned: number;
  paid: number;
  pending: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tailorId: string | null;
}

export interface Referrer {
  id: string;
  referrerNumber: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  notes: string | null;
}

export type ReferrerInput = Omit<Referrer, "id" | "referrerNumber">;
