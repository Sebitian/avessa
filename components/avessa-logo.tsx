import { cn } from "@/lib/utils";

type AvessaLogoProps = {
  className?: string;
  /** Image width class — default fits splash / welcome */
  size?: "sm" | "md" | "lg";
  /** Use light wordmark for photos / dark backgrounds */
  onDark?: boolean;
  priority?: boolean;
};

const SIZE_CLASS = {
  sm: "w-28",
  md: "w-44",
  lg: "w-56",
} as const;

export function AvessaLogo({
  className,
  size = "md",
  onDark = false,
  priority = false,
}: AvessaLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={
        onDark
          ? "/images/avessa-logo-on-dark.png"
          : "/images/avessa-logo.png"
      }
      alt="Avessa — Never a Stranger"
      width={512}
      height={512}
      className={cn(
        "h-auto object-contain",
        SIZE_CLASS[size],
        onDark && "drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
        className,
      )}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
