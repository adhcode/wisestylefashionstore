import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@wisestylefashion.com";
  const password = "admin123";
  const name = "Administrator";
  const role = "ADMIN";

  console.log("🔍 Checking if admin user already exists...");

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`✅ Admin user already exists: ${email}`);
    console.log(`   Name: ${existingUser.name}`);
    console.log(`   Role: ${existingUser.role}`);
    return;
  }

  console.log("🔐 Hashing password...");
  const passwordHash = await bcrypt.hash(password, 10);

  console.log("💾 Creating admin user...");
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   ID: ${user.id}`);
  console.log("\n📝 Login credentials:");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
}

main()
  .catch((e) => {
    console.error("❌ Error creating admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
