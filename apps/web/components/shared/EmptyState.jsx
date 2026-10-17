import { Mascot } from "@/components/brand/Mascot";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-16 text-center", className)}>
      <Mascot size={80} />
      <div className="space-y-1">
        <p className="text-lg font-semibold text-[#152744]">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
