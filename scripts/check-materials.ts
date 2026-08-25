import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking all materials in database...\n");

  const materials = await prisma.materialType.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${materials.length} materials:\n`);
  materials.forEach((m, i) => {
    console.log(`${i + 1}. ${m.label} (key: ${m.key})`);
    console.log(`   Unit: ${m.unit}, Max: ${m.maxQuantity}`);
    console.log(`   Created: ${m.createdAt.toISOString()}\n`);
  });
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
