import { tailorRepository } from "@/data/tailor-repository";
import { jobRepository } from "@/data/job-repository";
import { requireRole, requireUser } from "./auth-service";
import { jobDerived, tailorWageInfo } from "@/domain/calculations";
import type { Tailor, TailorInput, TailorWageInfo, WagePayment, WagePaymentInput } from "@/domain/entities";

export interface TailorSummary {
  tailor: Tailor;
  wageInfo: TailorWageInfo;
  jobsAssigned: number;
  jobsCompleted: number;
}

export const tailorService = {
  async list(): Promise<Tailor[]> {
    await requireRole(["ADMIN", "MANAGER"]);
    return tailorRepository.findAll();
  },

  async listWithSummary(): Promise<TailorSummary[]> {
    await requireRole(["ADMIN", "MANAGER"]);
    const [tailorsWithWages, jobs] = await Promise.all([
      tailorRepository.findAllWithWagePayments(),
      jobRepository.findAll(),
    ]);
    return tailorsWithWages.map(({ tailor, wagePayments }) => {
      const theirJobs = jobs.filter((j) => j.tailorId === tailor.id);
      return {
        tailor,
        wageInfo: tailorWageInfo(tailor, jobs, wagePayments),
        jobsAssigned: theirJobs.length,
        jobsCompleted: theirJobs.filter((j) => jobDerived(j).status === "Completed").length,
      };
    });
  },

  async wagePaymentsFor(tailorId: string): Promise<WagePayment[]> {
    await requireRole(["ADMIN", "MANAGER"]);
    return tailorRepository.wagePaymentsFor(tailorId);
  },

  // A tailor's own earned/paid/pending wage summary, for their dashboard.
  async myWageInfo(): Promise<TailorWageInfo | null> {
    const user = await requireUser();
    if (user.role !== "TAILOR" || !user.tailorId) return null;
    const [jobs, wagePayments] = await Promise.all([
      jobRepository.findAll({ tailorId: user.tailorId }),
      tailorRepository.wagePaymentsFor(user.tailorId),
    ]);
    return tailorWageInfo({ id: user.tailorId }, jobs, wagePayments);
  },

  async create(input: TailorInput): Promise<Tailor> {
    await requireRole(["ADMIN", "MANAGER"]);
    return tailorRepository.create(input);
  },

  async update(id: string, input: TailorInput): Promise<Tailor> {
    await requireRole(["ADMIN", "MANAGER"]);
    return tailorRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await requireRole(["ADMIN", "MANAGER"]);
    return tailorRepository.remove(id);
  },

  async addWagePayment(tailorId: string, input: WagePaymentInput): Promise<WagePayment> {
    await requireRole(["ADMIN", "MANAGER"]);
    return tailorRepository.addWagePayment(tailorId, input);
  },

  async removeWagePayment(paymentId: string): Promise<void> {
    await requireRole(["ADMIN", "MANAGER"]);
    return tailorRepository.removeWagePayment(paymentId);
  },
};
