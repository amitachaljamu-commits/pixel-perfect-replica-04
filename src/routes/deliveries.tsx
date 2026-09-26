import { createFileRoute } from "@tanstack/react-router";
import { OperationsList } from "@/components/erp/OperationsList";

export const Route = createFileRoute("/deliveries")({
  head: () => ({
    meta: [
      { title: "Deliveries — StockSense" },
      { name: "description", content: "Outgoing delivery orders to customers." },
      { property: "og:title", content: "Deliveries — StockSense" },
      { property: "og:description", content: "Outgoing delivery orders to customers." },
    ],
  }),
  component: () => <OperationsList type="OUT" />,
});
