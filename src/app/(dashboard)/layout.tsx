import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth-service";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} name={user.name} />
      <div className="flex-1 overflow-y-auto lg:ml-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-8 pb-6 sm:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
