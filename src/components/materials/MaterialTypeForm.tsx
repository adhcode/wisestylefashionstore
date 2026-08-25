"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, inputCls } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { MaterialType, MaterialTypeInput } from "@/domain/entities";
import {
  createMaterialType,
  updateMaterialType,
} from "@/actions/material-actions";

interface MaterialTypeFormProps {
  materialType?: MaterialType | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function MaterialTypeForm({
  materialType,
  onCancel,
  onSuccess,
}: MaterialTypeFormProps) {
  const isEditing = !!materialType;
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);

  // Form state
  const [label, setLabel] = useState(materialType?.label || "");
  const [unit, setUnit] = useState(materialType?.unit || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Client-side validation
    const validationErrors: string[] = [];

    if (!label.trim()) {
      validationErrors.push("Material label is required");
    }

    if (!unit.trim()) {
      validationErrors.push("Unit is required");
    }

    if (unit.length > 20) {
      validationErrors.push("Unit must be 1-20 characters");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit with default maxQuantity of 50
    const input: MaterialTypeInput = {
      label: label.trim(),
      unit: unit.trim(),
      maxQuantity: 50,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateMaterialType(materialType.id, input)
        : await createMaterialType(input);

      if (!result.success) {
        setErrors([result.error]);
        return;
      }

      onSuccess();
    });
  };

  return (
    <Modal
      title={isEditing ? "Edit Material Type" : "Create Material Type"}
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit}>
        <ErrorBanner messages={errors} />

        <Field label="Label *">
          <input
            type="text"
            className={inputCls}
            placeholder="e.g., Sewing Thread"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
            disabled={isPending}
          />
          <p className="text-xs text-slate mt-1">
            The display name for this material type
          </p>
        </Field>

        <Field label="Unit *">
          <input
            type="text"
            className={inputCls}
            placeholder="e.g., pcs, yards, design"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            maxLength={20}
            disabled={isPending}
          />
          <p className="text-xs text-slate mt-1">
            Unit of measurement (max 20 characters)
          </p>
        </Field>

        <div className="flex gap-2 justify-end mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
