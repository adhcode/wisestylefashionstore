"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialTypeList } from "@/components/materials/MaterialTypeList";
import { MaterialTypeForm } from "@/components/materials/MaterialTypeForm";
import type { MaterialType } from "@/domain/entities";

interface MaterialsManagementClientProps {
  materialTypes: MaterialType[];
}

export function MaterialsManagementClient({
  materialTypes,
}: MaterialsManagementClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialType | null>(
    null
  );

  const handleCreate = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleEdit = (material: MaterialType) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingMaterial(null);
    router.refresh(); // Refresh to show updated data
  };

  return (
    <>
      <MaterialTypeList
        materialTypes={materialTypes}
        onEdit={handleEdit}
        onCreate={handleCreate}
      />

      {showForm && (
        <MaterialTypeForm
          materialType={editingMaterial}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
