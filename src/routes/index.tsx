import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, type LucideIcon } from "lucide-react";
import { isLate, today, useStore, formatINR, type OpType } from "@/lib/inventory";
import { PageBody, PageHeader, StatusBadge } from "@/components/erp/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StockSense" },
      { name: "description", content: "Today's receipts, deliveries, late and waiting operations at a glance." },
      { property: "og:title", content: "Dashboard — StockSense" },
      { property: "og:description", content: "Today's receipts, deliveries, late and waiting operations at a glance." },
    ],
  }),
  component: Dashboard,
});

function OpCard({ type, icon: Icon }: { type: OpType; icon: LucideIcon }) {
  const ops = useStore((s) => s.operations.filter((o) => o.type === type));
  const open = ops.filter((o) => o.status !== "done" && o.status !== "cancelled");
  const ready = open.filter((o) => o.status === "ready").length;
  const late = open.filter(isLate).length;
  const waiting = open.filter((o) => o.status === "waiting").length;
  const upcoming = open.filter((o) => o.scheduleDate > today()).length;
  const isIn = type === "IN";
  const to = isIn ? "/receipts" : "/deliveries";

  return (
    <section className="erp-panel flex flex-col p-5">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" aria-hidden />
        <h2 className="text-base font-semibold">{isIn ? "Receipt" : "Delivery"}</h2>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <Button asChild>
          <Link to={to}>
            {ready} to {isIn ? "receive" : "deliver"}
          </Link>
        </Button>
        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1 text-sm">
          <dt className="text-right font-semibold text-destructive">{late}</dt>
          <dd className="text-destructive">Late</dd>
          {!isIn && (
            <>
              <dt className="text-right font-semibold text-warning">{waiting}</dt>
              <dd className="text-warning">Waiting</dd>
            </>
          )}
          <dt className="text-right font-semibold">{upcoming}</dt>
          <dd className="text-muted-foreground">Operations</dd>
        </dl>
      </div>
    </section>
  );
}

function Dashboard() {
  const products = useStore((s) => s.products);
  const ops = useStore((s) => s.operations);
  const moves = useStore((s) => s.moves);
  const value = products.reduce((a, p) => a + p.cost * p.onHand, 0);
  const outOfStock = products.filter((p) => p.onHand <= 0).length;
  const recent = ops.slice(0, 6);

  const kpis = [
    { label: "Stock value", value: formatINR(value) },
    { label: "Products", value: products.length },
    { label: "Out of stock", value: outOfStock, tone: outOfStock ? "text-destructive" : "" },
    { label: "Moves recorded", value: moves.length },
  ];

  return (
    <>
      <PageHeader title="Dashboard" breadcrumb="Inventory overview" />
      <PageBody className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <OpCard type="IN" icon={ArrowDownToLine} />
          <OpCard type="OUT" icon={ArrowUpFromLine} />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="erp-panel p-4">
              <div className="text-xs font-medium text-muted-foreground">{k.label}</div>
              <div className={`mt-1 text-2xl font-semibold ${k.tone ?? ""}`}>{k.value}</div>
            </div>
          ))}
        </div>
        <section className="erp-panel overflow-x-auto">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Recent operations</h2>
            <Link to="/move-history" className="text-sm font-medium text-link hover:underline">
              View move history
            </Link>
          </div>
          <table className="erp-table min-w-[600px]">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Contact</th>
                <th>Schedule date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to="/operations/$id" params={{ id: o.id }} className="font-medium hover:text-primary">
                      {o.ref}
                    </Link>
                  </td>
                  <td>{o.contact || "—"}</td>
                  <td className={isLate(o) ? "font-medium text-destructive" : ""}>{o.scheduleDate}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <p className="text-xs text-muted-foreground">
          Late: scheduled date before today · Operations: scheduled after today · Waiting: waiting for stock
        </p>
      </PageBody>
    </>
  );
}
