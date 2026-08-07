import { customerRepository } from "@/data/customer-repository";
import { requireRole } from "./auth-service";
import type { Customer, CustomerInput } from "@/domain/entities";

export const customerService = {
  async list(): Promise<Customer[]> {
    await requireRole(["ADMIN", "MANAGER"]);
    return customerRepository.findAll();
  },

  async getById(id: string): Promise<Customer | null> {
    await requireRole(["ADMIN", "MANAGER"]);
    return customerRepository.findById(id);
  },

  async create(input: CustomerInput): Promise<Customer> {
    await requireRole(["ADMIN", "MANAGER"]);
    return customerRepository.create(input);
  },

  async update(id: string, input: CustomerInput): Promise<Customer> {
    await requireRole(["ADMIN", "MANAGER"]);
    return customerRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await requireRole(["ADMIN", "MANAGER"]);
    return customerRepository.remove(id);
  },
};
