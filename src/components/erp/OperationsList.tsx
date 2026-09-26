import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actions, isLate, useStore, type OpStatus, type OpType } from "@/lib/inventory";
import { EmptyState, PageBody, PageHeader, StatusBadge } from "./common";
import { cn } from "@/lib/utils";

const columns: OpStatus[] = ["draft", "waiting", "ready", "done", "cancelled"];

export function OperationsList({ type }: { type: OpType }) {
  const all = useStore((s) => s.operations);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const title = type === "IN" ? "Receipts" : "Deliveries";

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .filter((o) => o.type === type)
      .filter((o) => !term || o.ref.toLowerCase().includes(term) || o.contact.toLowerCase().includes(term));
  }, [all, type, q]);

  const create = () => navigate({ to: "/operations/$id", params: { id: actions.createOperation(type) } });
  const kanbanCols = type === "IN" ? columns.filter((c) => c !== "waiting") : columns;

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb="Operations"
        actions={<Button onClick={create}>New</Button>}
      >
        <label className="relative">
          <span className="sr-only">Search by reference or contact</span>
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reference or contact…"
            className="h-8 w-64 rounded-md border border-input bg-surface pl-8 pr-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <div className="flex rounded-md border border-input" role="group" aria-label="View">
          {(["list", "kanban"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={`${v} view`}
              className={cn(
                "flex size-8 items-center justify-center text-muted-foreground transition-colors first:rounded-l-md last:rounded-r-md hover:bg-surface-hover",
                view === v && "bg-accent text-accent-foreground",
              )}
            >
              {v === "list" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
            </button>
          ))}
        </div>
      </PageHeader>
      <PageBody>
        {rows.length === 0 ? (
          <div className="erp-panel">
            <EmptyState
              title={q ? "No matching operations" : `No ${title.toLowerCase()} yet`}
              description={q ? "Try another reference or contact." : "Create the first one to start tracking stock."}
              action={!q && <Button onClick={create}>New</Button>}
            />
          </div>
        ) : view === "list" ? (
          <div className="erp-panel overflow-x-auto">
            <table className="erp-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Contact</th>
                  <th>Schedule date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer"
                    onClick={() => navigate({ to: "/operations/$id", params: { id: o.id } })}
                  >
                    <td>
                      <Link to="/operations/$id" params={{ id: o.id }} className="font-medium text-foreground hover:text-primary">
                        {o.ref}
                      </Link>
                    </td>
                    <td>{o.from}</td>
                    <td>{o.to}</td>
                    <td>{o.contact || <span className="text-muted-foreground">—</span>}</td>
                    <td className={cn(isLate(o) && "font-medium text-destructive")}>{o.scheduleDate}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {kanbanCols.map((c) => {
              const items = rows.filter((o) => o.status === c);
              return (
                <section key={c} className="w-64 shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <StatusBadge status={c} />
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((o) => (
                      <Link
                        key={o.id}
                        to="/operations/$id"
                        params={{ id: o.id }}
                        className="erp-panel block p-3 transition-colors hover:border-border-strong"
                      >
                        <div className="font-medium">{o.ref}</div>
                        <div className="text-sm text-muted-foreground">{o.contact || "No contact"}</div>
                        <div className={cn("mt-2 text-xs", isLate(o) ? "text-destructive" : "text-muted-foreground")}>
                          {o.scheduleDate}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}
