import { getCurrentUser } from "@/services/auth-service";
import { reportService } from "@/services/report-service";
import { tailorService } from "@/services/tailor-service";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { DocumentsPanel } from "@/components/dashboard/DocumentsPanel";
import { TailorDashboardView } from "@/components/dashboard/TailorDashboardView";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (user?.role === "TAILOR") {
    const [dashboard, wageInfo] = await Promise.all([
      reportService.tailorDashboard(),
      tailorService.myWageInfo(),
    ]);
    return <TailorDashboardView dashboard={dashboard} wageInfo={wageInfo} />;
  }

  const metrics = await reportService.dashboardMetrics();
  return (
    <>
      <DashboardView metrics={metrics} />
      <DocumentsPanel />
    </>
  );
}
