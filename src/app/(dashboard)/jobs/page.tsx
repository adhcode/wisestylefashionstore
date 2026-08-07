import { getCurrentUser } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { customerService } from "@/services/customer-service";
import { tailorService } from "@/services/tailor-service";
import { JobsTable } from "@/components/jobs/JobsTable";

export default async function JobsPage() {
  const user = await getCurrentUser();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [jobs, customers, tailors] = await Promise.all([
    jobService.list(),
    canManage ? customerService.list() : Promise.resolve([]),
    canManage ? tailorService.list() : Promise.resolve([]),
  ]);

  return <JobsTable jobs={jobs} customers={customers} tailors={tailors} canManage={canManage} />;
}
