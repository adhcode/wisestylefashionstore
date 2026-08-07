import { prisma } from "./prisma";
import { fromISODate, toISODate } from "./date-mapping";
import { pad } from "@/domain/format";
import type { Tailor, TailorInput, WagePayment, WagePaymentInput } from "@/domain/entities";
import type { TailorModel, WagePaymentModel } from "@/generated/prisma/models";

function toDomain(row: TailorModel): Tailor {
  return {
    id: row.id,
    tailorNumber: row.tailorNumber,
    name: row.name,
    phone: row.phone,
    address: row.address,
    dateJoined: toISODate(row.dateJoined),
    rating: row.rating,
    notes: row.notes,
  };
}

function wageToDomain(row: WagePaymentModel): WagePayment {
  return {
    id: row.id,
    tailorId: row.tailorId,
    weekStart: toISODate(row.weekStart) ?? "",
    amount: row.amount,
    note: row.note,
    datePaid: toISODate(row.datePaid) ?? "",
  };
}

export const tailorRepository = {
  async findAll(): Promise<Tailor[]> {
    const rows = await prisma.tailor.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toDomain);
  },

  async findById(id: string): Promise<Tailor | null> {
    const row = await prisma.tailor.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  },

  async findAllWithWagePayments(): Promise<Array<{ tailor: Tailor; wagePayments: WagePayment[] }>> {
    const rows = await prisma.tailor.findMany({
      orderBy: { createdAt: "desc" },
      include: { wagePayments: true },
    });
    return rows.map((row) => ({
      tailor: toDomain(row),
      wagePayments: row.wagePayments.map(wageToDomain),
    }));
  },

  async wagePaymentsFor(tailorId: string): Promise<WagePayment[]> {
    const rows = await prisma.wagePayment.findMany({
      where: { tailorId },
      orderBy: { weekStart: "desc" },
    });
    return rows.map(wageToDomain);
  },

  async create(input: TailorInput): Promise<Tailor> {
    const count = await prisma.tailor.count();
    const row = await prisma.tailor.create({
      data: {
        name: input.name,
        phone: input.phone,
        address: input.address,
        dateJoined: fromISODate(input.dateJoined),
        rating: input.rating,
        notes: input.notes,
        tailorNumber: "AP-" + pad(count + 1),
      },
    });
    return toDomain(row);
  },

  async update(id: string, input: TailorInput): Promise<Tailor> {
    const row = await prisma.tailor.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone,
        address: input.address,
        dateJoined: fromISODate(input.dateJoined),
        rating: input.rating,
        notes: input.notes,
      },
    });
    return toDomain(row);
  },

  async remove(id: string): Promise<void> {
    await prisma.tailor.delete({ where: { id } });
  },

  async addWagePayment(tailorId: string, input: WagePaymentInput): Promise<WagePayment> {
    const row = await prisma.wagePayment.create({
      data: {
        tailorId,
        weekStart: fromISODate(input.weekStart) ?? new Date(),
        amount: input.amount,
        note: input.note,
        datePaid: fromISODate(input.datePaid) ?? new Date(),
      },
    });
    return wageToDomain(row);
  },

  async removeWagePayment(paymentId: string): Promise<void> {
    await prisma.wagePayment.delete({ where: { id: paymentId } });
  },
};
