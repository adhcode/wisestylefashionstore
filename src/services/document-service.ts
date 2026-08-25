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
  const d = jobDerived(job);
  const style = styleLabelOf(job);
  const issueDate = new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
  const isRefund = entry.type === "refund";
  const receiptNo = `${isRefund ? "REF-" : "RCT-"}${job.jobNumber}-${String(entry.id).slice(-4).toUpperCase()}`;
  const hasBalance = entry.outstandingAfter > 0;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${isRefund ? "Refund-" : "Receipt-"}${receiptNo}</title><style>${documentStylesBlock()}
    .amount-box { background:#F0FAF4; border:2px solid #10B981; border-radius:8px; padding:20px; margin:20px 0; text-align:center; }
    .amount-box.refund { background:#FEF2F2; border-color:#EF4444; }
    .amount-label { font-size:12px; text-transform:uppercase; letter-spacing:0.05em; color:#6B6470; margin-bottom:8px; }
    .amount-value { font-size:32px; font-weight:bold; color:#10B981; }
    .amount-value.refund { color:#EF4444; }
    .balance-alert { background:#FEF2F2; border:2px solid #EF4444; border-radius:8px; padding:16px; margin:20px 0; }
    .balance-alert-title { font-size:14px; font-weight:bold; color:#DC2626; margin-bottom:8px; display:flex; align-items:center; gap:8px; }
    .balance-alert-amount { font-size:24px; font-weight:bold; color:#DC2626; margin-top:4px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:20px 0; }
    .info-card { background:#F7F2E8; border-radius:6px; padding:12px; }
    .info-label { font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#6B6470; margin-bottom:4px; }
    .info-value { font-size:14px; font-weight:600; color:#2E1A38; }
  </style></head><body>
    <div class="sheet">
      <!-- Header -->
      <div class="header">
        <div>
          <div class="tag">${isRefund ? "🔴 Refund Receipt" : "✅ Payment Receipt"}</div>
          <div class="brand">WiseStyle Fashion House</div>
          <div style="font-size:12px;color:#6B6470;">Wisebuy Nigeria Limited</div>
        </div>
        <div class="meta">
          <div><strong>${isRefund ? "Refund #:" : "Receipt #:"}</strong> ${receiptNo}</div>
          <div><strong>Date:</strong> ${entry.date || issueDate}</div>
          <div><strong>Job #:</strong> ${job.jobNumber}</div>
        </div>
      </div>

      <!-- Amount Paid/Refunded -->
      <div class="amount-box${isRefund ? " refund" : ""}">
        <div class="amount-label">${isRefund ? "Amount Refunded" : "Amount Received"}</div>
        <div class="amount-value${isRefund ? " refund" : ""}">${isRefund ? "-" : ""}${formatCurrency(entry.amount)}</div>
      </div>

      <!-- Customer Info -->
      <div class="section-title">${isRefund ? "Refunded To" : "Received From"}</div>
      <div style="font-size:15px; margin-bottom:20px;">
        <div style="font-weight:bold; margin-bottom:4px;">${customer ? customer.name : job.customerName}</div>
        ${customer?.phone ? `<div style="color:#6B6470; font-size:13px;">${customer.phone}</div>` : ""}
        ${customer?.email ? `<div style="color:#6B6470; font-size:13px;">${customer.email}</div>` : ""}
      </div>

      <!-- Transaction Details -->
      <div class="section-title">Transaction Details</div>
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Job Style</div>
          <div class="info-value">${style}</div>
        </div>
        ${!isRefund ? `
        <div class="info-card">
          <div class="info-label">Payment Method</div>
          <div class="info-value">${entry.method ?? "—"}</div>
        </div>` : ""}
        ${entry.note ? `
        <div class="info-card" style="grid-column:1/-1;">
          <div class="info-label">${isRefund ? "Refund Reason" : "Note"}</div>
          <div class="info-value">${entry.note}</div>
        </div>` : ""}
      </div>

      <!-- Payment Summary -->
      <div class="section-title">Payment Summary</div>
      <table class="totals">
        <tr><td class="label">Contract Price</td><td class="value">${formatCurrency(d.contractPrice)}</td></tr>
        <tr><td class="label">Deposit Paid</td><td class="value">${formatCurrency(d.deposit)}</td></tr>
        <tr><td class="label">Total Paid to Date</td><td class="value">${formatCurrency(entry.runningTotal)}</td></tr>
        <tr class="grand"><td class="label">Outstanding Balance</td><td class="value">${formatCurrency(entry.outstandingAfter)}</td></tr>
      </table>

      ${hasBalance ? `
      <!-- Balance Alert -->
      <div class="balance-alert">
        <div class="balance-alert-title">
          <span>⚠️</span>
          <span>Outstanding Balance Remaining</span>
        </div>
        <div style="font-size:13px; color:#991B1B; margin-bottom:8px;">
          Customer still needs to pay the remaining balance:
        </div>
        <div class="balance-alert-amount">${formatCurrency(entry.outstandingAfter)}</div>
        <div style="font-size:12px; color:#991B1B; margin-top:8px; font-style:italic;">
          Please settle this amount before job completion.
        </div>
      </div>` : `
      <!-- Fully Paid Notice -->
      <div style="background:#F0FAF4; border:2px solid #10B981; border-radius:8px; padding:16px; margin:20px 0; text-align:center;">
        <div style="font-size:18px; font-weight:bold; color:#059669; margin-bottom:4px;">✓ Fully Paid</div>
        <div style="font-size:13px; color:#047857;">This job has been paid in full. No outstanding balance.</div>
      </div>`}

      <!-- Bank Details -->
      ${hasBalance ? `
      <div class="bank-box">
        <div style="font-weight:bold;margin-bottom:4px;">Make Payment To:</div>
        <div>Bank: ${BANK_DETAILS.bank}</div>
        <div>Account Name: ${BANK_DETAILS.accountName}</div>
        <div>Account Number: ${BANK_DETAILS.accountNumber}</div>
      </div>` : ""}

      <!-- Footer -->
      <div class="footer">
        ${isRefund 
          ? "This confirms the above refund has been processed." 
          : hasBalance 
            ? "Thank you for your payment. Please settle the remaining balance at your earliest convenience."
            : "Thank you for your payment. We appreciate your business!"}
      </div>
    </div>
  </body></html>`;
}

export { buildPaymentEntries };
