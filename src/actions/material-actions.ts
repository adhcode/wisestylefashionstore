"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { MaterialType, MaterialTypeInput } from "@/domain/entities";
import {
  createMaterialType as createMaterial,
  updateMaterialType as updateMaterial,
  deleteMaterialType as deleteMaterial,
  countJobsWithMaterial as countJobs,
} from "@/services/material-service";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to create a new material type (admin only).
 */
export async function createMaterialType(
  input: MaterialTypeInput
): Promise<ActionResult<MaterialType>> {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return {
        success: false,
        error: "Access denied. Admin or Manager only.",
      };
    }

    // Create material
    const material = await createMaterial(input);

    // Revalidate paths
    revalidatePath("/materials");
    revalidatePath("/jobs");

    return {
      success: true,
      data: material,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create material type",
    };
  }
}

/**
 * Server action to update an existing material type (admin only).
 */
export async function updateMaterialType(
  id: string,
  input: MaterialTypeInput
): Promise<ActionResult<MaterialType>> {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return {
        success: false,
        error: "Access denied. Admin or Manager only.",
      };
    }

    // Update material
    const material = await updateMaterial(id, input);

    // Revalidate paths
    revalidatePath("/materials");
    revalidatePath("/jobs");

    return {
      success: true,
      data: material,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update material type",
    };
  }
}

/**
 * Server action to delete a material type (admin only).
 */
export async function deleteMaterialType(
  id: string
): Promise<ActionResult<{ jobsAffected: number }>> {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return {
        success: false,
        error: "Access denied. Admin or Manager only.",
      };
    }

    // Delete material
    const result = await deleteMaterial(id);

    // Revalidate paths
    revalidatePath("/materials");
    revalidatePath("/jobs");

    return {
      success: true,
      data: { jobsAffected: result.jobsAffected },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete material type",
    };
  }
}

/**
 * Server action to count jobs using a material (admin only).
 */
export async function countJobsWithMaterial(
  materialKey: string
): Promise<ActionResult<number>> {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Access denied. Admin only.",
      };
    }

    // Count jobs
    const count = await countJobs(materialKey);

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to count jobs",
    };
  }
}
