import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upsertUser(email: string, name: string, role: string, password: string, tailorId: string | null) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash, tailorId },
    create: { email, name, role, passwordHash, tailorId },
  });
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@wisestyle.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  await upsertUser(adminEmail, "Admin", "ADMIN", adminPassword, null);
  await upsertUser("manager@wisestyle.local", "Shop Manager", "MANAGER", "ChangeMe123!", null);

  const tailor = await prisma.tailor.upsert({
    where: { tailorNumber: "AP-0001" },
    update: {},
    create: {
      tailorNumber: "AP-0001",
      name: "Demo Tailor",
      phone: "0800000000",
      dateJoined: new Date(),
      rating: 5,
    },
  });
  await upsertUser("tailor@wisestyle.local", "Demo Tailor", "TAILOR", "ChangeMe123!", tailor.id);

  console.log("Seeded accounts (all passwords ChangeMe123! unless overridden by env):");
  console.log(`  Admin:   ${adminEmail}`);
  console.log("  Manager: manager@wisestyle.local");
  console.log("  Tailor:  tailor@wisestyle.local");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
