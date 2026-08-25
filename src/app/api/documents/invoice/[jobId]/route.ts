import { requireRole } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { customerService } from "@/services/customer-service";
import { buildInvoiceHTML } from "@/services/document-service";
import { withRouteErrors } from "@/lib/api-errors";
import puppeteer from "puppeteer";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  return withRouteErrors(async () => {
    await requireRole(["ADMIN", "MANAGER"]);
    const { jobId } = await params;

    const job = await jobService.getById(jobId);
    if (!job) return new Response("Job not found.", { status: 404 });
    const customer = await customerService.getById(job.customerId);

    const html = buildInvoiceHTML(job, customer);
    
    // Launch Puppeteer to convert HTML to PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });
    
    await browser.close();
    
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${job.jobNumber}.pdf"`,
      },
    });
  });
}
