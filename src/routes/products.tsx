import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { actions, formatINR, useStore, type Product } from "@/lib/inventory";
import { PageBody, PageHeader } from "@/components/erp/common";
import { RecordDialog } from "@/components/erp/RecordDialog";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — StockSense" },
      { name: "description", content: "Product catalogue with SKU, cost and on-hand stock." },
      { property: "og:title", content: "Products — StockSense" },
      { property: "og:description", content: "Product catalogue with SKU, cost and on-hand stock." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const products = useStore((s) => s.products);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);

  return (
    <>
      <PageHeader title="Products" breadcrumb="Inventory" actions={<Button onClick={() => setEditing(null)}>New</Button>} />
      <PageBody>
        <div className="erp-panel overflow-x-auto">
          <table className="erp-table min-w-[560px]">
            <thead>
              <tr>
                <th>Internal reference</th>
                <th>Name</th>
                <th className="text-right">Cost</th>
                <th className="text-right">On hand</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="cursor-pointer" onClick={() => setEditing(p)}>
                  <td className="font-medium">{p.sku}</td>
                  <td>{p.name}</td>
                  <td className="text-right tabular-nums">{formatINR(p.cost)}</td>
                  <td className={`text-right tabular-nums ${p.onHand <= 0 ? "font-medium text-destructive" : ""}`}>
                    {p.onHand}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageBody>
      <RecordDialog
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
        title={editing ? `Edit ${editing.name}` : "New product"}
        fields={[
          { name: "sku", label: "Internal reference", required: true },
          { name: "name", label: "Name", required: true },
          { name: "cost", label: "Per unit cost (₹)", type: "number", required: true },
        ]}
        initial={{ sku: editing?.sku ?? "", name: editing?.name ?? "", cost: String(editing?.cost ?? "") }}
        onSave={(v) => {
          actions.saveProduct({
            id: editing?.id,
            sku: v.sku.toUpperCase(),
            name: v.name,
            cost: Number(v.cost) || 0,
            onHand: editing?.onHand ?? 0,
          });
          toast.success("Product saved");
          setEditing(undefined);
        }}
      />
    </>
  );
}
