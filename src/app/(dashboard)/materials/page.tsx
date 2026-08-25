import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMaterialTypes } from "@/services/material-service";
import { MaterialsManagementClient } from "./client";

export const metadata = {
  title: "Material Types | WiseStyle",
};

export default async function MaterialsPage() {
  const session = await auth();

  // Check admin or manager permission
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    redirect("/dashboard?error=access_denied");
  }

  // Fetch materials
  const materialTypes = await getMaterialTypes();

  return <MaterialsManagementClient materialTypes={materialTypes} />;
}
