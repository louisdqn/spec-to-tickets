import { Badge } from "@/components/ui/badge";
import type { TicketLabel } from "@/types";

const LABEL_COLORS: Record<TicketLabel, string> = {
  frontend: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  backend: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  infra: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  design: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  api: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  database: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  auth: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  testing: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
};

interface LabelBadgeProps {
  label: TicketLabel;
  className?: string;
}

export function LabelBadge({ label, className }: LabelBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`border-transparent text-[10px] ${LABEL_COLORS[label]} ${className ?? ""}`}
    >
      {label}
    </Badge>
  );
}

export { LABEL_COLORS };
