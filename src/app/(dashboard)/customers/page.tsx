import { customerService } from "@/services/customer-service";
import { jobService } from "@/services/job-service";
import { referrerService } from "@/services/referrer-service";
import { CustomersGrid } from "@/components/customers/CustomersGrid";

export default async function CustomersPage() {
  const [customers, jobs, referrers] = await Promise.all([
    customerService.list(), 
    jobService.list(),
    referrerService.list(),
  ]);
  return <CustomersGrid customers={customers} jobs={jobs} referrers={referrers} />;
}
