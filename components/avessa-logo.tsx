import { cn } from "@/lib/utils";

type AvessaLogoProps = {
  className?: string;
  /** Overall lockup width */
  size?: "sm" | "md" | "lg";
  /** Light wordmark for photos / dark backgrounds */
  onDark?: boolean;
  priority?: boolean;
  /** Hide tagline (compact auth headers) */
  markOnly?: boolean;
};

const SIZE = {
  sm: { wrap: "w-28", mark: "w-12", name: "text-[0.95rem]", tag: "text-[0.55rem]" },
  md: { wrap: "w-40", mark: "w-[4.5rem]", name: "text-[1.35rem]", tag: "text-[0.7rem]" },
  lg: { wrap: "w-52", mark: "w-24", name: "text-[1.75rem]", tag: "text-[0.8rem]" },
} as const;

export function AvessaLogo({
  className,
  size = "md",
  onDark = false,
  priority = false,
  markOnly = false,
}: AvessaLogoProps) {
  const s = SIZE[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        s.wrap,
        onDark && "drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/avessa-mark.png"
        alt=""
        width={512}
        height={512}
        className={cn("h-auto object-contain", s.mark)}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
      {!markOnly ? (
        <>
          <p
            className={cn(
              "mt-2.5 font-semibold uppercase tracking-[0.28em]",
              s.name,
              onDark ? "text-white" : "text-zinc-900",
            )}
          >
            Avessa
          </p>
          <p
            className={cn(
              "mt-1.5 font-medium tracking-[0.06em]",
              s.tag,
              onDark ? "text-white/90" : "text-zinc-600",
            )}
          >
            Never a Stranger.
          </p>
        </>
      ) : null}
      <span className="sr-only">Avessa — Never a Stranger.</span>
    </div>
  );
}
