import { useState } from "react";
import {
  Card,
  Group,
  Text,
  Title,
  Box,
  Button,
  Badge,
  Modal,
  ScrollArea,
} from "@mantine/core";
import SalesDocShell, {
  type SalesPayload,
} from "../../../components/sales/SalesDocShell";
import type { SaleRecord } from "../../Context/DataContext";
import { useDataContext } from "../../Context/DataContext";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import { IconPlus, IconArrowBackUp } from "@tabler/icons-react";

type ReturnRecord = {
  id: string | number;
  returnNumber: string;
  returnDate: string | Date;
  customerName: string;
  totalAmount: number;
  status: string;
};

const sampleReturns: ReturnRecord[] = [];

export default function SaleReturnPage() {
  const [returns] = useState<ReturnRecord[]>(sampleReturns);
  const { customers, inventory, setSales } = useDataContext();
  const [open, setOpen] = useState(false);

  // no external numbering required for now

  return (
    <div>
      <Group mb="md" style={{ justifyContent: "space-between" }}>
        <div>
          <Title order={2}>Sales Returns</Title>
          <Text color="dimmed">Create and manage sales returns</Text>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button leftSection={<IconPlus />} onClick={() => setOpen(true)}>
            New Return
          </Button>
        </div>
      </Group>

      <Card shadow="sm">
        <Box p="md">
          <Title order={4}>Recent Returns</Title>
          <Text color="dimmed">Last {returns.length} returns</Text>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Number</th>
                  <th style={{ textAlign: "left" }}>Date</th>
                  <th style={{ textAlign: "left" }}>Customer</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: "monospace" }}>
                      {r.returnNumber}
                    </td>
                    <td>{formatDate(r.returnDate)}</td>
                    <td>{r.customerName}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatCurrency(r.totalAmount)}
                    </td>
                    <td>
                      <Badge variant="outline">{r.status}</Badge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Button
                        variant="subtle"
                        leftSection={<IconArrowBackUp />}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      </Card>

      <Modal opened={open} onClose={() => setOpen(false)} size="70%">
        <ScrollArea style={{ height: "75vh" }}>
          <SalesDocShell
            mode="Invoice"
            customers={customers}
            products={inventory}
            showImportIssues={false}
            onSubmit={(payload: SalesPayload) => {
              // create a return record in-memory (mirror invoice creation)
              const retId = `ret-${Date.now()}`;
              const returnDate = payload.docDate || new Date().toISOString();
              const customerName =
                customers.find(
                  (c) => String(c.id) === String(payload.customerId)
                )?.name ?? String(payload.customerId);
              const saleRecord: SaleRecord = {
                id: retId,
                date: returnDate,
                customer: customerName,
                items:
                  payload.items?.map((it) => ({
                    sku: it.productId || it.productName,
                    quantity: it.quantity,
                    price: it.rate,
                  })) ?? [],
                total: payload.totals.total,
                status: "pending",
              };

              if (typeof setSales === "function") {
                setSales((prev) => [saleRecord, ...prev]);
              }

              setOpen(false);
            }}
          />
        </ScrollArea>
      </Modal>
    </div>
  );
}
