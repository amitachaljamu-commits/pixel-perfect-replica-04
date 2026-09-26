import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { actions, useStore, type Warehouse } from "@/lib/inventory";
import { PageBody, PageHeader } from "@/components/erp/common";
import { RecordDialog } from "@/components/erp/RecordDialog";

export const Route = createFileRoute("/settings/warehouses")({
  head: () => ({
    meta: [
      { title: "Warehouses — StockSense" },
      { name: "description", content: "Warehouse names, short codes and addresses." },
      { property: "og:title", content: "Warehouses — StockSense" },
      { property: "og:description", content: "Warehouse names, short codes and addresses." },
    ],
  }),
  component: WarehousesPage,
});

function WarehousesPage() {
  const warehouses = useStore((s) => s.warehouses);
  const [editing, setEditing] = useState<Warehouse | null | undefined>(undefined);
  return (
    <>
      <PageHeader title="Warehouses" breadcrumb="Settings" actions={<Button onClick={() => setEditing(null)}>New</Button>} />
      <PageBody>
        <div className="erp-panel overflow-x-auto">
          <table className="erp-table min-w-[560px]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Short code</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id} className="cursor-pointer" onClick={() => setEditing(w)}>
                  <td className="font-medium">{w.name}</td>
                  <td>{w.code}</td>
                  <td>{w.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageBody>
      <RecordDialog
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
        title={editing ? "Edit warehouse" : "New warehouse"}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "code", label: "Short code", required: true },
          { name: "address", label: "Address" },
        ]}
        initial={{ name: editing?.name ?? "", code: editing?.code ?? "", address: editing?.address ?? "" }}
        onSave={(v) => {
          actions.saveWarehouse({ id: editing?.id, name: v.name, code: v.code.toUpperCase(), address: v.address });
          toast.success("Warehouse saved");
          setEditing(undefined);
        }}
      />
    </>
  );
}
