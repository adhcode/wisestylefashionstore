import { requireRole } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { customerService } from "@/services/customer-service";
import { buildInvoiceHTML } from "@/services/document-service";
import { generatePDF } from "@/lib/pdf-generator";
import { withRouteErrors } from "@/lib/api-errors";

// Configure route for PDF generation
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  return withRouteErrors(async () => {
    console.log('[Invoice] Starting invoice generation');
    
    await requireRole(["ADMIN", "MANAGER"]);
    const { jobId } = await params;
    console.log('[Invoice] Job ID:', jobId);

    const job = await jobService.getById(jobId);
    if (!job) {
      console.error('[Invoice] Job not found:', jobId);
      return new Response("Job not found.", { status: 404 });
    }
    console.log('[Invoice] Job found:', job.jobNumber);
    
    const customer = await customerService.getById(job.customerId);
    console.log('[Invoice] Customer found:', customer?.name);

    console.log('[Invoice] Building HTML...');
    const html = buildInvoiceHTML(job, customer);
    console.log('[Invoice] HTML built, length:', html.length);
    
    console.log('[Invoice] Generating PDF...');
    const pdf = await generatePDF(html);
    console.log('[Invoice] PDF generated successfully, size:', pdf.length);
    
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${job.jobNumber}.pdf"`,
      },
    });
  });
}
