"use server";

import { revalidatePath } from "next/cache";
import { customerService } from "@/services/customer-service";
import { customerSchema } from "@/lib/validation";
import { runAction, firstIssueMessage, type ActionResult } from "@/lib/action-result";
import type { Customer } from "@/domain/entities";

export async function createCustomer(input: unknown): Promise<ActionResult<Customer>> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const customer = await customerService.create(parsed.data);
    revalidatePath("/customers");
    return customer;
  });
}

export async function updateCustomer(id: string, input: unknown): Promise<ActionResult<Customer>> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const customer = await customerService.update(id, parsed.data);
    revalidatePath("/customers");
    return customer;
  });
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await customerService.remove(id);
    revalidatePath("/customers");
  });
}
