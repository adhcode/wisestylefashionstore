"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MaterialType } from "@/domain/entities";
import {
  deleteMaterialType,
  countJobsWithMaterial,
} from "@/actions/material-actions";

interface MaterialTypeListProps {
  materialTypes: MaterialType[];
  onEdit: (material: MaterialType) => void;
  onCreate: () => void;
}

export function MaterialTypeList({
  materialTypes,
  onEdit,
  onCreate,
}: MaterialTypeListProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (material: MaterialType) => {
    if (deletingId) return; // Prevent multiple simultaneous deletes

    // Count jobs using this material
    const countResult = await countJobsWithMaterial(material.key);

    if (!countResult.success) {
      alert(`Error: ${countResult.error}`);
      return;
    }

    const jobCount = countResult.data;

    // Confirm deletion
    const message =
      jobCount > 0
        ? `This material is used in ${jobCount} job${jobCount === 1 ? "" : "s"}. Delete anyway?`
        : `Delete material "${material.label}"?`;

    if (!confirm(message)) {
      return;
    }

    // Delete material
    setDeletingId(material.id);
    startTransition(async () => {
      const result = await deleteMaterialType(material.id);

      if (!result.success) {
        alert(`Error: ${result.error}`);
      }

      setDeletingId(null);
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Material Types</h1>
            <p className="text-sm text-gray-600">Manage material types used in job creation</p>
          </div>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Material Type
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Package className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{materialTypes.length}</p>
            <p className="text-sm text-gray-600">Total Material Types</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {materialTypes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-600 mb-4">No material types configured yet</p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Create First Material Type
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materialTypes.map((material) => (
                  <tr
                    key={material.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.label}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{material.unit}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(material)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit material"
                          disabled={isPending}
                        >
                          <Pencil size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(material)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete material"
                          disabled={isPending || deletingId === material.id}
                        >
                          <Trash2
                            size={16}
                            className={
                              deletingId === material.id ? "text-gray-400" : "text-red-600"
                            }
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {materialTypes.length} material type{materialTypes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
