// Domain types. This module has zero framework or database imports —
// it describes the business shapes shared by every other layer.

export const ROLES = ["ADMIN", "MANAGER", "TAILOR"] as const;
export type Role = (typeof ROLES)[number];

export const PAYMENT_TYPES = ["payment", "refund"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export type JobStatus = "Pending" | "In Progress" | "Completed";

export const MATERIAL_KEYS = [
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

export type MaterialsState = Record<MaterialKey, MaterialEntry>;

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
  payments: Payment[];
}

export type JobInput = Omit<
  Job,
  "id" | "jobNumber" | "customerName" | "tailorName" | "payments"
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
