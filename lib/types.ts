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

export type Todo = {
  id: string;
  trip_id: string;
  day_id: string | null;
  title: string;
  note: string | null;
  due_date: string | null;
  due_time: string | null;
  done: boolean;
  sort_order: number;
  created_at: string;
  created_by: string | null;
};

export type Profile = {
  id: string;
  label: string;
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
  start_time: string | null;
  duration_minutes: number | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
};

export type WeatherPoint = {
  weatherCode: number;
  temperatureC: number;
  precipChance: number | null;
  source: "hourly" | "daily";
};

export type HourlyForecastPoint = {
  time: string; // "HH:MM", local to the stop's day
  weatherCode: number;
  temperatureC: number;
  precipChance: number | null;
};

export type StopWeather = {
  date: string; // the stop's day_date, "YYYY-MM-DD"
  current: WeatherPoint;
  hourly: HourlyForecastPoint[];
};
