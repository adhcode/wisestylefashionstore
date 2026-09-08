import { redirect } from "next/navigation";
import { requireRole } from "@/services/auth-service";
import { customerService } from "@/services/customer-service";
import { jobService } from "@/services/job-service";
import { CustomerDetailView } from "@/components/customers/CustomerDetailView";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "MANAGER"]);
  const { id } = await params;

  const customer = await customerService.getById(id);
  if (!customer) redirect("/customers");

  // Get all jobs for this customer
  const allJobs = await jobService.list();
  const customerJobs = allJobs.filter((job) => job.customerId === id);

  return <CustomerDetailView customer={customer} jobs={customerJobs} />;
}
