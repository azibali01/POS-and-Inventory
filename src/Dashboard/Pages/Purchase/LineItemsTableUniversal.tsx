
import { useMemo } from "react";
import { Button, NumberInput, TextInput, Select, Group } from "@mantine/core";
import Table from "../../../lib/AppTable";
import { Trash2 } from "lucide-react";
import type { PurchaseLineItem } from "./types";
import { formatCurrency } from "../../../lib/format-utils";
  import { useEffect } from "react";
export interface LineItemsTableUniversalProps {
  items: PurchaseLineItem[];
  setItems: (items: PurchaseLineItem[]) => void;
  inventory: {
    id?: string;
    _id?: string;
    itemName?: string;
    name?: string;
    unit?: string;
    salesRate?: number;
    color?: string;
    thickness?: string;
    length?: string | number;
  }[];
  colors: { name: string }[];
  allowNegativeQty?: boolean;
  editableRate?: boolean;
  showAmountCol?: boolean;
  addRowLabel?: string;
}

export function LineItemsTableUniversal({
  items,
  setItems,
  inventory,
  colors,
  allowNegativeQty = false,
  editableRate = true,
  showAmountCol = true,
  addRowLabel = "Add Item",
}: LineItemsTableUniversalProps) {
  const products = useMemo(
    () =>
      inventory.map((p) => ({
        id: String(p.id || p._id),
        name: p.itemName ?? p.name ?? "",
        unit: p.unit,
        salesRate: p.salesRate || 0,
        color: p.color,
        thickness: p.thickness,
        length: p.length,
      })),
    [inventory]
  );

  // Ensure at least one row is present on mount
  useEffect(() => {
    if (items.length === 0) {
      addRow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRow() {
    const p = products[0] ?? {
      id: "",
      name: "New Product",
      unit: "pcs",
      salesRate: 0,
      color: "",
      thickness: "",
      length: "",
    };
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        productId: p.id || "",
        productName: p.name || "",
        quantity: 1,
        rate: p.salesRate ?? 0,
        unit: typeof p.unit === "string" ? p.unit : String(p.unit ?? "pcs"),
        color: p.color ?? "",
        thickness: p.thickness ?? "",
        length: p.length ?? "",
        grossAmount: 0,
        percent: 0,
        discountAmount: 0,
        netAmount: 0,
        amount: 0,
      },
    ]);
  }

  function removeRow(id: string) {
    setItems(items.filter((i) => i.id !== id));
  }

  function updateRow(id: string, patch: Partial<PurchaseLineItem>) {
    setItems(
      items.map((i) => {
        if (i.id !== id) return i;
        const next: PurchaseLineItem = { ...i, ...patch };
        // Calculate amount as quantity * rate * (length if present)
        const qty = Number(next.quantity) || 0;
        const rate = Number(next.rate) || 0;
        const length =
          next.length !== undefined &&
          next.length !== null &&
          next.length !== ""
            ? Number(next.length)
            : 1;
        next.amount = qty * rate * length;
        return next;
      })
    );
  }

  return (
    <div>
      <div>
        <Group justify="flex-end">
          <Button variant="outline" onClick={addRow} size="xs">
            + {addRowLabel}
          </Button>
        </Group>
        <Table
          striped
          highlightOnHover
          verticalSpacing="sm"
          style={{ width: "100%" }}
          withColumnBorders
          withTableBorder
          withRowBorders
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ textAlign: "left", padding: 8, width: 180 }}>
                Item
              </Table.Th>
              <Table.Th style={{ textAlign: "left", padding: 8, width: 120 }}>
                Color
              </Table.Th>
              <Table.Th style={{ textAlign: "left", padding: 8, width: 100 }}>
                Thickness
              </Table.Th>
              <Table.Th style={{ textAlign: "left", padding: 8, width: 100 }}>
                Length
              </Table.Th>
              <Table.Th style={{ textAlign: "left", padding: 8, width: 80 }}>
                Qty
              </Table.Th>
              <Table.Th style={{ textAlign: "left", padding: 8, width: 120 }}>
                Rate
              </Table.Th>
              {showAmountCol && (
                <Table.Th
                  style={{ textAlign: "left", padding: 8, width: 120 }}
                >
                  Amount
                </Table.Th>
              )}
              <Table.Th style={{ textAlign: "left", padding: 8, width: 80 }}>
                Action
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td style={{ padding: 8 }}>
                  <Select
                    searchable
                    clearable
                    nothingFound="No products found"
                    data={products.map((p) => ({
                      value: String(p.id),
                      label: `${p.name} (Thickness: ${p.thickness ?? '-'}, Color: ${p.color ?? '-'})`,
                    }))}
                    value={
                      products.find((p) => p.name === row.productName)?.id || ""
                    }
                    onChange={(productId) => {
                      const p = products.find(
                        (x) => String(x.id) === String(productId)
                      );
                      if (p) {
                        updateRow(row.id, {
                          productName: p.name || "",
                          rate: p.salesRate ?? 0,
                          color: p.color ?? undefined,
                          thickness: p.thickness
                            ? String(p.thickness)
                            : undefined,
                          length: p.length ?? undefined,
                        });
                      } else {
                        updateRow(row.id, {
                          productName: "",
                          rate: 0,
                          color: undefined,
                          thickness: undefined,
                          length: undefined,
                        });
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td style={{ padding: 8 }}>
                  <Select
                    placeholder="Color"
                    data={colors.map((c) => ({ value: c.name, label: c.name }))}
                    value={row.color}
                    onChange={(v: string | null) =>
                      updateRow(row.id, {
                        color: v ?? undefined,
                      })
                    }
                  />
                </Table.Td>
                <Table.Td style={{ padding: 8 }}>
                  <TextInput
                    value={row.thickness}
                    onChange={(e) =>
                      updateRow(row.id, { thickness: e.target.value })
                    }
                    placeholder="Thickness"
                  />
                </Table.Td>
                <Table.Td style={{ padding: 8 }}>
                  <TextInput
                    value={String(row.length ?? "")}
                    onChange={(e) =>
                      updateRow(row.id, { length: e.target.value })
                    }
                    placeholder="Length"
                  />
                </Table.Td>
                <Table.Td style={{ padding: 8, textAlign: "right" }}>
                  <NumberInput
                    value={row.quantity}
                    onChange={(v) =>
                      updateRow(row.id, {
                        quantity: allowNegativeQty
                          ? Number(v)
                          : Math.max(0, Number(v || 0)),
                      })
                    }
                    min={allowNegativeQty ? undefined : 0}
                  />
                </Table.Td>
                <Table.Td style={{ padding: 8 }}>
                  <NumberInput
                    value={row.rate}
                    onChange={(v) =>
                      editableRate
                        ? updateRow(row.id, { rate: Number(v || 0) })
                        : undefined
                    }
                    min={0}
                    readOnly={!editableRate}
                  />
                </Table.Td>
                {showAmountCol && (
                  <Table.Td style={{ padding: 8, textAlign: "left" }}>
                    {formatCurrency(row.amount ?? 0)}
                  </Table.Td>
                )}
                <Table.Td style={{ padding: 8, textAlign: "left" }}>
                  <Button variant="subtle" onClick={() => removeRow(row.id)}>
                    <Trash2 size={16} />
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
      
    </div>
  );
}
