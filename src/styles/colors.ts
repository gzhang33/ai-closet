export function withAlpha(hex: string, alpha: number): string {
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clampedAlpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alphaHex}`;
}

export const colors = {
  // Primary - Soft Rose
  primary: "#E8A0BF",
  primary_light: "#F5D5E5",
  primary_dark: "#C77DA0",
  primary_subtle: "#FDF2F8",

  // Accent - Warm Gold
  accent: "#D4A574",
  accent_light: "#E8CDB5",
  accent_subtle: "#FBF5EF",

  // Text
  text_primary: "#2D2D3A",
  text_secondary: "#6B6B7B",
  text_tertiary: "#9D9DAF",
  text_inverse: "#FFFFFF",

  // Backgrounds
  surface_primary: "#FEFCFD",
  surface_secondary: "#FAF7F9",
  surface_tertiary: "#F5F0F3",
  surface_card: "#FFFFFF",

  // Borders & Dividers
  border_light: "#F0EBEE",
  border_medium: "#E0D8DD",
  border_strong: "#C8BFC6",

  // Semantic
  error: "#E85D75",
  error_light: "#FDE8EC",
  success: "#6BCB9B",
  success_light: "#E5F8EF",

  // Overlay
  overlay_light: "rgba(45, 45, 58, 0.04)",
  overlay_medium: "rgba(45, 45, 58, 0.12)",
  overlay_heavy: "rgba(45, 45, 58, 0.40)",

  // Shadows
  shadow_color: "rgba(45, 45, 58, 0.08)",

  // Semi-transparent variants
  surface_card_80: withAlpha("#FFFFFF", 0.8),
  surface_card_67: withAlpha("#FFFFFF", 0.67),
  text_inverse_73: withAlpha("#FFFFFF", 0.73),
  primary_87: withAlpha("#E8A0BF", 0.87),
  primary_dark_27: withAlpha("#C77DA0", 0.27),

  // Special
  transparent: "transparent",
};
