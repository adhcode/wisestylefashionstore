import type { NextRequest } from "next/server";
import { reportService } from "@/services/report-service";
import { buildWorkbookBuffer, xlsxResponse } from "@/lib/xlsx-report";
import { withRouteErrors } from "@/lib/api-errors";

export async function GET(request: NextRequest) {
  return withRouteErrors(async () => {
    const params = request.nextUrl.searchParams;
    const style = params.get("style") ?? undefined;
    const customerType = params.get("customerType");
    const minProfitRaw = params.get("minProfit");

    const { summaryRows, jobRows, customerRows, tailorRows } = await reportService.excelReportRows({
      style,
      customerType: customerType === "New" || customerType === "Repeat" ? customerType : undefined,
      minProfit: minProfitRaw ? Number(minProfitRaw) : undefined,
    });

    const buffer = buildWorkbookBuffer([
      { name: "Summary", rows: summaryRows },
      { name: "Jobs", rows: jobRows },
      { name: "Customers", rows: customerRows },
      { name: "Tailors", rows: tailorRows },
    ]);

    const dateTag = new Date().toISOString().slice(0, 10);
    return xlsxResponse(buffer, `WiseStyle-Report-${dateTag}.xlsx`);
  });
}
