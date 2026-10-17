import { cn } from "@/lib/utils";

/**
 * My Chotu wordmark logo.
 * Uses brand orange for the dot and navy for the text.
 */
export function Logo({ className, size = "md" }) {
  const sizes = {
    sm: { text: "text-lg", dot: "w-2 h-2" },
    md: { text: "text-2xl", dot: "w-2.5 h-2.5" },
    lg: { text: "text-4xl", dot: "w-3.5 h-3.5" },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <span className={cn("inline-flex items-center gap-1 font-bold tracking-tight select-none", className)}>
      <span className={cn("rounded-full bg-[#F4512C] flex-shrink-0", s.dot)} />
      <span className={cn(s.text, "text-[#152744]")}>
        My{" "}
        <span className="text-[#F4512C]">Chotu</span>
      </span>
    </span>
  );
}
