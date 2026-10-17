import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  // Order statuses
  PENDING:           "bg-yellow-100 text-yellow-800 border-yellow-200",
  ACCEPTED:          "bg-blue-100 text-blue-800 border-blue-200",
  REJECTED:          "bg-red-100 text-red-800 border-red-200",
  PREPARING:         "bg-orange-100 text-orange-800 border-orange-200",
  DELIVERY_ASSIGNED: "bg-purple-100 text-purple-800 border-purple-200",
  PICKED_UP:         "bg-indigo-100 text-indigo-800 border-indigo-200",
  OUT_FOR_DELIVERY:  "bg-blue-100 text-blue-800 border-blue-200",
  DELIVERED:         "bg-green-100 text-green-800 border-green-200",
  FAILED_DELIVERY:   "bg-red-100 text-red-800 border-red-200",
  CANCELLED:         "bg-gray-100 text-gray-600 border-gray-200",

  // Shop statuses
  APPROVED:          "bg-green-100 text-green-800 border-green-200",
  SUSPENDED:         "bg-red-100 text-red-800 border-red-200",

  // Subscription statuses
  TRIAL:             "bg-blue-100 text-blue-800 border-blue-200",
  ACTIVE:            "bg-green-100 text-green-800 border-green-200",
  PAST_DUE:          "bg-yellow-100 text-yellow-800 border-yellow-200",
  GRACE_PERIOD:      "bg-orange-100 text-orange-800 border-orange-200",
  EXPIRED:           "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABELS = {
  PENDING:           "Pending",
  ACCEPTED:          "Accepted",
  REJECTED:          "Rejected",
  PREPARING:         "Preparing",
  DELIVERY_ASSIGNED: "Assigned",
  PICKED_UP:         "Picked Up",
  OUT_FOR_DELIVERY:  "Out for Delivery",
  DELIVERED:         "Delivered",
  FAILED_DELIVERY:   "Failed",
  CANCELLED:         "Cancelled",
  APPROVED:          "Approved",
  SUSPENDED:         "Suspended",
  TRIAL:             "Trial",
  ACTIVE:            "Active",
  PAST_DUE:          "Past Due",
  GRACE_PERIOD:      "Grace Period",
  EXPIRED:           "Expired",
};

export function StatusBadge({ status, className }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs border", style, className)}
    >
      {label}
    </Badge>
  );
}
