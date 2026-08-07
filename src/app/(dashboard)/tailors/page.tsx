import { tailorService } from "@/services/tailor-service";
import { TailorsGrid } from "@/components/tailors/TailorsGrid";

export default async function TailorsPage() {
  const summaries = await tailorService.listWithSummary();
  return <TailorsGrid summaries={summaries} />;
}
