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
import Table from "../../../lib/AppTable";
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
            <Table
              striped
              highlightOnHover
              verticalSpacing="sm"
              style={{
                width: "100%",
                border: "1px solid rgba(0,0,0,0.06)",
                borderCollapse: "collapse",
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ textAlign: "left" }}>Number</Table.Th>
                  <Table.Th style={{ textAlign: "left" }}>Date</Table.Th>
                  <Table.Th style={{ textAlign: "left" }}>Customer</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
                  <Table.Th style={{ textAlign: "left" }}>Status</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {returns.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td style={{ fontFamily: "monospace" }}>
                      {r.returnNumber}
                    </Table.Td>
                    <Table.Td>{formatDate(r.returnDate)}</Table.Td>
                    <Table.Td>{r.customerName}</Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      {formatCurrency(r.totalAmount)}
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline">{r.status}</Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Button
                        variant="subtle"
                        leftSection={<IconArrowBackUp />}
                      >
                        Open
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
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
