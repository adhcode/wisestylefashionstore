"use server";

import { revalidatePath } from "next/cache";
import { tailorService } from "@/services/tailor-service";
import { tailorSchema, wagePaymentSchema } from "@/lib/validation";
import { runAction, firstIssueMessage, type ActionResult } from "@/lib/action-result";
import type { Tailor, WagePayment } from "@/domain/entities";

export async function createTailor(input: unknown): Promise<ActionResult<Tailor>> {
  const parsed = tailorSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const tailor = await tailorService.create(parsed.data);
    revalidatePath("/tailors");
    return tailor;
  });
}

export async function updateTailor(id: string, input: unknown): Promise<ActionResult<Tailor>> {
  const parsed = tailorSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const tailor = await tailorService.update(id, parsed.data);
    revalidatePath("/tailors");
    return tailor;
  });
}

export async function deleteTailor(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await tailorService.remove(id);
    revalidatePath("/tailors");
  });
}

export async function addWagePayment(tailorId: string, input: unknown): Promise<ActionResult<WagePayment>> {
  const parsed = wagePaymentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const payment = await tailorService.addWagePayment(tailorId, parsed.data);
    revalidatePath("/tailors");
    return payment;
  });
}

export async function deleteWagePayment(paymentId: string): Promise<ActionResult> {
  return runAction(async () => {
    await tailorService.removeWagePayment(paymentId);
    revalidatePath("/tailors");
  });
}

export async function getWagePayments(tailorId: string): Promise<WagePayment[]> {
  return tailorService.wagePaymentsFor(tailorId);
}
