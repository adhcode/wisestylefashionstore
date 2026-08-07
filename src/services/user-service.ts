import bcrypt from "bcryptjs";
import { userRepository, type UserAccount } from "@/data/user-repository";
import { requireRole } from "./auth-service";
import type { Role } from "@/domain/entities";

export interface CreateUserInput {
  email: string;
  name: string;
  role: Role;
  password: string;
  tailorId: string | null;
}

export const userService = {
  async list(): Promise<UserAccount[]> {
    await requireRole(["ADMIN"]);
    return userRepository.findAll();
  },

  async create(input: CreateUserInput): Promise<UserAccount> {
    await requireRole(["ADMIN"]);
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new Error("A user with that email already exists.");

    const passwordHash = await bcrypt.hash(input.password, 10);
    return userRepository.create({
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash,
      tailorId: input.role === "TAILOR" ? input.tailorId : null,
    });
  },

  async remove(id: string): Promise<void> {
    await requireRole(["ADMIN"]);
    return userRepository.remove(id);
  },
};
