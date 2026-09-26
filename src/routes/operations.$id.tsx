import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ChevronRight, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { actions, freeQty, useStore, type OpStatus } from "@/lib/inventory";
import { EmptyState, PageBody, PageHeader } from "@/components/erp/common";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operations/$id")({
  head: () => ({
    meta: [
      { title: "Operation — StockSense" },
      { name: "description", content: "Receipt or delivery details, products and validation." },
      { property: "og:title", content: "Operation — StockSense" },
      { property: "og:description", content: "Receipt or delivery details, products and validation." },
    ],
  }),
  component: OperationDetail,
});

function Steps({ steps, current }: { steps: OpStatus[]; current: OpStatus }) {
  const idx = steps.indexOf(current);
  return (
    <ol className="flex items-center overflow-hidden rounded-md border border-border text-xs font-medium" aria-label="Status">
      {steps.map((s, i) => (
        <li
          key={s}
          aria-current={s === current ? "step" : undefined}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 capitalize",
            s === current ? "bg-primary text-primary-foreground" : i < idx ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {s}
          {i < steps.length - 1 && <ChevronRight className="size-3 opacity-60" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function OperationDetail() {
  const { id } = Route.useParams();
  const op = useStore((s) => s.operations.find((o) => o.id === id));
  const products = useStore((s) => s.products);
  const locations = useStore((s) => s.locations);
  const warehouses = useStore((s) => s.warehouses);
  const free = useStore((s) => (op ? Object.fromEntries(op.lines.map((l) => [l.productId, freeQty(s, l.productId, op.id)])) : {}));

  if (!op) {
    return (
      <PageBody>
        <div className="erp-panel">
          <EmptyState title="Operation not found" action={<Button asChild><Link to="/">Back to dashboard</Link></Button>} />
        </div>
      </PageBody>
    );
  }

  const isIn = op.type === "IN";
  const editable = op.status === "draft" || op.status === "waiting";
  const locked = op.status === "done" || op.status === "cancelled";
  const steps: OpStatus[] = isIn ? ["draft", "ready", "done"] : ["draft", "waiting", "ready", "done"];
  const update = (patch: Parameters<typeof actions.updateOperation>[1]) => actions.updateOperation(op.id, patch);
  const locOptions = locations.map((l) => `${warehouses.find((w) => w.id === l.warehouseId)?.code ?? "WH"}/${l.code}`);

  const onValidate = () => {
    if (op.lines.length === 0) return toast.error("Add at least one product first.");
    if (op.status === "draft" || op.status === "waiting") {
      actions.markTodo(op.id);
      return toast.success(isIn ? "Marked as ready" : "Availability checked");
    }
    actions.validate(op.id);
    toast.success(`${op.ref} validated — stock updated`);
  };

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to={isIn ? "/receipts" : "/deliveries"} className="hover:text-primary">
            {isIn ? "Receipts" : "Deliveries"}
          </Link>
        }
        title={op.ref}
      />
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-4 py-2 md:px-6">
          {!locked && (
            <Button onClick={onValidate} disabled={op.status === "waiting" && !isIn ? false : undefined}>
              {op.status === "ready" ? "Validate" : op.status === "waiting" ? "Check availability" : "Mark as To Do"}
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()} disabled={op.status !== "done"}>
            <Printer className="size-4" /> Print
          </Button>
          {!locked && (
            <Button
              variant="outline"
              onClick={() => {
                actions.cancel(op.id);
                toast("Operation cancelled");
              }}
            >
              Cancel
            </Button>
          )}
          <div className="ml-auto">
            {op.status === "cancelled" ? (
              <span className="text-sm font-medium text-destructive">Cancelled</span>
            ) : (
              <Steps steps={steps} current={op.status} />
            )}
          </div>
        </div>
      </div>
      <PageBody>
        <div className="erp-panel mx-auto max-w-5xl p-5 md:p-8">
          <h2 className="text-2xl font-semibold">{op.ref}</h2>
          <div className="mt-6 grid gap-x-10 gap-y-4 md:grid-cols-2">
            <Field label={isIn ? "Receive from" : "Delivery address"}>
              <input
                className="erp-field-input"
                value={op.contact}
                disabled={locked}
                placeholder={isIn ? "Vendor name" : "Customer / address"}
                onChange={(e) => update({ contact: e.target.value })}
              />
            </Field>
            <Field label="Schedule date">
              <input
                type="date"
                className="erp-field-input"
                value={op.scheduleDate}
                disabled={locked}
                onChange={(e) => update({ scheduleDate: e.target.value })}
              />
            </Field>
            <Field label="Responsible">
              <input
                className="erp-field-input"
                value={op.responsible}
                disabled={locked}
                onChange={(e) => update({ responsible: e.target.value })}
              />
            </Field>
            <Field label={isIn ? "Destination location" : "Source location"}>
              <select
                className="erp-field-input"
                value={isIn ? op.to : op.from}
                disabled={locked}
                onChange={(e) => update(isIn ? { to: e.target.value } : { from: e.target.value })}
              >
                {locOptions.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
          </div>

          <h3 className="mt-8 border-b border-border pb-2 text-sm font-semibold">Products</h3>
          <div className="overflow-x-auto">
            <table className="erp-table min-w-[480px]">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="w-32 text-right">Quantity</th>
                  {!isIn && <th className="w-32 text-right">Free to use</th>}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {op.lines.map((l, i) => {
                  const short = !isIn && !locked && l.qty > (free[l.productId] ?? 0);
                  return (
                    <tr key={i} className={cn(short && "bg-danger-bg")}>
                      <td>
                        <select
                          className="erp-field-input border-0"
                          value={l.productId}
                          disabled={!editable}
                          aria-label="Product"
                          onChange={(e) =>
                            update({ lines: op.lines.map((x, j) => (j === i ? { ...x, productId: e.target.value } : x)) })
                          }
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.sku}] {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          min={1}
                          aria-label="Quantity"
                          className={cn("erp-field-input border-0 text-right", short && "font-semibold text-destructive")}
                          value={l.qty}
                          disabled={!editable}
                          onChange={(e) =>
                            update({
                              lines: op.lines.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x)),
                            })
                          }
                        />
                      </td>
                      {!isIn && (
                        <td className={cn("text-right", short && "text-destructive")}>
                          <span className="inline-flex items-center gap-1">
                            {short && <AlertTriangle className="size-3.5" aria-label="Not enough stock" />}
                            {free[l.productId] ?? 0}
                          </span>
                        </td>
                      )}
                      <td>
                        {editable && (
                          <button
                            aria-label="Remove line"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => update({ lines: op.lines.filter((_, j) => j !== i) })}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {editable && products.length > 0 && (
            <button
              className="mt-2 px-3 py-1 text-sm font-medium text-link hover:underline"
              onClick={() => update({ lines: [...op.lines, { productId: products[0].id, qty: 1 }] })}
            >
              Add a product
            </button>
          )}
          {!isIn && op.lines.some((l) => !locked && l.qty > (free[l.productId] ?? 0)) && (
            <p className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-danger-bg px-3 py-2 text-sm text-destructive" role="alert">
              <AlertTriangle className="size-4" /> Some products are not in stock. This delivery will wait until stock arrives.
            </p>
          )}
        </div>
      </PageBody>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 md:grid-cols-[160px_1fr] md:items-center">
      <span className="erp-label">{label}</span>
      {children}
    </label>
  );
}
