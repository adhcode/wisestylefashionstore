import { prisma } from "./prisma";
import { pad } from "@/domain/format";
import type { Customer, CustomerInput } from "@/domain/entities";
import type { CustomerModel } from "@/generated/prisma/models";

function toDomain(row: CustomerModel): Customer {
  return {
    id: row.id,
    customerNumber: row.customerNumber,
    name: row.name,
    gender: row.gender,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    birthdate: row.birthdate ? row.birthdate.toISOString().split('T')[0] : null,
    address: row.address,
    state: row.state,
    city: row.city,
    occupation: row.occupation,
    preferredStyle: row.preferredStyle,
    preferredFabric: row.preferredFabric,
    preferredColours: row.preferredColours,
    occasion: row.occasion,
    interests: row.interests,
    returning: row.returning,
    preferredStyleImage: row.preferredStyleImage,
    measurements: row.measurements ? JSON.parse(row.measurements) : null,
    referrerId: row.referrerId,
    lastBirthdayEmailSent: row.lastBirthdayEmailSent ? row.lastBirthdayEmailSent.toISOString() : null,
  };
}

export const customerRepository = {
  async findAll(): Promise<Customer[]> {
    const rows = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toDomain);
  },

  async findById(id: string): Promise<Customer | null> {
    const row = await prisma.customer.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  },

  async create(input: CustomerInput): Promise<Customer> {
    const count = await prisma.customer.count();
    const row = await prisma.customer.create({
      data: { 
        ...input, 
        customerNumber: "CU-" + pad(count + 1),
        measurements: input.measurements ? JSON.stringify(input.measurements) : null,
        birthdate: input.birthdate ? new Date(input.birthdate) : null,
      },
    });
    return toDomain(row);
  },

  async update(id: string, input: CustomerInput): Promise<Customer> {
    const row = await prisma.customer.update({ 
      where: { id }, 
      data: {
        ...input,
        measurements: input.measurements ? JSON.stringify(input.measurements) : null,
        birthdate: input.birthdate ? new Date(input.birthdate) : null,
      },
    });
    return toDomain(row);
  },

  async findBirthdaysToday(): Promise<Customer[]> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Find customers whose birthday is today (month and day match)
    const rows = await prisma.$queryRaw<CustomerModel[]>`
      SELECT * FROM "Customer"
      WHERE "birthdate" IS NOT NULL
        AND EXTRACT(MONTH FROM "birthdate") = ${month}
        AND EXTRACT(DAY FROM "birthdate") = ${day}
        AND "email" IS NOT NULL
        AND ("lastBirthdayEmailSent" IS NULL OR DATE("lastBirthdayEmailSent") < CURRENT_DATE)
    `;
    
    return rows.map(toDomain);
  },

  async markBirthdayEmailSent(id: string): Promise<void> {
    await prisma.customer.update({
      where: { id },
      data: { lastBirthdayEmailSent: new Date() },
    });
  },

  async remove(id: string): Promise<void> {
    await prisma.customer.delete({ where: { id } });
  },
};
