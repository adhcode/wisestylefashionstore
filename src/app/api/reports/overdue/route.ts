import { reportService } from "@/services/report-service";
import { buildWorkbookBuffer, xlsxResponse } from "@/lib/xlsx-report";
import { withRouteErrors } from "@/lib/api-errors";

export async function GET() {
  return withRouteErrors(async () => {
    const { summaryRows, rows } = await reportService.overdueReportRows();
    const buffer = buildWorkbookBuffer([
      { name: "Summary", rows: summaryRows },
      { name: "Overdue Jobs", rows },
    ]);
    const dateTag = new Date().toISOString().slice(0, 10);
    return xlsxResponse(buffer, `WiseStyle-Overdue-Jobs-${dateTag}.xlsx`);
  });
}
