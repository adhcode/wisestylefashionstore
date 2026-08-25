import { getCurrentUser } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { customerService } from "@/services/customer-service";
import { tailorService } from "@/services/tailor-service";
import { getMaterialTypes } from "@/services/material-service";
import { JobsTable } from "@/components/jobs/JobsTable";

export default async function JobsPage() {
  const user = await getCurrentUser();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";

  const [jobs, customers, tailors, materialTypes] = await Promise.all([
    jobService.list(),
    canManage ? customerService.list() : Promise.resolve([]),
    canManage ? tailorService.list() : Promise.resolve([]),
    getMaterialTypes(),
  ]);

  return <JobsTable jobs={jobs} customers={customers} tailors={tailors} materialTypes={materialTypes} canManage={canManage} isAdmin={isAdmin} />;
}
