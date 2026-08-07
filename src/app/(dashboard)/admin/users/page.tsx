import { userService } from "@/services/user-service";
import { tailorService } from "@/services/tailor-service";
import { UserAccountsPanel } from "@/components/admin/UserAccountsPanel";

export default async function AdminUsersPage() {
  const [users, tailors] = await Promise.all([userService.list(), tailorService.list()]);
  return <UserAccountsPanel users={users} tailors={tailors} />;
}
