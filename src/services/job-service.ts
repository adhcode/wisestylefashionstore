import { jobRepository } from "@/data/job-repository";
import { ForbiddenError, requireRole, requireUser } from "./auth-service";
import type { Job, JobInput, Payment, PaymentInput } from "@/domain/entities";

export const jobService = {
  async list(): Promise<Job[]> {
    const user = await requireUser();
    if (user.role === "TAILOR") {
      if (!user.tailorId) return [];
      return jobRepository.findAll({ tailorId: user.tailorId });
    }
    return jobRepository.findAll();
  },

  async getById(id: string): Promise<Job | null> {
    const user = await requireUser();
    const job = await jobRepository.findById(id);
    if (!job) return null;
    if (user.role === "TAILOR" && job.tailorId !== user.tailorId) return null;
    return job;
  },

  async create(input: JobInput): Promise<Job> {
    await requireRole(["ADMIN", "MANAGER"]);
    return jobRepository.create(input);
  },

  async update(id: string, input: JobInput): Promise<Job> {
    await requireRole(["ADMIN", "MANAGER"]);
    return jobRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await requireRole(["ADMIN", "MANAGER"]);
    return jobRepository.remove(id);
  },

  // Tailors may update progress only on their own jobs; admin/manager can
  // update any job's progress.
  async updateProgress(id: string, progress: number): Promise<Job> {
    const user = await requireUser();
    const job = await jobRepository.findById(id);
    if (!job) throw new ForbiddenError("Job not found.");
    if (user.role === "TAILOR" && job.tailorId !== user.tailorId) {
      throw new ForbiddenError("You can only update your own jobs.");
    }
    return jobRepository.updateProgress(id, progress);
  },

  async addPayment(jobId: string, input: PaymentInput): Promise<Payment> {
    await requireRole(["ADMIN", "MANAGER"]);
    return jobRepository.addPayment(jobId, input);
  },

  async updateSatisfactionRating(id: string, rating: number): Promise<Job> {
    await requireRole(["ADMIN", "MANAGER"]);
    return jobRepository.updateSatisfactionRating(id, rating);
  },
};
