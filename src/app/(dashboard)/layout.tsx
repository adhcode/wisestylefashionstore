import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth-service";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#FAF7F1" }}>
      <Sidebar role={user.role} name={user.name} />
      <div className="flex-1 p-6 overflow-y-auto">{children}</div>
    </div>
  );
}
