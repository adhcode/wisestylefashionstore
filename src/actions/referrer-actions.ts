"use server";

import { revalidatePath } from "next/cache";
import { referrerService } from "@/services/referrer-service";
import { referrerSchema } from "@/lib/validation";
import { runAction, firstIssueMessage, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/services/auth-service";
import type { Referrer, ReferrerInput } from "@/domain/entities";

export async function createReferrer(input: unknown): Promise<ActionResult<Referrer>> {
  const parsed = referrerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    await requireRole(["ADMIN", "MANAGER"]);
    const referrer = await referrerService.create(parsed.data);
    revalidatePath("/referrals");
    return referrer;
  });
}

export async function updateReferrer(id: string, input: unknown): Promise<ActionResult<Referrer>> {
  const parsed = referrerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    await requireRole(["ADMIN", "MANAGER"]);
    const referrer = await referrerService.update(id, parsed.data);
    revalidatePath("/referrals");
    return referrer;
  });
}

export async function deleteReferrer(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireRole(["ADMIN", "MANAGER"]);
    await referrerService.delete(id);
    revalidatePath("/referrals");
  });
}
