"use server";

import { revalidatePath } from "next/cache";
import { userService } from "@/services/user-service";
import { userCreateSchema } from "@/lib/validation";
import { runAction, firstIssueMessage, type ActionResult } from "@/lib/action-result";
import type { UserAccount } from "@/data/user-repository";

export async function createUserAccount(input: unknown): Promise<ActionResult<UserAccount>> {
  const parsed = userCreateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  return runAction(async () => {
    const user = await userService.create(parsed.data);
    revalidatePath("/admin/users");
    return user;
  });
}

export async function deleteUserAccount(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await userService.remove(id);
    revalidatePath("/admin/users");
  });
}
