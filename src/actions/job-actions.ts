"use server";

import { revalidatePath } from "next/cache";
import { jobService } from "@/services/job-service";
import { jobSchema, paymentSchema } from "@/lib/validation";
import { runAction, firstIssueMessage, type ActionResult } from "@/lib/action-result";
import type { Job, Payment } from "@/domain/entities";

export async function createJob(input: unknown): Promise<ActionResult<Job>> {
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const job = await jobService.create(parsed.data);
    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    return job;
  });
}

export async function updateJob(id: string, input: unknown): Promise<ActionResult<Job>> {
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const job = await jobService.update(id, parsed.data);
    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    return job;
  });
}

export async function deleteJob(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await jobService.remove(id);
    revalidatePath("/jobs");
    revalidatePath("/dashboard");
  });
}

export async function updateJobProgress(id: string, progress: number): Promise<ActionResult<Job>> {
  return runAction(async () => {
    const job = await jobService.updateProgress(id, progress);
    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    return job;
  });
}

export async function addJobPayment(jobId: string, input: unknown): Promise<ActionResult<Payment>> {
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const payment = await jobService.addPayment(jobId, parsed.data);
    revalidatePath("/jobs");
    revalidatePath("/payments");
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return payment;
  });
}
