import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/lib/inventory";
import { EmptyState, PageBody, PageHeader } from "@/components/erp/common";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/move-history")({
  head: () => ({
    meta: [
      { title: "Move History — StockSense" },
      { name: "description", content: "Every stock move between locations, in and out." },
      { property: "og:title", content: "Move History — StockSense" },
      { property: "og:description", content: "Every stock move between locations, in and out." },
    ],
  }),
  component: MoveHistory,
});

function MoveHistory() {
  const moves = useStore((s) => s.moves);
  const products = useStore((s) => s.products);
  const [q, setQ] = useState("");
  const name = (id: string) => products.find((p) => p.id === id)?.name ?? "—";
  const rows = moves.filter((m) => `${m.ref} ${m.contact}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Move History" breadcrumb="Inventory">
        <label className="relative">
          <span className="sr-only">Search by reference or contact</span>
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reference or contact…"
            className="h-8 w-64 rounded-md border border-input bg-surface pl-8 pr-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </PageHeader>
      <PageBody>
        <div className="erp-panel overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState title="No moves yet" description="Validated receipts, deliveries and adjustments appear here." />
          ) : (
            <table className="erp-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Contact</th>
                  <th>Product</th>
                  <th>From</th>
                  <th>To</th>
                  <th className="text-right">Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.ref}</td>
                    <td>{m.date}</td>
                    <td>{m.contact}</td>
                    <td>{name(m.productId)}</td>
                    <td>{m.from}</td>
                    <td>{m.to}</td>
                    <td
                      className={cn(
                        "text-right font-medium tabular-nums",
                        m.direction === "in" ? "text-success" : "text-destructive",
                      )}
                    >
                      {m.direction === "in" ? "+" : "−"}
                      {m.qty}
                    </td>
                    <td>
                      <span className="text-xs font-medium text-success">Done</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </PageBody>
    </>
  );
}
