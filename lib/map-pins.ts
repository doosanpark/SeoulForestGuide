import type { SpotType } from "./spots";

// Hex color per spot type — matches SpotTypeBadge.
const TYPE_COLOR: Record<SpotType, { fill: string; stroke: string }> = {
  guide: { fill: "#2D5F3F", stroke: "#1B3B27" }, // forest
  photo: { fill: "#D97706", stroke: "#92400E" }, // amber-600
  pokemon: { fill: "#9333EA", stroke: "#6B21A8" }, // purple-600
  garden: { fill: "#0284C7", stroke: "#075985" }, // sky-600
};

export const PIN_SIZE = { width: 36, height: 48 } as const;

function pinSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_SIZE.width}" height="${PIN_SIZE.height}" viewBox="0 0 36 48">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="18" cy="18" r="6" fill="#ffffff"/>
  </svg>`;
}

export function pinDataUrl(type: SpotType): string {
  const { fill, stroke } = TYPE_COLOR[type];
  // encodeURIComponent on the SVG keeps things URL-safe in all browsers
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pinSvg(fill, stroke))}`;
}

// Current-location dot (pulsing blue) — also SVG so no extra assets.
export const CURRENT_LOCATION_PIN = {
  size: { width: 24, height: 24 } as const,
  dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill="#3B82F6" fill-opacity="0.18"/>
      <circle cx="12" cy="12" r="6" fill="#3B82F6" stroke="#ffffff" stroke-width="2.5"/>
    </svg>`,
  )}`,
};
