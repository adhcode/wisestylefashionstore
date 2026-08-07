import type { MaterialKey } from "./entities";

export const STYLES = [
  "Full Agbada",
  "Yahoo Agbada",
  "Babariga",
  "Dansiki",
  "Pant Trouser",
  "Native Wear",
  "Eso-Ebi Wear",
  "Corporate Shirt",
  "Others",
] as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export interface MaterialDefinition {
  key: MaterialKey;
  label: string;
  unit: string;
  max: number;
}

export const MATERIALS_DEF: MaterialDefinition[] = [
  { key: "needle", label: "Needle", unit: "pcs", max: 10 },
  { key: "stay", label: "Stay", unit: "pcs", max: 10 },
  { key: "buttons", label: "Buttons", unit: "pcs", max: 10 },
  { key: "monogramFull", label: "Monogram (Full Design)", unit: "design", max: 1 },
  { key: "monogramPartial", label: "Monogram (Partial Design)", unit: "design", max: 1 },
  { key: "zip", label: "Zip", unit: "pcs", max: 10 },
  { key: "thread", label: "Sewing Thread", unit: "pcs", max: 10 },
  { key: "underlay", label: "Underlay Cloth", unit: "yards", max: 5 },
];

// Contract price sharing: the Material Budget is linked 1:1 to the
// "Materials Needed" total. The remaining balance (Contract Price minus
// Material Budget) is then split by these ratios.
export const SHARE = {
  tailor: 0.25,
  utility: 0.4,
  misc: 0.05,
  profit: 0.3,
} as const;

export const BANK_DETAILS = {
  bank: "Fidelity Bank",
  accountName: "Wisebuy Nigeria Limited",
  accountNumber: "4010835116",
};
