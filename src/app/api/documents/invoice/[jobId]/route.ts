import { requireRole } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { customerService } from "@/services/customer-service";
import { buildInvoiceHTML } from "@/services/document-service";
import { generatePDF } from "@/lib/pdf-generator";
import { withRouteErrors } from "@/lib/api-errors";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  return withRouteErrors(async () => {
    await requireRole(["ADMIN", "MANAGER"]);
    const { jobId } = await params;

    const job = await jobService.getById(jobId);
    if (!job) return new Response("Job not found.", { status: 404 });
    const customer = await customerService.getById(job.customerId);

    const html = buildInvoiceHTML(job, customer);
    const pdf = await generatePDF(html);
    
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${job.jobNumber}.pdf"`,
      },
    });
  });
}
