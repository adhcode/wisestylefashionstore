import { prisma } from "./prisma";
import { fromISODate, toISODate } from "./date-mapping";
import { emptyMaterials } from "@/domain/calculations";
import { pad } from "@/domain/format";
import type { Job, JobInput, MaterialsState, Payment, PaymentInput } from "@/domain/entities";

const jobWithRelations = { include: { customer: true, tailor: true, payments: true } } as const;

// Prisma 7's `prisma-client` generator doesn't expose `GetPayload`/`validator`
// helpers, so the "row with relations" shape is derived straight from a real
// query's return type instead of hand-declared — it can't drift from reality.
function rawFindById(id: string) {
  return prisma.job.findUnique({ where: { id }, ...jobWithRelations });
}
type JobRow = NonNullable<Awaited<ReturnType<typeof rawFindById>>>;
type PaymentRow = JobRow["payments"][number];

function parseMaterials(raw: string): MaterialsState {
  try {
    const parsed = JSON.parse(raw);
    // Return parsed materials as-is since they can be dynamic keys now
    return parsed as MaterialsState;
  } catch {
    // Return empty object if parse fails
    return {};
  }
}

function paymentToDomain(row: PaymentRow): Payment {
  return {
    id: row.id,
    jobId: row.jobId,
    date: toISODate(row.date) ?? "",
    amount: row.amount,
    method: row.method,
    note: row.note,
    type: row.type === "refund" ? "refund" : "payment",
  };
}

function toDomain(row: JobRow): Job {
  return {
    id: row.id,
    jobNumber: row.jobNumber,
    customerId: row.customerId,
    customerName: row.customer.name,
    style: row.style,
    styleOther: row.styleOther,
    dateReceived: toISODate(row.dateReceived),
    startDate: toISODate(row.startDate),
    completionDate: toISODate(row.completionDate),
    actualCompletionDate: toISODate(row.actualCompletionDate),
    contractPrice: row.contractPrice,
    depositPaid: row.depositPaid,
    materials: parseMaterials(row.materials),
    tailorId: row.tailorId,
    tailorName: row.tailor?.name ?? null,
    progress: row.progress,
    notes: row.notes,
    satisfactionRating: row.satisfactionRating,
    payments: row.payments.map(paymentToDomain),
    measurements: row.measurements ? JSON.parse(row.measurements) : null,
  };
}

export const jobRepository = {
  async findAll(filter?: { tailorId?: string }): Promise<Job[]> {
    const rows = await prisma.job.findMany({
      where: filter?.tailorId ? { tailorId: filter.tailorId } : undefined,
      orderBy: { dateReceived: "desc" },
      ...jobWithRelations,
    });
    return rows.map(toDomain);
  },

  async findById(id: string): Promise<Job | null> {
    const row = await rawFindById(id);
    return row ? toDomain(row) : null;
  },

  async create(input: JobInput): Promise<Job> {
    const count = await prisma.job.count();
    const row = await prisma.job.create({
      data: {
        customerId: input.customerId,
        style: input.style,
        styleOther: input.styleOther,
        dateReceived: fromISODate(input.dateReceived),
        startDate: fromISODate(input.startDate),
        completionDate: fromISODate(input.completionDate),
        actualCompletionDate: fromISODate(input.actualCompletionDate),
        contractPrice: input.contractPrice,
        depositPaid: input.depositPaid,
        materials: JSON.stringify(input.materials),
        measurements: input.measurements ? JSON.stringify(input.measurements) : null,
        tailorId: input.tailorId,
        progress: input.progress,
        notes: input.notes,
        jobNumber: "WS-" + pad(count + 1),
      },
      ...jobWithRelations,
    });
    return toDomain(row);
  },

  async update(id: string, input: JobInput): Promise<Job> {
    const row = await prisma.job.update({
      where: { id },
      data: {
        customerId: input.customerId,
        style: input.style,
        styleOther: input.styleOther,
        dateReceived: fromISODate(input.dateReceived),
        startDate: fromISODate(input.startDate),
        completionDate: fromISODate(input.completionDate),
        actualCompletionDate: fromISODate(input.actualCompletionDate),
        contractPrice: input.contractPrice,
        depositPaid: input.depositPaid,
        materials: JSON.stringify(input.materials),
        measurements: input.measurements ? JSON.stringify(input.measurements) : null,
        tailorId: input.tailorId,
        progress: input.progress,
        notes: input.notes,
      },
      ...jobWithRelations,
    });
    return toDomain(row);
  },

  async updateProgress(id: string, progress: number): Promise<Job> {
    const row = await prisma.job.update({
      where: { id },
      data: { progress },
      ...jobWithRelations,
    });
    return toDomain(row);
  },

  async remove(id: string): Promise<void> {
    await prisma.job.delete({ where: { id } });
  },

  async addPayment(jobId: string, input: PaymentInput): Promise<Payment> {
    const row = await prisma.payment.create({
      data: {
        jobId,
        date: fromISODate(input.date) ?? new Date(),
        amount: input.amount,
        method: input.method,
        note: input.note,
        type: input.type,
      },
    });
    return paymentToDomain(row);
  },

  async updateSatisfactionRating(id: string, rating: number): Promise<Job> {
    await prisma.job.update({
      where: { id },
      data: { satisfactionRating: rating },
    });
    const updated = await rawFindById(id);
    if (!updated) throw new Error("Job not found after update");
    return toDomain(updated);
  },
};
