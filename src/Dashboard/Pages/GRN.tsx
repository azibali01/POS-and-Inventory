import { useState } from "react";
import { useDataContext } from "../Context/DataContext";
import {
  Title,
  Card,
  Group,
  TextInput,
  Button,
  Table,
  Notification,
  Divider,
  Stack,
  Textarea,
} from "@mantine/core";

// Row type for received items
type Row = {
  item: string; // inventory item id as string
  qty: string;
  unit: string;
  remarks: string;
};

type GRNRecord = {
  grnNo: string;
  supplier: string;
  poNumber: string;
  reference: string;
  date: string;
  items: Row[];
  remarks: string;
};

export default function GRN() {
  // GRN records state (in-memory for now)
  const [grnRecords, setGrnRecords] = useState<GRNRecord[]>([]);
  // Auto-generate GRN number
  const [grnNo, setGrnNo] = useState(() => {
    const last = localStorage.getItem("lastGRNNo");
    let next = 1;
    if (last && last.startsWith("GRN-")) {
      next = parseInt(last.replace("GRN-", "")) + 1;
    }
    return `GRN-${next.toString().padStart(3, "0")}`;
  });
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const { inventory, setInventory } = useDataContext();
  const [supplierName, setSupplierName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [rows, setRows] = useState<Row[]>([
    { item: "", qty: "", unit: "", remarks: "" },
  ]);
  const [grnRemarks, setGrnRemarks] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { item: "", qty: "", unit: "", remarks: "" }]);
  };
  const handleDeleteRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };
  const handleChange = (idx: number, field: keyof Row, value: string) => {
    const updated = [...rows];
    updated[idx][field] = value;
    setRows(updated);
  };
  const handleSave = () => {
    if (
      !supplierName ||
      !date ||
      !poNumber ||
      rows.length === 0 ||
      !rows.some((r) => r.item)
    ) {
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 2000);
      return;
    }
    // Update inventory stock for each item
    setInventory((prev) =>
      prev.map((inv) => {
        const grnRow = rows.find((r) => r.item === String(inv.id));
        if (grnRow) {
          const addQty = parseFloat(grnRow.qty) || 0;
          return { ...inv, stock: inv.stock + addQty };
        }
        return inv;
      })
    );
    // Save GRN record
    setGrnRecords((prev) => [
      ...prev,
      {
        grnNo,
        supplier: supplierName,
        poNumber,
        reference,
        date,
        items: rows.map((r) => ({ ...r })),
        remarks: grnRemarks,
      },
    ]);
    // Increment GRN number for next entry
    const nextNo = parseInt(grnNo.replace("GRN-", "")) + 1;
    const nextGRN = `GRN-${nextNo.toString().padStart(3, "0")}`;
    setGrnNo(nextGRN);
    localStorage.setItem("lastGRNNo", nextGRN);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2000);
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="xl">
      <Title order={2} mb="md">
        Goods Receipt Note (GRN)
      </Title>
      <Stack gap="md">
        <Group grow>
          <TextInput label="GRN No." value={grnNo} readOnly />
          <TextInput
            label="Supplier Name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="PO Number"
            value={poNumber}
            onChange={(e) => setPoNumber(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Reference No."
            value={reference}
            onChange={(e) => setReference(e.currentTarget.value)}
          />
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            required
          />
        </Group>
        <Divider />
        <Table withColumnBorders highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th>Qty</Table.Th>
              <Table.Th>Unit</Table.Th>
              <Table.Th>Remarks</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>
                  <select
                    value={row.item}
                    onChange={(e) => handleChange(idx, "item", e.target.value)}
                    style={{ width: "100%", minWidth: 120, padding: 4 }}
                  >
                    <option value="">Select Item</option>
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.code})
                      </option>
                    ))}
                  </select>
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.qty}
                    onChange={(e) =>
                      handleChange(idx, "qty", e.currentTarget.value)
                    }
                    placeholder="Qty"
                    size="xs"
                    type="number"
                    min={0}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.unit}
                    onChange={(e) =>
                      handleChange(idx, "unit", e.currentTarget.value)
                    }
                    placeholder="Unit"
                    size="xs"
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.remarks}
                    onChange={(e) =>
                      handleChange(idx, "remarks", e.currentTarget.value)
                    }
                    placeholder="Remarks"
                    size="xs"
                  />
                </Table.Td>
                <Table.Td>
                  <Button
                    color="red"
                    size="xs"
                    variant="light"
                    onClick={() => handleDeleteRow(idx)}
                    disabled={rows.length === 1}
                  >
                    Delete
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Button onClick={handleAddRow} variant="light" color="blue" mt="xs">
          Add Item
        </Button>
        <Textarea
          label="GRN Remarks"
          value={grnRemarks}
          onChange={(e) => setGrnRemarks(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Group gap="md" mt="md">
          <Button color="green" onClick={handleSave}>
            Save GRN
          </Button>
          <Button color="blue" variant="outline">
            Print/Export
          </Button>
        </Group>
        {showNotif && (
          <Notification color="red" onClose={() => setShowNotif(false)} mt="md">
            Please fill all required fields and add at least one item.
          </Notification>
        )}
      </Stack>
      <Divider my="xl" label="GRN Records & Reporting" labelPosition="center" />
      {/* Filters */}
      <Group mb="md">
        <TextInput
          label="Supplier"
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.currentTarget.value)}
          placeholder="Filter by supplier"
        />
        <TextInput
          label="From Date"
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.currentTarget.value)}
        />
        <TextInput
          label="To Date"
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.currentTarget.value)}
        />
        <Button
          color="blue"
          variant="outline"
          onClick={() => {
            setFilterSupplier("");
            setFilterFrom("");
            setFilterTo("");
          }}
        >
          Clear
        </Button>
        <Button color="blue" variant="outline">
          Export/Print
        </Button>
      </Group>
      {/* GRN Records Table */}
      <Table withColumnBorders highlightOnHover striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>GRN No.</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Supplier</Table.Th>
            <Table.Th>PO Number</Table.Th>
            <Table.Th>Reference</Table.Th>
            <Table.Th>Total Items</Table.Th>
            <Table.Th>Remarks</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {grnRecords
            .filter(
              (r) =>
                (!filterSupplier ||
                  r.supplier
                    .toLowerCase()
                    .includes(filterSupplier.toLowerCase())) &&
                (!filterFrom || r.date >= filterFrom) &&
                (!filterTo || r.date <= filterTo)
            )
            .map((rec, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>{rec.grnNo}</Table.Td>
                <Table.Td>{rec.date}</Table.Td>
                <Table.Td>{rec.supplier}</Table.Td>
                <Table.Td>{rec.poNumber}</Table.Td>
                <Table.Td>{rec.reference}</Table.Td>
                <Table.Td>{rec.items.length}</Table.Td>
                <Table.Td>{rec.remarks}</Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
      {/* Analytics summary */}
      <Divider my="md" label="Analytics" labelPosition="center" />
      <Group>
        <div>
          <b>Total GRNs:</b> {grnRecords.length}
        </div>
        <div>
          <b>Total Items Received:</b>{" "}
          {grnRecords.reduce((sum, r) => sum + r.items.length, 0)}
        </div>
      </Group>
    </Card>
  );
}
