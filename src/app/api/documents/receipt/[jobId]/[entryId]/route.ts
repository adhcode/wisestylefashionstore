import { requireRole } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { customerService } from "@/services/customer-service";
import { buildPaymentEntries } from "@/domain/calculations";
import { buildReceiptHTML } from "@/services/document-service";
import { generatePDF } from "@/lib/pdf-generator";
import { withRouteErrors } from "@/lib/api-errors";

// Configure route for PDF generation
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string; entryId: string }> }) {
  return withRouteErrors(async () => {
    console.log('[Receipt] Starting receipt generation');
    
    await requireRole(["ADMIN", "MANAGER"]);
    const { jobId, entryId } = await params;
    console.log('[Receipt] Job ID:', jobId, 'Entry ID:', entryId);

    const job = await jobService.getById(jobId);
    if (!job) {
      console.error('[Receipt] Job not found:', jobId);
      return new Response("Job not found.", { status: 404 });
    }
    console.log('[Receipt] Job found:', job.jobNumber);
    
    const customer = await customerService.getById(job.customerId);
    console.log('[Receipt] Customer found:', customer?.name);

    const entries = buildPaymentEntries(job);
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) {
      console.error('[Receipt] Payment not found:', entryId);
      return new Response("Payment not found.", { status: 404 });
    }
    console.log('[Receipt] Payment entry found, type:', entry.type);

    console.log('[Receipt] Building HTML...');
    const html = buildReceiptHTML(job, customer, entry);
    console.log('[Receipt] HTML built, length:', html.length);
    
    const prefix = entry.type === "refund" ? "Refund" : "Receipt";
    
    console.log('[Receipt] Generating PDF...');
    const pdf = await generatePDF(html);
    console.log('[Receipt] PDF generated successfully, size:', pdf.length);
    
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${prefix}-${job.jobNumber}-${entryId}.pdf"`,
      },
    });
  });
}
