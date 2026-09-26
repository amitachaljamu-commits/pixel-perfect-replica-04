import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { actions, useStore, type Location } from "@/lib/inventory";
import { PageBody, PageHeader } from "@/components/erp/common";
import { RecordDialog } from "@/components/erp/RecordDialog";

export const Route = createFileRoute("/settings/locations")({
  head: () => ({
    meta: [
      { title: "Locations — StockSense" },
      { name: "description", content: "Storage locations (rooms, racks) within each warehouse." },
      { property: "og:title", content: "Locations — StockSense" },
      { property: "og:description", content: "Storage locations (rooms, racks) within each warehouse." },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const locations = useStore((s) => s.locations);
  const warehouses = useStore((s) => s.warehouses);
  const [editing, setEditing] = useState<Location | null | undefined>(undefined);
  const wh = (id: string) => warehouses.find((w) => w.id === id);
  return (
    <>
      <PageHeader title="Locations" breadcrumb="Settings" actions={<Button onClick={() => setEditing(null)}>New</Button>} />
      <PageBody>
        <div className="erp-panel overflow-x-auto">
          <table className="erp-table min-w-[560px]">
            <thead>
              <tr>
                <th>Full name</th>
                <th>Name</th>
                <th>Short code</th>
                <th>Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.id} className="cursor-pointer" onClick={() => setEditing(l)}>
                  <td className="font-medium">
                    {wh(l.warehouseId)?.code}/{l.code}
                  </td>
                  <td>{l.name}</td>
                  <td>{l.code}</td>
                  <td>{wh(l.warehouseId)?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageBody>
      <RecordDialog
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
        title={editing ? "Edit location" : "New location"}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "code", label: "Short code", required: true },
          {
            name: "warehouseId",
            label: "Warehouse",
            type: "select",
            required: true,
            options: warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` })),
          },
        ]}
        initial={{
          name: editing?.name ?? "",
          code: editing?.code ?? "",
          warehouseId: editing?.warehouseId ?? warehouses[0]?.id ?? "",
        }}
        onSave={(v) => {
          actions.saveLocation({ id: editing?.id, name: v.name, code: v.code, warehouseId: v.warehouseId });
          toast.success("Location saved");
          setEditing(undefined);
        }}
      />
    </>
  );
}
