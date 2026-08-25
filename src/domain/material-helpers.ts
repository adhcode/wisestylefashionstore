import type { MaterialType, MaterialsState } from "./entities";

/**
 * Gets the display label for a material by its key.
 * Returns the material's label if found, or a "Deleted Material (key)" label if not.
 */
export function getMaterialLabel(
  materialTypes: MaterialType[],
  key: string
): string {
  const material = materialTypes.find((mt) => mt.key === key);
  return material ? material.label : `Deleted Material (${key})`;
}

/**
 * Checks if a material key exists in the current material types.
 */
export function isMaterialDeleted(
  materialTypes: MaterialType[],
  key: string
): boolean {
  return !materialTypes.some((mt) => mt.key === key);
}

/**
 * Gets the unit for a material by its key.
 * Returns the material's unit if found, or "units" as default.
 */
export function getMaterialUnit(
  materialTypes: MaterialType[],
  key: string
): string {
  const material = materialTypes.find((mt) => mt.key === key);
  return material ? material.unit : "units";
}

/**
 * Gets all material keys used in a job's materials state,
 * including deleted materials.
 */
export function getUsedMaterialKeys(materials: MaterialsState): string[] {
  return Object.keys(materials).filter((key) => materials[key]?.included);
}
