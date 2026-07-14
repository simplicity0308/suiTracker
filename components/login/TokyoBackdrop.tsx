const FAR_BUILDINGS = [
  { x: 0, w: 60, h: 90 },
  { x: 65, w: 40, h: 70 },
  { x: 110, w: 55, h: 110 },
  { x: 170, w: 35, h: 60 },
  { x: 210, w: 70, h: 130 },
  { x: 285, w: 45, h: 80 },
  { x: 335, w: 60, h: 100 },
  { x: 400, w: 50, h: 75 },
  { x: 455, w: 65, h: 120 },
  { x: 525, w: 40, h: 65 },
  { x: 570, w: 55, h: 95 },
  { x: 630, w: 70, h: 140 },
  { x: 705, w: 45, h: 85 },
  { x: 755, w: 60, h: 105 },
  { x: 820, w: 50, h: 70 },
  { x: 875, w: 65, h: 115 },
  { x: 945, w: 40, h: 60 },
  { x: 990, w: 55, h: 90 },
  { x: 1050, w: 70, h: 130 },
  { x: 1125, w: 45, h: 75 },
  { x: 1175, w: 60, h: 100 },
  { x: 1240, w: 50, h: 80 },
  { x: 1295, w: 65, h: 110 },
  { x: 1365, w: 75, h: 95 },
];

const NEAR_BUILDINGS = [
  { x: 20, w: 90, h: 160 },
  { x: 140, w: 60, h: 200 },
  { x: 230, w: 100, h: 140 },
  { x: 370, w: 70, h: 220 },
  { x: 470, w: 110, h: 170 },
  { x: 620, w: 65, h: 240 },
  { x: 710, w: 95, h: 150 },
  { x: 840, w: 75, h: 210 },
  { x: 950, w: 105, h: 160 },
  { x: 1090, w: 60, h: 230 },
  { x: 1180, w: 90, h: 170 },
  { x: 1310, w: 80, h: 200 },
];

const BASE = 600;

type Building = { x: number; w: number; h: number };
type Window = { x: number; y: number; lit: boolean; delay: number };

function buildWindows(buildings: Building[]): Window[] {
  const windows: Window[] = [];
  buildings.forEach((b, bi) => {
    const cols = Math.max(3, Math.floor(b.w / 16));
    const rows = Math.max(4, Math.floor(b.h / 20));
    const colGap = b.w / cols;
    const rowGap = b.h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = (bi * 17 + r * 5 + c * 11) % 7;
        windows.push({
          x: b.x + c * colGap + colGap / 2 - 3,
          y: BASE - b.h + r * rowGap + rowGap / 2,
          lit: seed === 0 || seed === 2 || seed === 5,
          delay: ((bi * 3 + r * 2 + c) % 9) * 0.3,
        });
      }
    }
  });
  return windows;
}

const WINDOWS = buildWindows(NEAR_BUILDINGS);

export function TokyoBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="tokyo-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1229" />
            <stop offset="45%" stopColor="#1b2a52" />
            <stop offset="75%" stopColor="#5a3a68" />
            <stop offset="100%" stopColor="#e2703a" />
          </linearGradient>
          <filter id="tokyo-mist-blur" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="window-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>

        <rect x="0" y="0" width="1440" height="600" fill="url(#tokyo-sky)" />

        {/* Mount Fuji, distant and hazy — visible from Tokyo on a clear day */}
        <g opacity="0.3">
          <path
            d="M 860 50
               C 800 100, 700 220, 580 340
               C 480 420, 380 480, 330 560
               L 1470 560
               C 1420 480, 1320 420, 1220 340
               C 1100 220, 1000 100, 940 50
               C 920 40, 880 40, 860 50
               Z"
            fill="#5a3a68"
          />
        </g>
        <g opacity="0.55">
          <path
            d="M 860 50
               L 840 70 L 818 95 L 800 115
               L 825 140 L 845 118 L 870 142 L 900 120 L 930 142 L 955 118 L 975 140
               L 1000 115
               L 982 95 L 960 70 L 940 50
               C 920 40, 880 40, 860 50
               Z"
            fill="#f4f1ee"
          />
        </g>

        {/* far skyline */}
        <g fill="#8a93ad" opacity="0.18">
          {FAR_BUILDINGS.map((b, i) => (
            <rect key={i} x={b.x} y={BASE - b.h} width={b.w} height={b.h} />
          ))}
        </g>

        {/* drifting mist */}
        <g className="animate-drift" opacity="0.1" filter="url(#tokyo-mist-blur)">
          <ellipse cx="360" cy="470" rx="420" ry="30" fill="#f4f1ee" />
          <ellipse cx="1080" cy="500" rx="500" ry="34" fill="#f4f1ee" />
        </g>

        {/* near skyline */}
        <g fill="#242c4a" opacity="0.28">
          {NEAR_BUILDINGS.map((b, i) => (
            <rect key={i} x={b.x} y={BASE - b.h} width={b.w} height={b.h} />
          ))}
          {/* a slim tower with an antenna, evoking Tokyo Tower/Skytree */}
          <rect x="1000" y={BASE - 260} width="14" height="260" />
          <line
            x1="1007"
            y1={BASE - 260}
            x2="1007"
            y2={BASE - 300}
            stroke="#242c4a"
            strokeWidth="2"
          />
        </g>

        {/* window facade texture, dim and static */}
        <g fill="#c9c6cf" opacity="0.12">
          {WINDOWS.map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width="6" height="9" />
          ))}
        </g>

        {/* lit windows, staggered twinkle */}
        <g fill="#f8c56a" filter="url(#window-glow)">
          {WINDOWS.filter((w) => w.lit).map((w, i) => (
            <rect
              key={i}
              className="animate-twinkle"
              style={{ animationDelay: `${w.delay}s` }}
              x={w.x}
              y={w.y}
              width="6"
              height="9"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
