import { prisma } from "@/data/prisma";
import type { Referrer, ReferrerInput } from "@/domain/entities";

function toDomain(record: any): Referrer {
  return {
    id: record.id,
    referrerNumber: record.referrerNumber,
    name: record.name,
    phone: record.phone,
    email: record.email,
    address: record.address,
    bankName: record.bankName,
    accountName: record.accountName,
    accountNumber: record.accountNumber,
    notes: record.notes,
  };
}

export const referrerRepository = {
  async list(): Promise<Referrer[]> {
    const records = await prisma.referrer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return records.map(toDomain);
  },

  async getById(id: string): Promise<Referrer | null> {
    const record = await prisma.referrer.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  },

  async create(input: ReferrerInput): Promise<Referrer> {
    // Generate referrer number
    const count = await prisma.referrer.count();
    const referrerNumber = `REF${String(count + 1).padStart(4, "0")}`;

    const record = await prisma.referrer.create({
      data: {
        referrerNumber,
        name: input.name,
        phone: input.phone,
        email: input.email,
        address: input.address,
        bankName: input.bankName,
        accountName: input.accountName,
        accountNumber: input.accountNumber,
        notes: input.notes,
      },
    });

    return toDomain(record);
  },

  async update(id: string, input: Partial<ReferrerInput>): Promise<Referrer> {
    const record = await prisma.referrer.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        address: input.address,
        bankName: input.bankName,
        accountName: input.accountName,
        accountNumber: input.accountNumber,
        notes: input.notes,
      },
    });

    return toDomain(record);
  },

  async delete(id: string): Promise<void> {
    await prisma.referrer.delete({ where: { id } });
  },

  async getCustomerCount(referrerId: string): Promise<number> {
    return prisma.customer.count({
      where: { referrerId },
    });
  },

  async getCustomers(referrerId: string) {
    return prisma.customer.findMany({
      where: { referrerId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getTotalJobValue(referrerId: string): Promise<number> {
    const result = await prisma.job.aggregate({
      where: {
        customer: {
          referrerId,
        },
      },
      _sum: {
        contractPrice: true,
      },
    });

    return result._sum.contractPrice ?? 0;
  },
};
