import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { OpStatus } from "@/lib/inventory";
import { Inbox } from "lucide-react";

const statusStyles: Record<OpStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  waiting: "bg-warning-bg text-warning border-warning/30",
  ready: "bg-info-bg text-info border-info/30",
  done: "bg-success-bg text-success border-success/30",
  cancelled: "bg-danger-bg text-destructive border-destructive/30",
};
const statusLabel: Record<OpStatus, string> = {
  draft: "Draft",
  waiting: "Waiting",
  ready: "Ready",
  done: "Done",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: OpStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {statusLabel[status]}
    </span>
  );
}

export function PageHeader({
  title,
  breadcrumb,
  actions,
  children,
}: {
  title: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {actions}
          <div className="min-w-0">
            {breadcrumb && <div className="text-xs text-muted-foreground">{breadcrumb}</div>}
            <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Inbox className="size-10 text-muted-foreground" aria-hidden />
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[1440px] px-4 py-5 md:px-6", className)}>{children}</div>;
}
