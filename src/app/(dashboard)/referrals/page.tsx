import { referrerService } from "@/services/referrer-service";
import { ReferrersGrid } from "@/components/referrers/ReferrersGrid";

export const metadata = {
  title: "Referrals | WiseStyle",
};

export default async function ReferralsPage() {
  const summaries = await referrerService.listWithStats();
  return <ReferrersGrid summaries={summaries} />;
}
