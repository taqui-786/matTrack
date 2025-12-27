import { Badge } from "@/components/ui/badge";
import type { MaterialPriority } from "@/lib/supabase/types";

interface PriorityBadgeProps {
  priority: MaterialPriority;
}

const priorityConfig: Record<
  MaterialPriority,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  },
  medium: {
    label: "Medium",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
  high: {
    label: "High",
    className: "bg-rose-100 text-rose-700 hover:bg-rose-200",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-600 text-white hover:bg-red-700",
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return <Badge className={config.className}>{config.label}</Badge>;
}
