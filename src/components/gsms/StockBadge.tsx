import { Badge } from "@/components/ui/badge";
import { stockStatus } from "@/lib/gsms/types";
import { cn } from "@/lib/utils";

export function StockBadge({ qty, className }: { qty: number; className?: string }) {
  const status = stockStatus(qty);
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        status === "In Stock" && "bg-success/12 text-success",
        status === "Low Stock" && "bg-warning/18 text-warning-foreground",
        status === "Out of Stock" && "bg-destructive/12 text-destructive",
        className,
      )}
    >
      {status}
    </Badge>
  );
}