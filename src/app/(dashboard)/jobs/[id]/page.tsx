import { notFound } from "next/navigation";
import { getCurrentUser } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { customerService } from "@/services/customer-service";
import { tailorService } from "@/services/tailor-service";
import { getMaterialTypes } from "@/services/material-service";
import { buildPaymentEntries } from "@/domain/calculations";
import { JobDetailView } from "@/components/jobs/JobDetailView";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";
  const canSeeFinancials = user?.role !== "TAILOR";

  const [job, customers, tailors, materialTypes] = await Promise.all([
    jobService.getById(id),
    canManage ? customerService.list() : Promise.resolve([]),
    canManage ? tailorService.list() : Promise.resolve([]),
    getMaterialTypes(),
  ]);
  
  if (!job) notFound();

  const payments = canSeeFinancials ? buildPaymentEntries(job) : [];

  return (
    <JobDetailView
      job={job}
      customers={customers}
      tailors={tailors}
      materialTypes={materialTypes}
      payments={payments}
      canManage={canManage}
      isAdmin={isAdmin}
      canSeeFinancials={canSeeFinancials}
    />
  );
}
