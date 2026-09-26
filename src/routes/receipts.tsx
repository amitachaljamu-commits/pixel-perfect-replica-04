import { createFileRoute } from "@tanstack/react-router";
import { OperationsList } from "@/components/erp/OperationsList";

export const Route = createFileRoute("/receipts")({
  head: () => ({
    meta: [
      { title: "Receipts — StockSense" },
      { name: "description", content: "Incoming stock receipts from vendors." },
      { property: "og:title", content: "Receipts — StockSense" },
      { property: "og:description", content: "Incoming stock receipts from vendors." },
    ],
  }),
  component: () => <OperationsList type="IN" />,
});
