import { prisma } from "@/data/prisma";
import type { MaterialType, MaterialTypeInput } from "@/domain/entities";

/**
 * Generates a unique key from a label by converting to lowercase,
 * replacing spaces with underscores, and removing special characters.
 */
export function generateMaterialKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/**
 * Validates material type input data.
 * Throws an error if validation fails.
 */
function validateMaterialInput(input: MaterialTypeInput): void {
  const { label, unit, maxQuantity } = input;

  // Validate label
  if (!label || label.trim().length === 0) {
    throw new Error("Material label is required");
  }

  // Validate unit
  if (!unit || unit.trim().length === 0) {
    throw new Error("Unit is required");
  }

  if (unit.length > 20) {
    throw new Error("Unit must be 1-20 characters");
  }

  // Validate maxQuantity
  if (maxQuantity < 1) {
    throw new Error("Maximum quantity must be at least 1");
  }

  if (maxQuantity > 100) {
    throw new Error("Maximum quantity cannot exceed 100");
  }
}

/**
 * Converts Prisma Date objects to ISO strings for domain layer.
 */
function toDomainMaterial(prismaRecord: any): MaterialType {
  return {
    id: prismaRecord.id,
    key: prismaRecord.key,
    label: prismaRecord.label,
    unit: prismaRecord.unit,
    maxQuantity: prismaRecord.maxQuantity,
    createdAt: prismaRecord.createdAt.toISOString(),
    updatedAt: prismaRecord.updatedAt.toISOString(),
  };
}

/**
 * Fetches all material types ordered by label.
 */
export async function getMaterialTypes(): Promise<MaterialType[]> {
  const materials = await prisma.materialType.findMany({
    orderBy: { label: "asc" },
  });

  return materials.map(toDomainMaterial);
}

/**
 * Fetches a single material type by ID.
 */
export async function getMaterialType(
  id: string
): Promise<MaterialType | null> {
  const material = await prisma.materialType.findUnique({
    where: { id },
  });

  return material ? toDomainMaterial(material) : null;
}

/**
 * Creates a new material type with validation.
 */
export async function createMaterialType(
  input: MaterialTypeInput
): Promise<MaterialType> {
  // Validate input
  validateMaterialInput(input);

  // Trim values
  const trimmedLabel = input.label.trim();
  const trimmedUnit = input.unit.trim();

  // Generate key
  const key = generateMaterialKey(trimmedLabel);

  // Check for duplicate label or key
  const existing = await prisma.materialType.findFirst({
    where: {
      OR: [{ label: trimmedLabel }, { key }],
    },
  });

  if (existing) {
    throw new Error("A material with this label already exists");
  }

  // Create material
  const material = await prisma.materialType.create({
    data: {
      key,
      label: trimmedLabel,
      unit: trimmedUnit,
      maxQuantity: input.maxQuantity,
    },
  });

  return toDomainMaterial(material);
}

/**
 * Updates an existing material type.
 */
export async function updateMaterialType(
  id: string,
  input: MaterialTypeInput
): Promise<MaterialType> {
  // Validate input
  validateMaterialInput(input);

  // Trim values
  const trimmedLabel = input.label.trim();
  const trimmedUnit = input.unit.trim();

  // Generate new key
  const key = generateMaterialKey(trimmedLabel);

  // Check for duplicate label or key (excluding current record)
  const existing = await prisma.materialType.findFirst({
    where: {
      AND: [
        { id: { not: id } },
        {
          OR: [{ label: trimmedLabel }, { key }],
        },
      ],
    },
  });

  if (existing) {
    throw new Error("A material with this label already exists");
  }

  // Update material
  const material = await prisma.materialType.update({
    where: { id },
    data: {
      key,
      label: trimmedLabel,
      unit: trimmedUnit,
      maxQuantity: input.maxQuantity,
    },
  });

  return toDomainMaterial(material);
}

/**
 * Counts how many jobs reference a specific material key in their materials JSON.
 */
export async function countJobsWithMaterial(
  materialKey: string
): Promise<number> {
  // Query jobs where materials JSON contains the material key
  const jobs = await prisma.job.findMany({
    where: {
      materials: {
        contains: `"${materialKey}"`,
      },
    },
  });

  return jobs.length;
}

/**
 * Deletes a material type and returns counts of affected records.
 */
export async function deleteMaterialType(
  id: string
): Promise<{ deletedCount: number; jobsAffected: number }> {
  // Get the material to find its key
  const material = await prisma.materialType.findUnique({
    where: { id },
  });

  if (!material) {
    throw new Error("Material type not found");
  }

  // Count affected jobs
  const jobsAffected = await countJobsWithMaterial(material.key);

  // Delete the material
  await prisma.materialType.delete({
    where: { id },
  });

  return {
    deletedCount: 1,
    jobsAffected,
  };
}
