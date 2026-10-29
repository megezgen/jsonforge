import { cn } from "@/lib/utils";

const SIZES = {
  leaderboard: "h-[90px] w-full max-w-[728px]",
  rectangle: "h-[250px] w-full max-w-[300px]",
} as const;

/**
 * Reserved, fixed-size ad placeholder. The dimensions are fixed up front so a
 * real ad network can fill them without causing layout shift.
 */
export function AdSlot({ size, className }: { size: keyof typeof SIZES; className?: string }) {
  // Hidden until an ad network has approved the site. Set NEXT_PUBLIC_ADS_ENABLED=true to show the slots.
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== "true") return null;
  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={size}
      className={cn(
        "mx-auto flex items-center justify-center rounded-md border border-dashed border-line text-[11px] uppercase tracking-wider text-muted",
        SIZES[size],
        className,
      )}
    >
      Ad {size === "leaderboard" ? "728×90" : "300×250"}
    </aside>
  );
}
