import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMaterialTypes } from "@/services/material-service";
import { MaterialsManagementClient } from "./client";

export const metadata = {
  title: "Material Types Management | WiseStyle",
};

export default async function MaterialsManagementPage() {
  const session = await auth();

  // Check admin permission
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard?error=access_denied");
  }

  // Fetch materials
  const materialTypes = await getMaterialTypes();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate mb-4">
        <span>Home</span> &gt; <span>Admin</span> &gt;{" "}
        <span className="text-ink font-medium">Materials</span>
      </nav>

      <MaterialsManagementClient materialTypes={materialTypes} />
    </div>
  );
}
