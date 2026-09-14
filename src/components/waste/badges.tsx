import { cn } from "@/lib/utils";
import type { Condition, Priority, Status } from "@/lib/waste-store";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    High: "bg-destructive/12 text-destructive border-destructive/30",
    Medium: "bg-warning/20 text-warning-foreground border-warning/40",
    Low: "bg-success/15 text-success border-success/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[priority],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Pending: "bg-muted text-muted-foreground border-border",
    Assigned: "bg-info/15 text-info border-info/30",
    "In Progress": "bg-warning/20 text-warning-foreground border-warning/40",
    Completed: "bg-accent text-accent-foreground border-accent-foreground/20",
    Verified: "bg-success/15 text-success border-success/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-foreground">
      {condition}
    </span>
  );
}
