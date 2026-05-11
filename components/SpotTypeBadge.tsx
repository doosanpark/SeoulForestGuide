import { cn } from "@/lib/utils";
import type { SpotType } from "@/lib/spots";

const STYLES: Record<SpotType, { label: string; classes: string }> = {
  guide: {
    label: "도슨트",
    classes: "bg-forest-100 text-forest-700 ring-forest-200",
  },
  photo: {
    label: "포토스팟",
    classes: "bg-amber-100 text-amber-800 ring-amber-200",
  },
  pokemon: {
    label: "포켓몬",
    classes: "bg-purple-100 text-purple-800 ring-purple-200",
  },
  garden: {
    label: "정원박람회",
    classes: "bg-sky-100 text-sky-800 ring-sky-200",
  },
};

export function SpotTypeBadge({
  type,
  className,
}: {
  type: SpotType;
  className?: string;
}) {
  const s = STYLES[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        s.classes,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
