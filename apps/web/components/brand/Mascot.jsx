import { cn } from "@/lib/utils";

/**
 * My Chotu mascot — a friendly delivery boy SVG icon.
 * Used in empty states, onboarding, and marketing pages.
 */
export function Mascot({ className, size = 64 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
    >
      {/* Body */}
      <circle cx="32" cy="32" r="30" fill="#FFF0EB" stroke="#F4512C" strokeWidth="2" />
      {/* Head */}
      <circle cx="32" cy="22" r="10" fill="#FDDCB5" />
      {/* Cap */}
      <path d="M22 20 Q32 10 42 20 L40 22 H24 Z" fill="#F4512C" />
      <rect x="20" y="20" width="24" height="3" rx="1.5" fill="#152744" />
      {/* Eyes */}
      <circle cx="28" cy="22" r="1.5" fill="#152744" />
      <circle cx="36" cy="22" r="1.5" fill="#152744" />
      {/* Smile */}
      <path d="M28 27 Q32 31 36 27" stroke="#152744" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Shirt */}
      <path d="M22 34 Q32 30 42 34 L44 50 H20 Z" fill="#152744" />
      {/* Bag */}
      <rect x="38" y="36" width="10" height="8" rx="2" fill="#F4512C" />
      <rect x="40" y="34" width="6" height="3" rx="1.5" fill="#F4512C" />
      {/* Arms */}
      <path d="M22 36 L16 42" stroke="#FDDCB5" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 36 L48 38" stroke="#FDDCB5" strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <path d="M26 50 L24 58" stroke="#152744" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 50 L40 58" stroke="#152744" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
