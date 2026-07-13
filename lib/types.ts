export type Category =
  | "food"
  | "sight"
  | "hotel"
  | "transport"
  | "shopping"
  | "other";

export type Trip = {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
};

export type Day = {
  id: string;
  trip_id: string;
  day_date: string | null;
  label: string;
  sort_order: number;
};

export type Stop = {
  id: string;
  trip_id: string;
  day_id: string | null;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  place_id: string | null;
  category: Category;
  note: string | null;
  sort_order: number;
  created_by: string | null;
};
