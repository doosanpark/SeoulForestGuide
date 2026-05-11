import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  backHref?: string;
  className?: string;
}

export function AppHeader({ title, backHref, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-background/80 backdrop-blur-md ring-1 ring-border/50",
        className,
      )}
    >
      <div className="h-14 px-2 flex items-center gap-1">
        {backHref ? (
          <Link
            href={backHref}
            className="size-10 flex items-center justify-center rounded-full active:bg-accent/40"
            aria-label="뒤로"
          >
            <ChevronLeft className="size-6 text-ink" />
          </Link>
        ) : (
          <div className="w-2" />
        )}
        <h1 className="font-semibold text-ink truncate text-base">
          {title ?? "서울숲 투어"}
        </h1>
      </div>
    </header>
  );
}
