import { jobService } from "@/services/job-service";
import { PaymentsPanel } from "@/components/payments/PaymentsPanel";

export default async function PaymentsPage() {
  const jobs = await jobService.list();
  return <PaymentsPanel jobs={jobs} />;
}
