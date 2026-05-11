import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SpotTypeBadge } from "./SpotTypeBadge";
import type { Spot } from "@/lib/spots";
import { formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";

interface SpotCardProps {
  spot: Spot;
  distanceMeters?: number;
  className?: string;
}

export function SpotCard({ spot, distanceMeters, className }: SpotCardProps) {
  return (
    <Link
      href={`/spot/${spot.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border shadow-sm active:bg-accent/40 transition-colors",
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <SpotTypeBadge type={spot.type} />
          {typeof distanceMeters === "number" && (
            <span className="text-xs text-ink-muted">
              {formatDistance(distanceMeters)}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-ink truncate">{spot.name}</h3>
        <p className="text-sm text-ink-muted line-clamp-2 mt-0.5">
          {spot.shortDescription}
        </p>
      </div>
      <ChevronRight
        className="size-5 text-ink-muted shrink-0 group-active:translate-x-0.5 transition-transform"
        aria-hidden
      />
    </Link>
  );
}
