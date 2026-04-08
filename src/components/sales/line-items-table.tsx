/* eslint-disable react-refresh/only-export-components */
import { useCallback, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";

import Table from "../../lib/AppTable";
import type { InventoryItem } from "../../Dashboard/Context/DataContext";
import { IconTrash } from "@tabler/icons-react";
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
} from "../../lib/variant-line-item-utils";

function ensureCurrentOption(
  options: Array<{ value: string; label: string }>,
  value: string,
) {
  const normalizedValue = value.trim();
  if (!normalizedValue) return options;
  if (options.some((option) => option.value === normalizedValue))
    return options;

  return [{ value: normalizedValue, label: normalizedValue }, ...options];
}

export type LineItem = {
  _id?: string | number;
  productId?: string;
  sku?: string;
  itemName?: string;
  productName?: string;
  unit: string;
  discount?: number;
  discountAmount?: number;
  salesRate?: number;
  rate?: number;
  color?: string;
  availableStock?: number;
  openingStock?: number;
  quantity?: number;
  thickness?: string;
  amount: number;
  subtotal?: number;
  length?: number | string;
  totalGrossAmount: number;
  totalNetAmount: number;
  brand?: string;
};

export function createEmptySalesLineItem(defaultBrand = ""): LineItem {
  return {
    _id: "",
    productId: "",
    sku: "",
    itemName: "",
    productName: "",
    unit: "",
    quantity: 1,
    salesRate: 0,
    rate: 0,
    discount: 0,
    discountAmount: 0,
    amount: 0,
    subtotal: 0,
    color: "",
    availableStock: 0,
    openingStock: 0,
    thickness: "",
    length: "",
    totalGrossAmount: 0,
    totalNetAmount: 0,
    brand: defaultBrand,
  };
}

function normalizeLineItem(
  item: LineItem,
  patch: Partial<LineItem> = {},
): LineItem {
  const next = { ...item, ...patch };
  const rate = Number(next.salesRate ?? next.rate ?? 0);
  const quantity = Number(next.quantity ?? 0);
  const subtotal = calculateLineSubtotal({
    ...next,
    salesRate: rate,
    rate,
    quantity,
  });

  let discount = Number(next.discount ?? 0);
  let discountAmount = Number(next.discountAmount ?? 0);

  if (Object.prototype.hasOwnProperty.call(patch, "discountAmount")) {
    discountAmount = Number(patch.discountAmount ?? 0);
    discount = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
  } else {
    discountAmount = subtotal * (discount / 100);
  }

  const totalNetAmount = Math.max(0, subtotal - discountAmount);
  const productName = String(next.productName || next.itemName || "");

  return {
    ...next,
    productName,
    itemName: productName,
    productId: toProductId(next.productId),
    sku: next.sku ?? "",
    thickness: next.thickness ?? "",
    color: next.color ?? "",
    quantity,
    salesRate: rate,
    rate,
    subtotal,
    amount: subtotal,
    discount,
    discountAmount,
    totalGrossAmount: subtotal,
    totalNetAmount,
    availableStock: Number(next.availableStock ?? next.openingStock ?? 0),
    openingStock: Number(next.openingStock ?? next.availableStock ?? 0),
  };
}

export function LineItemsTable({
  items,
  onChange,
  products,
  mode,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  products?: InventoryItem[];
  mode?: "Quotation" | "Invoice";
}) {
  const inventory = products ?? [];
  const productOptions = useMemo(
    () => getProductOptions(inventory),
    [inventory],
  );
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const updateRow = useCallback(
    (rowIdx: number, nextRow: LineItem | Partial<LineItem>) => {
      onChange(
        items.map((item, idx) =>
          idx === rowIdx
            ? normalizeLineItem(item, nextRow as Partial<LineItem>)
            : normalizeLineItem(item),
        ),
      );
    },
    [items, onChange],
  );

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      onChange(items.filter((_, idx) => idx !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  return (
    <>
      <Modal
        opened={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        title="Confirm Deletion"
      >
        <Text>Are you sure you want to remove this item?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteIndex(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>

      <Table withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 240 }}>Product</Table.Th>
            <Table.Th style={{ width: 140 }}>Thickness</Table.Th>
            <Table.Th style={{ width: 160 }}>Color</Table.Th>
            <Table.Th style={{ width: 100 }}>Length</Table.Th>
            <Table.Th style={{ width: 120 }}>Brand</Table.Th>
            <Table.Th style={{ width: 140 }}>Qty</Table.Th>
            <Table.Th style={{ width: 120 }}>Rate</Table.Th>
            <Table.Th style={{ width: 90 }}>%</Table.Th>
            <Table.Th style={{ width: 120 }}>Discount</Table.Th>
            <Table.Th style={{ width: 140 }}>Subtotal / Net</Table.Th>
            <Table.Th style={{ textAlign: "left" }}>Remove</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((rawItem, idx) => {
            const item = normalizeLineItem(rawItem);
            const selectedProduct = findSelectedProduct(inventory, item);
            const thicknessOptions = ensureCurrentOption(
              getThicknessOptions(selectedProduct),
              item.thickness ?? "",
            );
            const colorOptions = ensureCurrentOption(
              getColorOptions(selectedProduct, item.thickness ?? ""),
              item.color ?? "",
            );
            const lengthOptions = ensureCurrentOption(
              getLengthOptions(
                selectedProduct,
                item.thickness ?? "",
                item.color ?? "",
              ),
              String(item.length ?? ""),
            );
            const selectedVariant = findSelectedVariant(
              selectedProduct,
              item.thickness ?? "",
              item.color ?? "",
              String(item.length ?? ""),
              item.sku,
            );
            const availableStock = getVariantStock(selectedVariant);
            const quantity = item.quantity ?? 0;
            const oversoldBy = Math.max(0, quantity - availableStock);
            const hasVariantError = hasIncompleteVariantSelection(item);
            const hasAnyVariantSelection =
              !!String(item.thickness ?? "").trim() ||
              !!String(item.color ?? "").trim() ||
              !!String(item.length ?? "").trim() ||
              !!String(item.sku ?? "").trim();
            const quantityError =
              mode === "Quotation"
                ? undefined
                : hasVariantError && !hasAnyVariantSelection
                  ? "Complete variant selection first"
                  : undefined;

            return (
              <Table.Tr key={`line-${idx}`}>
                <Table.Td style={{ minWidth: 200, verticalAlign: "top" }}>
                  <Select
                    value={
                      item.productId || toProductId(selectedProduct?._id) || ""
                    }
                    data={productOptions}
                    onChange={(value) => {
                      const product =
                        inventory.find(
                          (entry) => toProductId(entry._id) === (value ?? ""),
                        ) || null;

                      const singleVariant =
                        product && product.variants?.length === 1
                          ? product.variants[0]
                          : null;
                      const resolvedStock = getVariantStock(singleVariant);
                      const resolvedRate = Number(
                        singleVariant?.salesRate ?? 0,
                      );

                      updateRow(idx, {
                        _id: value || "",
                        productId: value || "",
                        productName: product?.itemName || "",
                        itemName: product?.itemName || "",
                        brand: String(product?.brand || ""),
                        unit: product?.unit || "",
                        sku: singleVariant?.sku || "",
                        thickness: singleVariant?.thickness || "",
                        color: singleVariant?.color || "",
                        length: singleVariant?.length || "",
                        quantity: 0,
                        salesRate: resolvedRate,
                        rate: resolvedRate,
                        availableStock: resolvedStock,
                        openingStock: resolvedStock,
                        subtotal: 0,
                        amount: 0,
                        totalGrossAmount: 0,
                        totalNetAmount: 0,
                      });
                    }}
                    searchable
                    clearable
                    placeholder="Select product"
                  />
                </Table.Td>

                <Table.Td style={{ verticalAlign: "top" }}>
                  <Select
                    value={item.thickness || ""}
                    data={thicknessOptions}
                    onChange={(value) => {
                      updateRow(idx, {
                        thickness: value || "",
                        color: "",
                        length: "",
                        sku: "",
                        quantity: 0,
                        salesRate: 0,
                        rate: 0,
                        availableStock: 0,
                        openingStock: 0,
                        subtotal: 0,
                        amount: 0,
                        totalGrossAmount: 0,
                        totalNetAmount: 0,
                      });
                    }}
                    disabled={!item.productId}
                    searchable
                    clearable
                    placeholder="Thickness"
                    error={
                      selectedProduct && !(item.thickness ?? "").trim()
                        ? "Required"
                        : undefined
                    }
                  />
                </Table.Td>

                <Table.Td style={{ verticalAlign: "top" }}>
                  <Select
                    value={item.color || ""}
                    data={colorOptions}
                    onChange={(value) => {
                      const color = value || "";
                      const variant = findSelectedVariant(
                        selectedProduct,
                        item.thickness || "",
                        color,
                        "",
                      );

                      updateRow(idx, {
                        color,
                        length: "",
                        sku: variant?.sku || "",
                        salesRate: Number(
                          variant?.salesRate ?? item.salesRate ?? 0,
                        ),
                        rate: Number(variant?.salesRate ?? item.salesRate ?? 0),
                        availableStock: getVariantStock(variant),
                        openingStock: getVariantStock(variant),
                      });
                    }}
                    disabled={!item.productId || !(item.thickness ?? "").trim()}
                    searchable
                    clearable
                    placeholder="Color"
                    error={
                      selectedProduct && !(item.color ?? "").trim()
                        ? "Required"
                        : undefined
                    }
                  />
                  {item.sku || selectedVariant?.sku ? (
                    <Text size="xs" c="dimmed" mt={4}>
                      SKU: {item.sku || selectedVariant?.sku}
                    </Text>
                  ) : null}
                </Table.Td>

                <Table.Td>
                  <Select
                    value={String(item.length ?? "")}
                    placeholder="Length"
                    onChange={(value) => {
                      const selectedLength = value || "";
                      const variant = findSelectedVariant(
                        selectedProduct,
                        item.thickness || "",
                        item.color || "",
                        selectedLength,
                      );

                      updateRow(idx, {
                        length: selectedLength,
                        sku: variant?.sku || "",
                        salesRate: Number(
                          variant?.salesRate ?? item.salesRate ?? 0,
                        ),
                        rate: Number(variant?.salesRate ?? item.salesRate ?? 0),
                        availableStock: getVariantStock(variant),
                        openingStock: getVariantStock(variant),
                      });
                    }}
                    data={lengthOptions}
                    disabled={!item.productId || !(item.color ?? "").trim()}
                    searchable
                    clearable
                    error={
                      selectedProduct && !String(item.length ?? "").trim()
                        ? "Required"
                        : undefined
                    }
                  />
                </Table.Td>

                <Table.Td>
                  <TextInput
                    value={String(item.brand ?? selectedProduct?.brand ?? "")}
                    placeholder="Brand"
                    readOnly
                    disabled
                  />
                </Table.Td>

                <Table.Td style={{ verticalAlign: "top" }}>
                  <NumberInput
                    value={item.quantity ?? 0}
                    onChange={(value) => {
                      updateRow(idx, { quantity: Number(value ?? 0) });
                    }}
                    min={0}
                    hideControls
                    error={quantityError}
                  />
                  {item.sku || selectedVariant ? (
                    <Group gap={6} mt={4}>
                      <Badge
                        color={availableStock > 0 ? "green" : "red"}
                        variant="light"
                      >
                        Available Stock: {availableStock}
                      </Badge>
                      {oversoldBy > 0 ? (
                        <Badge color="red" variant="filled">
                          Over by {oversoldBy}
                        </Badge>
                      ) : null}
                    </Group>
                  ) : null}
                </Table.Td>

                <Table.Td>
                  <NumberInput
                    value={item.salesRate ?? 0}
                    onChange={(value) => {
                      updateRow(idx, {
                        salesRate: Number(value ?? 0),
                        rate: Number(value ?? 0),
                      });
                    }}
                    hideControls
                    min={0}
                    decimalScale={2}
                  />
                </Table.Td>

                <Table.Td>
                  <NumberInput
                    value={item.discount ?? 0}
                    onChange={(value) => {
                      updateRow(idx, { discount: Number(value ?? 0) });
                    }}
                    hideControls
                    min={0}
                    max={100}
                    decimalScale={2}
                  />
                </Table.Td>

                <Table.Td>
                  <NumberInput
                    value={item.discountAmount ?? 0}
                    onChange={(value) => {
                      updateRow(idx, { discountAmount: Number(value ?? 0) });
                    }}
                    hideControls
                    min={0}
                    decimalScale={2}
                  />
                </Table.Td>

                <Table.Td>
                  <Text fw={600}>{(item.subtotal ?? 0).toFixed(2)}</Text>
                  <Text size="xs" c="dimmed">
                    Net: {(item.totalNetAmount ?? 0).toFixed(2)}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <div
                    style={{ display: "flex", justifyContent: "flex-start" }}
                  >
                    <Button
                      variant="subtle"
                      color="red"
                      tabIndex={-1}
                      onClick={() => {
                        setDeleteIndex(idx);
                      }}
                      leftSection={<IconTrash size={18} />}
                    />
                  </div>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </>
  );
}

export default LineItemsTable;
