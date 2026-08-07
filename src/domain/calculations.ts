import { MATERIALS_DEF, SHARE } from "./constants";
import { daysUntil } from "./format";
import type {
  Job,
  JobDerived,
  MaterialsState,
  Payment,
  PaymentLedgerEntry,
  Tailor,
  TailorWageInfo,
} from "./entities";

export function emptyMaterials(): MaterialsState {
  const materials = {} as MaterialsState;
  for (const def of MATERIALS_DEF) {
    materials[def.key] = { included: false, qty: 1, cost: 0 };
  }
  return materials;
}

export function materialTotal(materials: MaterialsState): number {
  return MATERIALS_DEF.reduce((sum, def) => {
    const entry = materials[def.key];
    if (entry?.included) return sum + entry.qty * entry.cost;
    return sum;
  }, 0);
}

export function jobDerived(job: {
  contractPrice: number;
  depositPaid: number;
  materials: MaterialsState;
  payments: Payment[];
  progress: number;
}): JobDerived {
  const contractPrice = job.contractPrice || 0;
  const deposit = job.depositPaid || 0;
  const paymentsTotal = job.payments.reduce((sum, p) => {
    const amt = p.amount || 0;
    return sum + (p.type === "refund" ? -amt : amt);
  }, 0);
  const totalPaid = deposit + paymentsTotal;
  const matCostActual = materialTotal(job.materials);
  const materialBudget = matCostActual; // linked 1:1 to Materials Needed total
  const balanceAfterMaterial = Math.max(0, contractPrice - materialBudget);
  const tailorFee = balanceAfterMaterial * SHARE.tailor;
  const officeUtility = balanceAfterMaterial * SHARE.utility;
  const miscellaneous = balanceAfterMaterial * SHARE.misc;
  const profit = balanceAfterMaterial * SHARE.profit;
  const outstanding = contractPrice - totalPaid;
  const progress = job.progress || 0;
  const status = progress >= 100 ? "Completed" : progress <= 0 ? "Pending" : "In Progress";

  return {
    contractPrice,
    deposit,
    paymentsTotal,
    totalPaid,
    matCostActual,
    materialBudget,
    balanceAfterMaterial,
    tailorFee,
    officeUtility,
    miscellaneous,
    profit,
    outstanding,
    progress,
    status,
  };
}

// Builds the combined, chronological payment/refund ledger for a job (the
// initial deposit plus every recorded entry), each annotated with the
// running total paid and the outstanding balance immediately after it.
export function buildPaymentEntries(job: {
  dateReceived: string | null;
  depositPaid: number;
  contractPrice: number;
  payments: Payment[];
}): PaymentLedgerEntry[] {
  const list: Array<Omit<PaymentLedgerEntry, "runningTotal" | "outstandingAfter">> = [];

  if (job.depositPaid > 0) {
    list.push({
      id: "deposit",
      date: job.dateReceived ?? "",
      amount: job.depositPaid,
      method: "Deposit",
      note: "Initial deposit",
      type: "payment",
    });
  }
  for (const p of job.payments) {
    list.push(p);
  }
  list.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  let running = 0;
  return list.map((p) => {
    const amt = p.amount || 0;
    const signed = p.type === "refund" ? -amt : amt;
    running += signed;
    return {
      ...p,
      runningTotal: running,
      outstandingAfter: Math.max(0, (job.contractPrice || 0) - running),
    };
  });
}

export function tailorWageInfo(
  tailor: Pick<Tailor, "id">,
  jobs: Job[],
  wagePayments: Array<{ amount: number }>,
): TailorWageInfo {
  const earned = jobs
    .filter((j) => j.tailorId === tailor.id)
    .reduce((sum, j) => sum + jobDerived(j).tailorFee, 0);
  const paid = wagePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pending = Math.max(0, earned - paid);
  return { earned, paid, pending };
}

export function getOverdueJobs(jobs: Job[], today: Date = new Date()) {
  return jobs
    .map((job) => {
      const derived = jobDerived(job);
      const days = job.completionDate ? daysUntil(job.completionDate, today) : null;
      const isOverdue = derived.status !== "Completed" && days !== null && days < 0;
      return isOverdue ? { job, derived, daysOverdue: Math.abs(days as number) } : null;
    })
    .filter((entry): entry is { job: Job; derived: JobDerived; daysOverdue: number } => entry !== null)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}
