import { referrerRepository } from "@/data/referrer-repository";
import type { Referrer, ReferrerInput } from "@/domain/entities";

export interface ReferrerSummary {
  referrer: Referrer;
  customersReferred: number;
  totalJobValue: number;
}

export const referrerService = {
  async list(): Promise<Referrer[]> {
    return referrerRepository.list();
  },

  async listWithStats(): Promise<ReferrerSummary[]> {
    const referrers = await referrerRepository.list();

    const summaries = await Promise.all(
      referrers.map(async (referrer) => {
        const [customersReferred, totalJobValue] = await Promise.all([
          referrerRepository.getCustomerCount(referrer.id),
          referrerRepository.getTotalJobValue(referrer.id),
        ]);

        return {
          referrer,
          customersReferred,
          totalJobValue,
        };
      })
    );

    return summaries;
  },

  async getById(id: string): Promise<Referrer | null> {
    return referrerRepository.getById(id);
  },

  async create(input: ReferrerInput): Promise<Referrer> {
    return referrerRepository.create(input);
  },

  async update(id: string, input: Partial<ReferrerInput>): Promise<Referrer> {
    return referrerRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    return referrerRepository.delete(id);
  },

  async getCustomers(referrerId: string) {
    return referrerRepository.getCustomers(referrerId);
  },

  async getStats(referrerId: string) {
    const [customersReferred, totalJobValue] = await Promise.all([
      referrerRepository.getCustomerCount(referrerId),
      referrerRepository.getTotalJobValue(referrerId),
    ]);

    return {
      customersReferred,
      totalJobValue,
    };
  },
};
