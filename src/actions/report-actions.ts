"use server";

import { reportService } from "@/services/report-service";

export async function getOverdueJobsAction() {
  return reportService.overdueJobs();
}
