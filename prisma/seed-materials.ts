import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const INITIAL_MATERIALS = [
  { key: "needle", label: "Needle", unit: "pcs", maxQuantity: 10 },
  { key: "stay", label: "Stay", unit: "pcs", maxQuantity: 10 },
  { key: "buttons", label: "Buttons", unit: "pcs", maxQuantity: 10 },
  {
    key: "monogramFull",
    label: "Monogram (Full Design)",
    unit: "design",
    maxQuantity: 1,
  },
  {
    key: "monogramPartial",
    label: "Monogram (Partial Design)",
    unit: "design",
    maxQuantity: 1,
  },
  { key: "zip", label: "Zip", unit: "pcs", maxQuantity: 10 },
  { key: "thread", label: "Sewing Thread", unit: "pcs", maxQuantity: 10 },
  { key: "underlay", label: "Underlay Cloth", unit: "yards", maxQuantity: 5 },
];

async function main() {
  console.log("Seeding material types...");

  for (const material of INITIAL_MATERIALS) {
    const existing = await prisma.materialType.findUnique({
      where: { key: material.key },
    });

    if (existing) {
      console.log(`✓ Material "${material.label}" already exists, skipping`);
    } else {
      await prisma.materialType.create({
        data: material,
      });
      console.log(`✓ Created material "${material.label}"`);
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log(`Total materials: ${INITIAL_MATERIALS.length}`);
}

main()
  .catch((e) => {
    console.error("Error seeding materials:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
