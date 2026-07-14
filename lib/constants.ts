import type { Category } from "./types";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "sight", label: "Sight" },
  { value: "hotel", label: "Hotel" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  food: "#f97316",
  sight: "#3b82f6",
  hotel: "#8b5cf6",
  transport: "#14b8a6",
  shopping: "#ec4899",
  other: "#71717a",
};

export const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hr" },
  { value: 90, label: "1.5 hr" },
  { value: 120, label: "2 hr" },
  { value: 180, label: "3 hr" },
  { value: 240, label: "4 hr" },
  { value: 360, label: "6 hr" },
  { value: 480, label: "8 hr" },
];

/**
 * Evenly spaces hues around the color wheel based on how many days the
 * trip actually has, so colors never repeat regardless of trip length —
 * a fixed palette collides (e.g. day 9 reusing day 1's color) on any trip
 * longer than the palette size.
 */
export function getDayColor(index: number, total: number): string {
  const hue = Math.round((index * 360) / Math.max(total, 1));
  return `hsl(${hue}, 70%, 45%)`;
}
