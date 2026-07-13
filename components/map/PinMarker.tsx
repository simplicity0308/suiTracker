import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type { Stop } from "@/lib/types";

export function PinMarker({
  stop,
  color,
  label,
  onClick,
}: {
  stop: Stop;
  color: string;
  label?: string;
  onClick?: () => void;
}) {
  return (
    <AdvancedMarker
      position={{ lat: stop.lat, lng: stop.lng }}
      onClick={onClick}
    >
      <Pin
        background={color}
        borderColor={color}
        glyphColor="#ffffff"
        glyph={label}
      />
    </AdvancedMarker>
  );
}
