import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandMark inset={28} />, { ...size });
}

// Shared pine-tree mark — also used by icon-512 and apple-icon.
// Designed to fit in the maskable safe zone (inner 80% of canvas).
export function BrandMark({ inset = 28 }: { inset?: number }) {
  const s = 192;
  const cx = s / 2;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#2D5F3F",
        borderRadius: 40,
      }}
    >
      <svg
        viewBox="0 0 192 192"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <Tree cx={cx} top={inset} bottom={s - inset} />
      </svg>
    </div>
  );
}

function Tree({
  cx,
  top,
  bottom,
}: {
  cx: number;
  top: number;
  bottom: number;
}) {
  const height = bottom - top;
  const tier = height / 4;
  const halfBase = (width: number) => width / 2;
  return (
    <g fill="#F5F1E8">
      {/* Top tier */}
      <polygon
        points={`${cx},${top} ${cx - halfBase(48)},${top + tier} ${cx + halfBase(48)},${top + tier}`}
      />
      {/* Middle tier */}
      <polygon
        points={`${cx},${top + tier * 0.5} ${cx - halfBase(72)},${top + tier * 1.7} ${cx + halfBase(72)},${top + tier * 1.7}`}
      />
      {/* Bottom tier */}
      <polygon
        points={`${cx},${top + tier * 1.2} ${cx - halfBase(96)},${top + tier * 2.7} ${cx + halfBase(96)},${top + tier * 2.7}`}
      />
      {/* Trunk */}
      <rect x={cx - 8} y={top + tier * 2.7} width={16} height={tier * 0.55} />
    </g>
  );
}
