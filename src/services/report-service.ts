import { jobRepository } from "@/data/job-repository";
import { customerRepository } from "@/data/customer-repository";
import { tailorRepository } from "@/data/tailor-repository";
import { requireRole, requireUser } from "./auth-service";
import { getOverdueJobs, jobDerived, tailorWageInfo } from "@/domain/calculations";
import { daysUntil, styleLabelOf } from "@/domain/format";
import { MONTHS } from "@/domain/constants";
import type { Job } from "@/domain/entities";

export interface DashboardMetrics {
  totalJobs: number;
  completed: number;
  inProgress: number;
  pending: number;
  revenue: number;
  tailorFeeTotal: number;
  materialBudgetTotal: number;
  officeUtilityTotal: number;
  miscTotal: number;
  profitTotal: number;
  outstandingTotal: number;
  overdue: number;
  dueSoon: number;
  male: number;
  female: number;
  repeat: number;
  byMonth: Array<{ month: string; jobs: number }>;
  byStyle: Array<{ name: string; value: number }>;
}

export interface TailorDashboard {
  jobs: Job[];
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

export const reportService = {
  async dashboardMetrics(): Promise<DashboardMetrics> {
    await requireRole(["ADMIN", "MANAGER"]);
    const [jobs, customers] = await Promise.all([
      jobRepository.findAll(),
      customerRepository.findAll(),
    ]);

    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let revenue = 0;
    let tailorFeeTotal = 0;
    let materialBudgetTotal = 0;
    let officeUtilityTotal = 0;
    let miscTotal = 0;
    let profitTotal = 0;
    let outstandingTotal = 0;
    let overdue = 0;
    let dueSoon = 0;

    for (const job of jobs) {
      const d = jobDerived(job);
      if (d.status === "Completed") completed++;
      else if (d.status === "In Progress") inProgress++;
      else pending++;
      revenue += d.contractPrice;
      tailorFeeTotal += d.tailorFee;
      materialBudgetTotal += d.materialBudget;
      officeUtilityTotal += d.officeUtility;
      miscTotal += d.miscellaneous;
      profitTotal += d.profit;
      outstandingTotal += d.outstanding;
      if (d.status !== "Completed" && job.completionDate) {
        const du = daysUntil(job.completionDate);
        if (du !== null) {
          if (du < 0) overdue++;
          else if (du <= 7) dueSoon++;
        }
      }
    }

    const male = customers.filter((c) => c.gender === "Male").length;
    const female = customers.filter((c) => c.gender === "Female").length;
    const repeat = customers.filter((c) => c.returning).length;

    const byMonthCount = new Map<string, number>();
    for (const job of jobs) {
      if (!job.dateReceived) continue;
      const month = MONTHS[new Date(job.dateReceived + "T00:00:00").getMonth()];
      byMonthCount.set(month, (byMonthCount.get(month) ?? 0) + 1);
    }
    const byMonth = MONTHS.map((m) => ({ month: m.slice(0, 3), jobs: byMonthCount.get(m) ?? 0 }));

    const styleMap = new Map<string, number>();
    for (const job of jobs) {
      const key = styleLabelOf(job);
      styleMap.set(key, (styleMap.get(key) ?? 0) + 1);
    }
    const byStyle = Array.from(styleMap.entries()).map(([name, value]) => ({ name, value }));

    return {
      totalJobs: jobs.length,
      completed,
      inProgress,
      pending,
      revenue,
      tailorFeeTotal,
      materialBudgetTotal,
      officeUtilityTotal,
      miscTotal,
      profitTotal,
      outstandingTotal,
      overdue,
      dueSoon,
      male,
      female,
      repeat,
      byMonth,
      byStyle,
    };
  },

  async overdueJobs() {
    await requireRole(["ADMIN", "MANAGER"]);
    const jobs = await jobRepository.findAll();
    return getOverdueJobs(jobs);
  },

  async tailorDashboard(): Promise<TailorDashboard> {
    const user = await requireUser();
    if (user.role !== "TAILOR" || !user.tailorId) {
      return { jobs: [], completed: 0, inProgress: 0, pending: 0, overdue: 0 };
    }
    const jobs = await jobRepository.findAll({ tailorId: user.tailorId });
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let overdue = 0;
    for (const job of jobs) {
      const d = jobDerived(job);
      if (d.status === "Completed") completed++;
      else if (d.status === "In Progress") inProgress++;
      else pending++;
      if (d.status !== "Completed" && job.completionDate) {
        const du = daysUntil(job.completionDate);
        if (du !== null && du < 0) overdue++;
      }
    }
    return { jobs, completed, inProgress, pending, overdue };
  },

  async excelReportRows(filter?: { style?: string; customerType?: "New" | "Repeat"; minProfit?: number }) {
    await requireRole(["ADMIN", "MANAGER"]);
    const [jobs, customers, tailors] = await Promise.all([
      jobRepository.findAll(),
      customerRepository.findAll(),
      tailorRepository.findAllWithWagePayments(),
    ]);

    const filteredJobs = jobs.filter((job) => {
      if (filter?.style && filter.style !== "All" && job.style !== filter.style) return false;
      if (filter?.customerType) {
        const customer = customers.find((c) => c.id === job.customerId);
        const isReturning = customer?.returning ?? false;
        if (filter.customerType === "Repeat" && !isReturning) return false;
        if (filter.customerType === "New" && isReturning) return false;
      }
      if (filter?.minProfit !== undefined && jobDerived(job).profit < filter.minProfit) return false;
      return true;
    });

    const jobRows = filteredJobs.map((job) => {
      const d = jobDerived(job);
      const du = job.completionDate ? daysUntil(job.completionDate) : null;
      const isDelayed = d.status !== "Completed" && du !== null && du < 0;
      return {
        "Job #": job.jobNumber,
        Customer: job.customerName,
        Style: styleLabelOf(job),
        "Date Received": job.dateReceived ?? "",
        "Expected Completion": job.completionDate ?? "",
        "Actual Completion": job.actualCompletionDate ?? "",
        "Contract Price": d.contractPrice,
        "Material Budget": d.materialBudget,
        "Tailor Fee (25%)": d.tailorFee,
        "Office & Utility (40%)": d.officeUtility,
        "Miscellaneous (5%)": d.miscellaneous,
        "Profit (30%)": d.profit,
        "Total Paid": d.totalPaid,
        Outstanding: d.outstanding,
        "Progress %": d.progress,
        Status: d.status,
        "Delayed?": isDelayed ? "Yes" : "No",
        "Delay (days)": isDelayed ? Math.abs(du as number) : 0,
        Tailor: job.tailorName ?? "",
      };
    });

    const customerRows = customers.map((c) => ({
      "Customer #": c.customerNumber,
      Name: c.name,
      Gender: c.gender,
      Phone: c.phone,
      City: c.city ?? "",
      State: c.state ?? "",
      Type: c.returning ? "Repeat" : "New",
      "Jobs Count": jobs.filter((j) => j.customerId === c.id).length,
    }));

    const tailorRows = tailors.map(({ tailor, wagePayments }) => {
      const info = tailorWageInfo(tailor, jobs, wagePayments);
      const theirJobs = jobs.filter((j) => j.tailorId === tailor.id);
      return {
        "Tailor #": tailor.tailorNumber,
        Name: tailor.name,
        Phone: tailor.phone ?? "",
        "Jobs Assigned": theirJobs.length,
        "Jobs Completed": theirJobs.filter((j) => jobDerived(j).status === "Completed").length,
        "Total Earned": info.earned,
        "Wage Paid": info.paid,
        "Wage Pending": info.pending,
      };
    });

    const totalRevenue = filteredJobs.reduce((s, j) => s + jobDerived(j).contractPrice, 0);
    const totalProfit = filteredJobs.reduce((s, j) => s + jobDerived(j).profit, 0);
    const delayedCount = jobRows.filter((r) => r["Delayed?"] === "Yes").length;
    const repeatCount = customers.filter((c) => c.returning).length;

    const summaryRows = [
      { Metric: "Jobs in this report", Value: filteredJobs.length },
      { Metric: "Total Revenue", Value: totalRevenue },
      { Metric: "Total Profit", Value: totalProfit },
      { Metric: "Delayed Jobs", Value: delayedCount },
      { Metric: "Repeat Customers", Value: repeatCount },
      { Metric: "New Customers", Value: customers.length - repeatCount },
    ];

    return { summaryRows, jobRows, customerRows, tailorRows };
  },

  async overdueReportRows() {
    await requireRole(["ADMIN", "MANAGER"]);
    const jobs = await jobRepository.findAll();
    const overdue = getOverdueJobs(jobs);
    const rows = overdue.map(({ job, derived, daysOverdue }) => ({
      "Job #": job.jobNumber,
      Customer: job.customerName,
      Style: styleLabelOf(job),
      "Expected Completion": job.completionDate ?? "",
      "Days Overdue": daysOverdue,
      "Progress %": derived.progress,
      Status: derived.status,
      "Contract Price": derived.contractPrice,
      "Total Paid": derived.totalPaid,
      "Outstanding Balance": derived.outstanding,
      Tailor: job.tailorName ?? "",
    }));
    const summaryRows = [
      { Metric: "Total Overdue Jobs", Value: overdue.length },
      { Metric: "Total Outstanding on Overdue Jobs", Value: overdue.reduce((s, i) => s + i.derived.outstanding, 0) },
      {
        Metric: "Average Days Overdue",
        Value: overdue.length
          ? Math.round(overdue.reduce((s, i) => s + i.daysOverdue, 0) / overdue.length)
          : 0,
      },
    ];
    return { summaryRows, rows };
  },
};
