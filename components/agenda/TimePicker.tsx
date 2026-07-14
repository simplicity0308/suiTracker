"use client";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

function parseValue(value: string) {
  if (!value) return { hour12: "", minute: "00", period: "AM" as const };
  const [hStr, mStr] = value.split(":");
  const h24 = parseInt(hStr, 10);
  const period = h24 >= 12 ? ("PM" as const) : ("AM" as const);
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12: String(hour12), minute: mStr, period };
}

function toValue(hour12: string, minute: string, period: "AM" | "PM") {
  if (!hour12) return "";
  let h = parseInt(hour12, 10) % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

export function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { hour12, minute, period } = parseValue(value);
  const selectClass =
    "w-1/3 rounded-md border border-zinc-300 px-2 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900";

  return (
    <div className="flex gap-1.5">
      <select
        value={hour12}
        onChange={(e) => onChange(toValue(e.target.value, minute, period))}
        className={selectClass}
      >
        <option value="">--</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <select
        value={minute}
        onChange={(e) => onChange(toValue(hour12, e.target.value, period))}
        disabled={!hour12}
        className={selectClass}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={period}
        onChange={(e) =>
          onChange(toValue(hour12, minute, e.target.value as "AM" | "PM"))
        }
        disabled={!hour12}
        className={selectClass}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
