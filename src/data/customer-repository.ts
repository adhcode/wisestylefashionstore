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
      data: { ...input, customerNumber: "CU-" + pad(count + 1) },
    });
    return toDomain(row);
  },

  async update(id: string, input: CustomerInput): Promise<Customer> {
    const row = await prisma.customer.update({ where: { id }, data: input });
    return toDomain(row);
  },

  async remove(id: string): Promise<void> {
    await prisma.customer.delete({ where: { id } });
  },
};
