import { requireRole } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { customerService } from "@/services/customer-service";
import { buildPaymentEntries } from "@/domain/calculations";
import { buildReceiptHTML } from "@/services/document-service";
import { withRouteErrors } from "@/lib/api-errors";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string; entryId: string }> }) {
  return withRouteErrors(async () => {
    await requireRole(["ADMIN", "MANAGER"]);
    const { jobId, entryId } = await params;

    const job = await jobService.getById(jobId);
    if (!job) return new Response("Job not found.", { status: 404 });
    const customer = await customerService.getById(job.customerId);

    const entries = buildPaymentEntries(job);
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return new Response("Payment not found.", { status: 404 });

    const html = buildReceiptHTML(job, customer, entry);
    const prefix = entry.type === "refund" ? "Refund" : "Receipt";
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${prefix}-${job.jobNumber}-${entryId}.html"`,
      },
    });
  });
}
