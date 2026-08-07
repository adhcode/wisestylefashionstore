import { prisma } from "./prisma";
import type { AuthUser, Role } from "@/domain/entities";

export interface UserAccount extends AuthUser {
  tailorName: string | null;
}

function rawFindByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, include: { tailor: true } });
}
type UserRow = NonNullable<Awaited<ReturnType<typeof rawFindByEmail>>>;

function toDomain(row: UserRow): UserAccount {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as Role,
    tailorId: row.tailorId,
    tailorName: row.tailor?.name ?? null,
  };
}

export const userRepository = {
  async findByEmail(email: string) {
    const row = await rawFindByEmail(email);
    return row ? { ...toDomain(row), passwordHash: row.passwordHash } : null;
  },

  async findAll(): Promise<UserAccount[]> {
    const rows = await prisma.user.findMany({
      include: { tailor: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDomain);
  },

  async create(input: {
    email: string;
    name: string;
    role: Role;
    passwordHash: string;
    tailorId: string | null;
  }): Promise<UserAccount> {
    const row = await prisma.user.create({
      data: input,
      include: { tailor: true },
    });
    return toDomain(row);
  },

  async remove(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },
};
