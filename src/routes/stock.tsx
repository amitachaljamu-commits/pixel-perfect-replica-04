import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { actions, formatINR, freeQty, useStore } from "@/lib/inventory";
import { PageBody, PageHeader } from "@/components/erp/common";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stock")({
  head: () => ({
    meta: [
      { title: "Stock — StockSense" },
      { name: "description", content: "Available stock per product with on-hand and free-to-use quantities." },
      { property: "og:title", content: "Stock — StockSense" },
      { property: "og:description", content: "Available stock per product with on-hand and free-to-use quantities." },
    ],
  }),
  component: StockPage,
});

function StockPage() {
  const products = useStore((s) => s.products);
  const free = useStore((s) => Object.fromEntries(s.products.map((p) => [p.id, freeQty(s, p.id)])));
  const [q, setQ] = useState("");
  const rows = products.filter((p) => `${p.sku} ${p.name}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Stock" breadcrumb="Inventory">
        <label className="relative">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-8 w-60 rounded-md border border-input bg-surface pl-8 pr-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </PageHeader>
      <PageBody>
        <div className="erp-panel overflow-x-auto">
          <table className="erp-table min-w-[640px]">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-right">Per unit cost</th>
                <th className="w-36 text-right">On hand</th>
                <th className="text-right">Free to use</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="text-muted-foreground">[{p.sku}]</span> {p.name}
                  </td>
                  <td className="text-right tabular-nums">{formatINR(p.cost)}</td>
                  <td className="text-right">
                    <input
                      type="number"
                      min={0}
                      defaultValue={p.onHand}
                      key={p.onHand}
                      aria-label={`On hand quantity for ${p.name}`}
                      className="erp-field-input w-24 text-right tabular-nums"
                      onBlur={(e) => {
                        const v = Math.max(0, Number(e.target.value) || 0);
                        if (v !== p.onHand) {
                          actions.adjustStock(p.id, v);
                          toast.success(`${p.name} adjusted to ${v}`);
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    />
                  </td>
                  <td className={cn("text-right tabular-nums", free[p.id] <= 0 && "font-medium text-destructive")}>
                    {free[p.id]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Edit "On hand" to record an inventory adjustment. Free to use excludes stock reserved by ready deliveries.
        </p>
      </PageBody>
    </>
  );
}
