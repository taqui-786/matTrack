import { Badge } from "@/components/ui/badge";
import type { MaterialStatus } from "@/lib/supabase/types";

interface StatusBadgeProps {
  status: MaterialStatus;
}

const statusConfig: Record<
  MaterialStatus,
  { label: string; variant: string; className: string }
> = {
  pending: {
    label: "Pending",
    variant: "secondary",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  approved: {
    label: "Approved",
    variant: "default",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
  fulfilled: {
    label: "Fulfilled",
    variant: "default",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
