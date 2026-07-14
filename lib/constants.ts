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

export const DAY_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
