import { useMemo } from "react";
import { Badge, Button, NumberInput, Select, Group, Text } from "@mantine/core";
import Table from "../../../lib/AppTable";
import { Trash2 } from "lucide-react";
import type { PurchaseLineItem } from "./types";
import { formatCurrency } from "../../../lib/format-utils";
import { useEffect } from "react";
import type { InventoryItem } from "../../../types";
import {
  calculateLineSubtotal,
  findSelectedProduct,
  findSelectedVariant,
  getColorOptions,
  getLengthOptions,
  getProductOptions,
  getThicknessOptions,
  getVariantStock,
  hasIncompleteVariantSelection,
  toProductId,
} from "../../../lib/variant-line-item-utils";
export interface LineItemsTableUniversalProps {
  items: PurchaseLineItem[];
  setItems: (items: PurchaseLineItem[]) => void;
  inventory: InventoryItem[];
  colors: { name: string }[];
  allowNegativeQty?: boolean;
  editableRate?: boolean;
  showAmountCol?: boolean;
  addRowLabel?: string;
}

export function createEmptyPurchaseLineItem(): PurchaseLineItem {
  return {
    id: crypto.randomUUID(),
    productId: "",
    sku: "",
    productName: "",
    itemName: "",
    quantity: 1,
    rate: 0,
    salesRate: 0,
    unit: "pcs",
    color: "",
    thickness: "",
    length: "",
    grossAmount: 0,
    percent: 0,
    discountAmount: 0,
    netAmount: 0,
    amount: 0,
    subtotal: 0,
    availableStock: 0,
  };
}

function normalizePurchaseRow(
  item: PurchaseLineItem,
  patch: Partial<PurchaseLineItem> = {},
): PurchaseLineItem {
  const next = { ...item, ...patch };
  const rate = Number(next.rate ?? next.salesRate ?? 0);
  const quantity = Number(next.quantity ?? 0);
  const subtotal = calculateLineSubtotal({
    ...next,
    quantity,
    rate,
    salesRate: rate,
  });

  return {
    ...next,
    itemName: String(next.itemName || next.productName || ""),
    productName: String(next.productName || next.itemName || ""),
    productId: toProductId(next.productId),
    sku: String(next.sku || ""),
    thickness: String(next.thickness || ""),
    color: String(next.color || ""),
    quantity,
    rate,
    salesRate: rate,
    grossAmount: subtotal,
    netAmount: subtotal,
    amount: subtotal,
    subtotal,
    availableStock: Number(next.availableStock ?? 0),
  };
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
  const productOptions = useMemo(
    () => getProductOptions(inventory),
    [inventory],
  );

  // Ensure at least one row is present on mount
  useEffect(() => {
    if (items.length === 0) {
      addRow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRow() {
    setItems([...items, createEmptyPurchaseLineItem()]);
  }

  function removeRow(id: string) {
    setItems(items.filter((i) => i.id !== id));
  }

  function updateRow(id: string, patch: Partial<PurchaseLineItem>) {
    setItems(
      items.map((i) => {
        if (i.id !== id) return i;
        return normalizePurchaseRow(i, patch);
      }),
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
                Product
              </Table.Th>
              <Table.Th style={{ textAlign: "left", padding: 8, width: 120 }}>
                Thickness
              </Table.Th>
              <Table.Th style={{ textAlign: "left", padding: 8, width: 100 }}>
                Color
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
                <Table.Th style={{ textAlign: "left", padding: 8, width: 120 }}>
                  Amount
                </Table.Th>
              )}
              <Table.Th style={{ textAlign: "left", padding: 8, width: 80 }}>
                Action
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((rawRow) => {
              const row = normalizePurchaseRow(rawRow);
              const selectedProduct = findSelectedProduct(inventory, row);
              const thicknessOptions = getThicknessOptions(selectedProduct);
              const colorOptions = getColorOptions(
                selectedProduct,
                String(row.thickness || ""),
              );
              const lengthOptions = getLengthOptions(
                selectedProduct,
                String(row.thickness || ""),
                String(row.color || ""),
              );
              const selectedVariant = findSelectedVariant(
                selectedProduct,
                String(row.thickness || ""),
                String(row.color || ""),
                String(row.length || ""),
                row.sku,
              );
              const availableStock = getVariantStock(selectedVariant);
              const quantity = Number(row.quantity || 0);
              const oversoldBy = Math.max(0, quantity - availableStock);

              return (
                <Table.Tr key={row.id}>
                  <Table.Td style={{ padding: 8 }}>
                    <Select
                      searchable
                      clearable
                      nothingFoundMessage="No products found"
                      data={productOptions}
                      value={
                        toProductId(selectedProduct?._id) || row.productId || ""
                      }
                      onChange={(productId) => {
                        const product =
                          inventory.find(
                            (entry) =>
                              toProductId(entry._id) ===
                              String(productId || ""),
                          ) || null;
                        updateRow(row.id, {
                          productId: productId || "",
                          productName: product?.itemName || "",
                          itemName: product?.itemName || "",
                          unit: product?.unit || "pcs",
                          sku: "",
                          thickness: "",
                          color: "",
                          length: "",
                          quantity: 0,
                          rate: 0,
                          salesRate: 0,
                          availableStock: 0,
                        });
                      }}
                    />
                  </Table.Td>
                  <Table.Td style={{ padding: 8 }}>
                    <Select
                      placeholder="Thickness"
                      data={thicknessOptions}
                      value={String(row.thickness || "")}
                      onChange={(v: string | null) => {
                        updateRow(row.id, {
                          thickness: v ?? "",
                          color: "",
                          length: "",
                          sku: "",
                          quantity: 0,
                          rate: 0,
                          salesRate: 0,
                          availableStock: 0,
                        });
                      }}
                      disabled={!selectedProduct}
                      error={
                        selectedProduct && !String(row.thickness || "").trim()
                          ? "Required"
                          : undefined
                      }
                    />
                  </Table.Td>
                  <Table.Td style={{ padding: 8 }}>
                    <Select
                      placeholder="Color"
                      data={colorOptions}
                      value={String(row.color || "")}
                      onChange={(v: string | null) => {
                        const color = v ?? "";
                        const variant = findSelectedVariant(
                          selectedProduct,
                          String(row.thickness || ""),
                          color,
                          "",
                        );
                        updateRow(row.id, {
                          color,
                          length: "",
                          sku: variant?.sku || "",
                          rate: Number(variant?.salesRate ?? 0),
                          salesRate: Number(variant?.salesRate ?? 0),
                          availableStock: getVariantStock(variant),
                        });
                      }}
                      disabled={
                        !selectedProduct || !String(row.thickness || "").trim()
                      }
                      error={
                        selectedProduct && !String(row.color || "").trim()
                          ? "Required"
                          : undefined
                      }
                    />
                    {row.sku ? (
                      <Text size="xs" c="dimmed" mt={4}>
                        SKU: {row.sku}
                      </Text>
                    ) : null}
                  </Table.Td>
                  <Table.Td style={{ padding: 8 }}>
                    <Select
                      value={String(row.length ?? "")}
                      onChange={(v: string | null) => {
                        const selectedLength = v ?? "";
                        const variant = findSelectedVariant(
                          selectedProduct,
                          String(row.thickness || ""),
                          String(row.color || ""),
                          selectedLength,
                        );

                        updateRow(row.id, {
                          length: selectedLength,
                          sku: variant?.sku || "",
                          rate: Number(variant?.salesRate ?? row.rate ?? 0),
                          salesRate: Number(
                            variant?.salesRate ??
                              row.salesRate ??
                              row.rate ??
                              0,
                          ),
                          availableStock: getVariantStock(variant),
                        });
                      }}
                      placeholder="Length"
                      data={lengthOptions}
                      searchable
                      clearable
                      disabled={
                        !selectedProduct || !String(row.color || "").trim()
                      }
                      error={
                        selectedProduct && !String(row.length || "").trim()
                          ? "Required"
                          : undefined
                      }
                    />
                  </Table.Td>
                  <Table.Td style={{ padding: 8, textAlign: "right" }}>
                    <NumberInput
                      value={row.quantity}
                      onChange={(v) => {
                        updateRow(row.id, {
                          quantity: allowNegativeQty
                            ? Number(v)
                            : Math.max(0, Number(v || 0)),
                        });
                      }}
                      min={allowNegativeQty ? undefined : 0}
                      hideControls
                      error={
                        hasIncompleteVariantSelection(row)
                          ? "Complete variant selection first"
                          : undefined
                      }
                    />
                    {row.sku ? (
                      <Group gap={6} mt={4} justify="flex-end">
                        <Badge
                          color={availableStock > 0 ? "green" : "red"}
                          variant="light"
                        >
                          Available Stock: {availableStock}
                        </Badge>
                        {oversoldBy > 0 ? (
                          <Badge color="red">Over by {oversoldBy}</Badge>
                        ) : null}
                      </Group>
                    ) : null}
                  </Table.Td>
                  <Table.Td style={{ padding: 8 }}>
                    <NumberInput
                      value={row.rate}
                      onChange={(v) => {
                        editableRate
                          ? updateRow(row.id, { rate: Number(v || 0) })
                          : undefined;
                      }}
                      min={0}
                      readOnly={!editableRate}
                    />
                  </Table.Td>
                  {showAmountCol && (
                    <Table.Td style={{ padding: 8, textAlign: "left" }}>
                      {formatCurrency(row.subtotal ?? row.amount ?? 0)}
                    </Table.Td>
                  )}
                  <Table.Td style={{ padding: 8, textAlign: "left" }}>
                    <Button
                      variant="subtle"
                      onClick={() => {
                        removeRow(row.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
}
