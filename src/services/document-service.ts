import { BANK_DETAILS, MATERIALS_DEF } from "@/domain/constants";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import { jobDerived, buildPaymentEntries } from "@/domain/calculations";
import type { Customer, Job, PaymentLedgerEntry } from "@/domain/entities";

function documentStylesBlock(): string {
  return `
    body { font-family: Georgia, 'Times New Roman', serif; color:#241B2E; margin:0; padding:32px; background:#FAF7F1; }
    .sheet { max-width:720px; margin:0 auto; background:#fff; padding:36px; border-radius:8px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #C9973E; padding-bottom:16px; margin-bottom:22px; }
    .brand { font-size:22px; font-weight:bold; color:#2E1A38; }
    .tag { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#C9973E; font-weight:bold; }
    .meta { text-align:right; font-size:12px; color:#6B6470; line-height:1.6; }
    table { width:100%; border-collapse:collapse; margin-top:10px; }
    th, td { text-align:left; padding:7px 6px; font-size:13px; border-bottom:1px solid #E7E1D8; }
    th { color:#6B6470; text-transform:uppercase; font-size:10.5px; letter-spacing:0.05em; }
    .totals td { border:none; padding:4px 6px; font-size:13px; }
    .totals .label { color:#6B6470; }
    .totals .value { text-align:right; font-weight:600; }
    .grand td { border-top:2px solid #2E1A38; font-size:15px; font-weight:bold; color:#2E1A38; padding-top:8px; }
    .section-title { font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:#6B6470; margin:18px 0 4px; font-weight:bold; }
    .bank-box { background:#F7F2E8; border-radius:8px; padding:14px 16px; margin-top:18px; font-size:13px; line-height:1.6; }
    .footer { margin-top:26px; font-size:11px; color:#9C9591; text-align:center; }
    @media print { body { background:#fff; padding:0; } }
  `;
}

export function buildInvoiceHTML(job: Job, customer: Customer | null): string {
  const d = jobDerived(job);
  const style = styleLabelOf(job);
  const issueDate = new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
  const materials = MATERIALS_DEF.filter((md) => job.materials[md.key]?.included);
  const matRows = materials
    .map((md) => {
      const m = job.materials[md.key];
      return `<tr><td>${md.label}</td><td>${m.qty} ${md.unit}</td><td>${formatCurrency(m.cost)}</td><td>${formatCurrency(m.qty * m.cost)}</td></tr>`;
    })
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice-${job.jobNumber}</title><style>${documentStylesBlock()}</style></head><body>
    <div class="sheet">
      <div class="header">
        <div><div class="tag">Invoice</div><div class="brand">WiseStyle Fashion House</div><div style="font-size:12px;color:#6B6470;">Wisebuy Nigeria Limited</div></div>
        <div class="meta"><div><strong>Invoice #:</strong> INV-${job.jobNumber}</div><div><strong>Date:</strong> ${issueDate}</div><div><strong>Job #:</strong> ${job.jobNumber}</div></div>
      </div>
      <div class="section-title">Bill To</div>
      <div style="font-size:14px;"><div><strong>${customer ? customer.name : job.customerName}</strong></div>
      <div>${customer?.phone ?? ""}</div>
      <div>${customer?.address || customer?.city || ""}</div></div>
      <div class="section-title">Contract Information</div>
      <table><tr><th>Style</th><th>Date Received</th><th>Contract Duration</th><th>Contract Price</th></tr>
      <tr><td>${style}</td><td>${job.dateReceived ?? "—"}</td><td>${job.startDate ?? "—"} to ${job.completionDate ?? "—"}</td><td>${formatCurrency(d.contractPrice)}</td></tr></table>
      ${materials.length ? `<div class="section-title">Scope of Work — Materials Needed</div><table><tr><th>Material</th><th>Quantity</th><th>Unit Cost</th><th>Subtotal</th></tr>${matRows}</table>` : ""}
      <div class="section-title">Payment Summary</div>
      <table class="totals">
        <tr><td class="label">Material Budget</td><td class="value">${formatCurrency(d.materialBudget)}</td></tr>
        <tr><td class="label">Workmanship Fee</td><td class="value">${formatCurrency(d.balanceAfterMaterial)}</td></tr>
        <tr><td class="label">Contract Price</td><td class="value">${formatCurrency(d.contractPrice)}</td></tr>
        <tr><td class="label">Amount Paid</td><td class="value">${formatCurrency(d.totalPaid)}</td></tr>
        <tr class="grand"><td class="label">Balance Due</td><td class="value">${formatCurrency(d.outstanding)}</td></tr>
      </table>
      <div class="bank-box"><div style="font-weight:bold;margin-bottom:4px;">Payment Details</div>
      <div>Bank: ${BANK_DETAILS.bank}</div><div>Account Name: ${BANK_DETAILS.accountName}</div><div>Account Number: ${BANK_DETAILS.accountNumber}</div></div>
      <div class="footer">Thank you for choosing WiseStyle Fashion House.</div>
    </div></body></html>`;
}

export function buildReceiptHTML(job: Job, customer: Customer | null, entry: PaymentLedgerEntry): string {
  const style = styleLabelOf(job);
  const issueDate = new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
  const isRefund = entry.type === "refund";
  const receiptNo = `${isRefund ? "REF-" : "RCT-"}${job.jobNumber}-${String(entry.id).slice(-4).toUpperCase()}`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${isRefund ? "Refund-" : "Receipt-"}${receiptNo}</title><style>${documentStylesBlock()}</style></head><body>
    <div class="sheet">
      <div class="header">
        <div><div class="tag">${isRefund ? "Refund Receipt" : "Payment Receipt"}</div><div class="brand">WiseStyle Fashion House</div><div style="font-size:12px;color:#6B6470;">Wisebuy Nigeria Limited</div></div>
        <div class="meta"><div><strong>${isRefund ? "Refund #:" : "Receipt #:"}</strong> ${receiptNo}</div><div><strong>Date:</strong> ${entry.date || issueDate}</div><div><strong>Job #:</strong> ${job.jobNumber}</div></div>
      </div>
      <div class="section-title">${isRefund ? "Refunded To" : "Received From"}</div>
      <div style="font-size:14px;"><strong>${customer ? customer.name : job.customerName}</strong></div>
      <div class="section-title">${isRefund ? "Refund Details" : "Payment Details"}</div>
      <table class="totals">
        <tr><td class="label">For</td><td class="value">${style} (Job ${job.jobNumber})</td></tr>
        ${!isRefund ? `<tr><td class="label">Payment Method</td><td class="value">${entry.method ?? "—"}</td></tr>` : ""}
        ${entry.note ? `<tr><td class="label">${isRefund ? "Reason" : "Note"}</td><td class="value">${entry.note}</td></tr>` : ""}
        <tr class="grand"><td class="label">${isRefund ? "Amount Refunded" : "Amount Received"}</td><td class="value">${formatCurrency(entry.amount)}</td></tr>
      </table>
      <div class="section-title">Running Balance</div>
      <table class="totals">
        <tr><td class="label">Contract Price</td><td class="value">${formatCurrency(job.contractPrice)}</td></tr>
        <tr><td class="label">Total Paid to Date</td><td class="value">${formatCurrency(entry.runningTotal)}</td></tr>
        <tr class="grand"><td class="label">Balance Remaining</td><td class="value">${formatCurrency(entry.outstandingAfter)}</td></tr>
      </table>
      <div class="bank-box"><div style="font-weight:bold;margin-bottom:4px;">Our Payment Details</div>
      <div>Bank: ${BANK_DETAILS.bank}</div><div>Account Name: ${BANK_DETAILS.accountName}</div><div>Account Number: ${BANK_DETAILS.accountNumber}</div></div>
      <div class="footer">${isRefund ? "This confirms the above refund has been processed." : "Thank you for your payment."}</div>
    </div></body></html>`;
}

export { buildPaymentEntries };
