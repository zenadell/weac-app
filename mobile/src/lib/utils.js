// 1:1 port of src/lib/utils.ts
// cn helper for combining className strings (no twMerge needed in RN)
export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// Lovable gradient palette → LinearGradient color arrays
export const GRADIENTS = {
  peach:  ["#FF9E80", "#F06292"],
  mint:   ["#80CBC4", "#4DB6AC"],
  lilac:  ["#CE93D8", "#9575CD"],
  butter: ["#FFF176", "#FFD54F"],
  sky:    ["#90CAF9", "#5C6BC0"],
  rose:   ["#F8BBD0", "#EF5350"],
};

// Drop-in for `gradient-peach` etc. classnames from Lovable repo
export function gradientFor(name) {
  if (!name) return null;
  const key = name.replace(/^gradient-/, "");
  return GRADIENTS[key] || null;
}

// Color tokens (parsed from Lovable CSS variables)
export const COLORS = {
  canvas: "#FBF8F0",
  ink: "#1B1A2E",
  card: "#FFFFFF",
  primary: "#FF9E80",
  mutedForeground: "#7B7995",
  border: "#E7E3D6",
  peach: "#FF9E80",
  coral: "#F06292",
  lilac: "#CE93D8",
  royal: "#9575CD",
  mint: "#80CBC4",
  teal: "#4DB6AC",
  butter: "#FFF176",
  sand: "#FFD54F",
  sky: "#90CAF9",
  ocean: "#5C6BC0",
  blush: "#F8BBD0",
  rose: "#EF5350",
};
