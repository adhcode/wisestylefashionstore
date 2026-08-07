// JS-side mirror of the CSS design tokens in globals.css. Tailwind classes
// (bg-plum, text-gold, …) cover static styling; this is for the few spots
// that need a raw hex string — chart fills, icon `color` props, and the
// hex+alpha-suffix trick used for tinted icon backgrounds.
export const PALETTE = {
  plumDark: "#2E1A38",
  plum: "#3D2645",
  plumLight: "#7B4B8A",
  gold: "#C9973E",
  goldLight: "#E4C377",
  cream: "#FAF7F1",
  panel: "#F7F2E8",
  ink: "#241B2E",
  slate: "#6B6470",
  line: "#E7E1D8",
  emerald: "#1E8A5F",
  amber: "#C77F1A",
  gray: "#9C9591",
  rose: "#B23A48",
} as const;

export const PIE_COLORS = [
  PALETTE.plum,
  PALETTE.gold,
  PALETTE.emerald,
  PALETTE.amber,
  PALETTE.rose,
  PALETTE.plumLight,
  PALETTE.slate,
  PALETTE.goldLight,
  "#4A2C5C",
];
