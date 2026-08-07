import { customerService } from "@/services/customer-service";
import { jobService } from "@/services/job-service";
import { CustomersGrid } from "@/components/customers/CustomersGrid";

export default async function CustomersPage() {
  const [customers, jobs] = await Promise.all([customerService.list(), jobService.list()]);
  return <CustomersGrid customers={customers} jobs={jobs} />;
}
