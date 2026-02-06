import { useMemo, useState } from "react";
import {
  Title,
  Text,
  Select,
  Group,
  Button,
  Card,
  TextInput,
} from "@mantine/core";
import { IconPrinter } from "@tabler/icons-react";
import Table from "../../../lib/AppTable";
import { useDataContext } from "../../Context/DataContext";
import type {
  SaleRecord,
  PurchaseInvoiceRecord,
} from "../../Context/DataContext";
import { formatCurrency } from "../../../lib/format-utils";
import { generateStockLedgerHTML } from "../../../components/print/stockLedgerTemplate.ts";

export default function StockLedger() {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const {
    inventory = [],
    sales = [],
    purchaseInvoices = [],
  } = useDataContext();

  const selectedProduct = useMemo(
    () => inventory.find((p) => String(p._id) === selectedProductId),
    [inventory, selectedProductId]
  );

  const movements = useMemo(() => {
    if (!selectedProduct) return [];

    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;

    const inRange = (d: Date | string | undefined) => {
      if (!d) return false;
      const dt = d instanceof Date ? d : new Date(d);
      if (isNaN(dt.getTime())) return false;
      if (start && dt < start) return false;
      if (end && dt > end) return false;
      return true;
    };

    type Movement = {
      date: string;
      dateObj: Date;
      type: string;
      refNo: string;
      qtyIn: number;
      qtyOut: number;
      rate: number;
      balance: number;
    };

    const movementList: Movement[] = [];

    // Add purchases
    purchaseInvoices.forEach((p: PurchaseInvoiceRecord) => {
      if (!inRange(p.invoiceDate)) return;
      if (!p.products || !Array.isArray(p.products)) return;

      p.products.forEach((product: any) => {
        if (String(product._id) === selectedProductId) {
          const qty = product.quantity || 0;
          movementList.push({
            date: p.invoiceDate as string,
            dateObj: new Date(p.invoiceDate || 0),
            type: "Purchase",
            refNo: p.purchaseInvoiceNumber || String(p.id) || "-",
            qtyIn: qty,
            qtyOut: 0,
            rate: product.rate || 0,
            balance: 0, // Will calculate after sorting
          });
        }
      });
    });

    // Add sales
    const salesArray: SaleRecord[] = Array.isArray(sales) ? sales : [];
    salesArray.forEach((s: SaleRecord) => {
      const dateVal = s.invoiceDate || s.date || s.quotationDate;
      if (!inRange(dateVal)) return;
      if (!s.products || !Array.isArray(s.products)) return;

      s.products.forEach((product: any) => {
        if (String(product._id) === selectedProductId) {
          const qty = product.quantity || 0;
          movementList.push({
            date: dateVal as string,
            dateObj: new Date(dateVal || 0),
            type: "Sale",
            refNo: s.invoiceNumber || String(s.id) || "-",
            qtyIn: 0,
            qtyOut: qty,
            rate: product.rate || product.salesRate || 0,
            balance: 0, // Will calculate after sorting
          });
        }
      });
    });

    // Sort by date first
    movementList.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    // Calculate running balance after sorting
    let runningBalance = selectedProduct.openingStock || 0;
    movementList.forEach((m) => {
      runningBalance += m.qtyIn - m.qtyOut;
      m.balance = runningBalance;
    });

    return movementList;
  }, [selectedProduct, selectedProductId, sales, purchaseInvoices, fromDate, toDate]);

  const handlePrint = () => {
    if (!selectedProduct) return;

    const openingStock = selectedProduct.openingStock || 0;
    const closingStock = movements.length > 0 ? movements[movements.length - 1].balance : openingStock;

    const html = generateStockLedgerHTML({
      productName: selectedProduct.itemName || "Unknown Product",
      productCode: String(selectedProduct._id),
      category: selectedProduct.category || "-",
      unit: selectedProduct.unit || "pcs",
      fromDate,
      toDate,
      openingStock,
      closingStock,
      movements: movements.map((m) => ({
        date: m.date,
        type: m.type,
        refNo: m.refNo,
        qtyIn: m.qtyIn,
        qtyOut: m.qtyOut,
        rate: m.rate,
        balance: m.balance,
      })),
    });

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <Title order={3}>Stock Ledger</Title>
          <Text size="sm" c="dimmed">
            Product-wise stock movement history
          </Text>
        </div>
        <Button
          leftSection={<IconPrinter size={16} />}
          onClick={handlePrint}
          disabled={!selectedProduct || movements.length === 0}
        >
          Print
        </Button>
      </div>

      <Card withBorder padding="md" style={{ marginBottom: 16 }}>
        <Group align="flex-end">
          <Select
            label="Select Product"
            placeholder="Choose a product"
            value={selectedProductId}
            onChange={(val) => { setSelectedProductId(val || ""); }}
            data={inventory.map((p) => ({
              value: String(p._id),
              label: `${p.itemName} - ${p.category || ""} (${p.color || ""})`,
            }))}
            searchable
            style={{ flex: 1, minWidth: 300 }}
          />
          <TextInput
            type="date"
            label="From Date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.currentTarget.value); }}
            style={{ minWidth: 140 }}
          />
          <TextInput
            type="date"
            label="To Date"
            value={toDate}
            onChange={(e) => { setToDate(e.currentTarget.value); }}
            style={{ minWidth: 140 }}
          />
          <Button
            variant="light"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
          >
            Clear Dates
          </Button>
        </Group>
      </Card>

      {selectedProduct && (
        <Card withBorder padding="md" style={{ marginBottom: 16 }}>
          <Group>
            <div>
              <Text size="sm" c="dimmed">Product Name</Text>
              <Text fw={600}>{selectedProduct.itemName}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Category</Text>
              <Text fw={600}>{selectedProduct.category || "-"}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Color</Text>
              <Text fw={600}>{selectedProduct.color || "-"}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Opening Stock</Text>
              <Text fw={600}>{selectedProduct.openingStock || 0} {selectedProduct.unit || "pcs"}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Current Balance</Text>
              <Text fw={600} c="blue">
                {movements.length > 0 ? movements[movements.length - 1].balance : selectedProduct.openingStock || 0} {selectedProduct.unit || "pcs"}
              </Text>
            </div>
          </Group>
        </Card>
      )}

      {selectedProduct && movements.length > 0 && (
        <div className="app-table-wrapper" style={{ maxHeight: '50vh', overflow: 'auto' }}>
          <Table withRowBorders withColumnBorders withTableBorder>
          <Table.Thead style={{ backgroundColor: "#f1f3f5" }}>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Ref No</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Qty In</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Qty Out</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Rate</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Balance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr style={{ backgroundColor: "#fff3bf" }}>
              <Table.Td colSpan={6} style={{ fontWeight: 600 }}>Opening Stock</Table.Td>
              <Table.Td style={{ textAlign: "right", fontWeight: 600 }}>
                {selectedProduct.openingStock || 0}
              </Table.Td>
            </Table.Tr>
            {movements.map((m, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>
                  {(() => {
                    try {
                      const d = new Date(m.date);
                      return isNaN(d.getTime()) ? m.date : d.toLocaleDateString();
                    } catch {
                      return m.date;
                    }
                  })()}
                </Table.Td>
                <Table.Td>
                  <span
                    style={{
                      color: m.type === "Purchase" ? "#2b8a3e" : "#c92a2a",
                      fontWeight: 600,
                    }}
                  >
                    {m.type}
                  </span>
                </Table.Td>
                <Table.Td>{m.refNo}</Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {m.qtyIn > 0 ? m.qtyIn : "-"}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {m.qtyOut > 0 ? m.qtyOut : "-"}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatCurrency(m.rate)}
                </Table.Td>
                <Table.Td style={{ textAlign: "right", fontWeight: 600 }}>
                  {m.balance}
                </Table.Td>
              </Table.Tr>
            ))}
            <Table.Tr style={{ backgroundColor: "#e7f5ff" }}>
              <Table.Td colSpan={6} style={{ fontWeight: 600 }}>Closing Stock</Table.Td>
              <Table.Td style={{ textAlign: "right", fontWeight: 700, color: "#1e3a8a" }}>
                {movements[movements.length - 1].balance}
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
          </Table>
        </div>
      )}

      {selectedProduct && movements.length === 0 && (
        <Card withBorder padding="xl" style={{ textAlign: "center" }}>
          <Text c="dimmed">No stock movements found for the selected date range</Text>
        </Card>
      )}

      {!selectedProduct && (
        <Card withBorder padding="xl" style={{ textAlign: "center" }}>
          <Text c="dimmed">Please select a product to view stock ledger</Text>
        </Card>
      )}
    </div>
  );
}
