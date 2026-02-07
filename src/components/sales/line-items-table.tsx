import { useCallback, useMemo, useState } from "react";
import { NumberInput, TextInput, Button, Select, Modal, Text, Group } from "@mantine/core";

import Table from "../../lib/AppTable";
import type { InventoryItem } from "../../Dashboard/Context/DataContext";
import { IconTrash } from "@tabler/icons-react";

export type LineItem = {
  _id?: string | number;
  itemName?: string;
  unit: string;
  discount?: number;
  discountAmount?: number;
  salesRate?: number;
  color?: string;
  openingStock?: number;
  quantity?: number;
  thickness?: number;
  amount: number;
  length?: number;
  totalGrossAmount: number;
  totalNetAmount: number;
  brand?: string;
};

export function LineItemsTable({
  items,
  onChange,
  products,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  products?: InventoryItem[];
}) {
  const update = useCallback(
    (rowIdx: number, patch: Partial<LineItem>) => {
      onChange(
        items.map((it, idx) => (idx === rowIdx ? { ...it, ...patch } : it))
      );
    },
    [items, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent, idx: number, col: string) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const cols = ['item', 'color', 'thickness', 'length', 'brand', 'quantity', 'rate', 'discount', 'discountAmount'];
        const colIdx = cols.indexOf(col);
        
        if (colIdx < cols.length - 1) {
            const nextCol = cols[colIdx + 1];
            // Small timeout to allow React to handle state updates if any
            setTimeout(() => {
                document.getElementById(`input-row-${idx}-${nextCol}`)?.focus();
            }, 0);
        } else {
            // Next row
            if (idx === items.length - 1) {
                // Add new row
                const newItem: LineItem = {
                    unit: "",
                    quantity: 1,
                    salesRate: 0,
                    discount: 0,
                    amount: 0,
                    thickness: 0,
                    length: 0,
                    totalGrossAmount: 0,
                    totalNetAmount: 0,
                    discountAmount: 0,
                    itemName: "",
                    color: ""
                };
                onChange([...items, newItem]);
                setTimeout(() => {
                    document.getElementById(`input-row-${idx + 1}-item`)?.focus();
                }, 50);
            } else {
                setTimeout(() => {
                    document.getElementById(`input-row-${idx + 1}-item`)?.focus();
                }, 0);
            }
        }
    } else if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
         // Optional: Ctrl+Right to move to next cell
    }
  };

  // Build an index for fast lookup of product options
  const productIndex = useMemo(() => {
    if (!products) return { names: [], byName: {} };
    const byName: Record<string, InventoryItem[]> = {};
    const names = new Set<string>();
    products.forEach((p) => {
      if (p.itemName) {
        names.add(p.itemName);
        if (!byName[p.itemName]) byName[p.itemName] = [];
        byName[p.itemName].push(p);
      }
    });
    return {
      names: Array.from(names).sort().map((n) => ({ value: n, label: n })),
      byName,
    };
  }, [products]);

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      onChange(items.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  return (
    <>
      <Modal opened={deleteIndex !== null} onClose={() => setDeleteIndex(null)} title="Confirm Deletion">
        <Text>Are you sure you want to remove this item?</Text>
        <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDeleteIndex(null)}>Cancel</Button>
            <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    <Table withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: 300 }}>Item</Table.Th>
          <Table.Th style={{ width: 140 }}>Color</Table.Th>
          <Table.Th style={{ width: 120 }}>Thickness</Table.Th>
          <Table.Th style={{ width: 120 }}>Length</Table.Th>
          <Table.Th style={{ width: 120 }}>Brand</Table.Th>

          <Table.Th style={{ width: 120 }}>Qty</Table.Th>
          <Table.Th style={{ width: 120 }}>Rate</Table.Th>
          <Table.Th style={{ width: 120 }}>Gross</Table.Th>
          <Table.Th style={{ width: 120 }}>%</Table.Th>
          <Table.Th style={{ width: 120 }}>Discount</Table.Th>
          <Table.Th style={{ width: 120 }}>Net</Table.Th>

          <Table.Th style={{ textAlign: "left" }}>Remove</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((it, idx) => {
          // Amount = Length * Quantity * Rate
          const length = Number(it.length || 0);
          const quantity = Number(it.quantity || 0);
          const rate = Number(it.salesRate || 0);
          const gross = length * quantity * rate;
          const discountAmount = it.discountAmount ?? 0;
          const net = gross - discountAmount;
          // GST removed per request — line total is net amount (no tax)

          return (
            <Table.Tr key={`line-${idx}`}>
              <Table.Td style={{ minWidth: 200 }}>
                {products && products.length ? (
                  <Select
                    id={`input-row-${idx}-item`}
                    value={it.itemName}
                    data={productIndex.names}
                    onKeyDown={(e) => handleKeyDown(e, idx, 'item')}
                    onChange={(val) => {
                      const newName = val || "";
                      // Reset downstream fields when name changes
                      update(idx, {
                        itemName: newName,
                        _id: "",
                        salesRate: 0,
                        color: "",
                        thickness: 0,
                        amount: 0,
                      });
                    }}
                    searchable
                    clearable
                    placeholder="Search Item"
                  />
                ) : (
                  <TextInput
                    id={`input-row-${idx}-item`}
                    value={it.itemName}
                    onKeyDown={(e) => handleKeyDown(e, idx, 'item')}
                    onChange={(e) => {
                      update(idx, {
                        itemName: e.currentTarget.value,
                      });
                    }}
                    placeholder="Product Name (Thickness, Color)"
                  />
                )}
              </Table.Td>

              <Table.Td>
                {products && products.length && it.itemName && productIndex.byName[it.itemName] ? (
                  <Select
                    id={`input-row-${idx}-color`}
                    value={it.color || ""}
                    data={Array.from(new Set(productIndex.byName[it.itemName].map(p => p.color || "").filter(Boolean))).sort().map(c => ({ value: c, label: c }))}
                    onKeyDown={(e) => handleKeyDown(e, idx, 'color')}
                    onChange={(val) => {
                        const newColor = val || "";
                        update(idx, { color: newColor, thickness: 0, _id: "", salesRate: 0 });
                    }}
                    placeholder="Color"
                    searchable
                  />
                ) : (
                <TextInput
                  id={`input-row-${idx}-color`}
                  value={it.color ?? ""}
                  placeholder="Color"
                  onKeyDown={(e) => handleKeyDown(e, idx, 'color')}
                  onChange={(e) => {
                    update(idx, { color: e.currentTarget.value });
                  }}
                />
                )}
              </Table.Td>

              <Table.Td>
                {products && products.length && it.itemName && it.color && productIndex.byName[it.itemName] ? (
                   <Select
                    id={`input-row-${idx}-thickness`}
                    value={String(it.thickness || "")}
                    data={Array.from(new Set(productIndex.byName[it.itemName].filter(p => p.color === it.color).map(p => p.thickness).filter(t => t !== undefined && t !== null))).sort((a,b) => Number(a)-Number(b)).map(t => ({ value: String(t), label: String(t) }))}
                    onKeyDown={(e) => handleKeyDown(e, idx, 'thickness')}
                    onChange={(val) => {
                        const newThickness = Number(val);
                        // Find Exact Product
                        const exactProduct = productIndex.byName[it.itemName!].find(p => p.color === it.color && p.thickness === newThickness);
                        if (exactProduct) {
                            update(idx, {
                                thickness: newThickness,
                                _id: exactProduct._id,
                                salesRate: Number(exactProduct.salesRate ?? 0),
                                unit: exactProduct.unit ?? "",
                                openingStock: exactProduct.openingStock ?? 0,
                                amount: 0 
                                // Recalculate amounts? The update function handles re-calc if I pass everything, 
                                // but here I'm setting properties. The other fields (length, quantity) are not changing, 
                                // but rate IS changing.
                                // I should trigger amount recalc.
                            });
                             // Trigger amount update separately or just let the effect handle it?
                             // actually update() helper doesn't auto-recalc based on new rate.
                             // I need to manually recalc amount.
                             const length = Number(it.length || 0);
                             const quantity = Number(it.quantity || 0);
                             const rate = Number(exactProduct.salesRate ?? 0);
                             update(idx, {
                                thickness: newThickness,
                                _id: exactProduct._id,
                                salesRate: rate,
                                unit: exactProduct.unit ?? "",
                                openingStock: exactProduct.openingStock ?? 0,
                                amount: length * quantity * rate,
                                totalGrossAmount: length * quantity * rate,
                                totalNetAmount: (length * quantity * rate) - (it.discountAmount || 0)
                            });
                        } else {
                            update(idx, { thickness: newThickness });
                        }
                    }}
                    placeholder="Thick"
                    searchable
                  />
                ) : (
                <TextInput
                  id={`input-row-${idx}-thickness`}
                  value={String(it.thickness ?? "")}
                  placeholder="Thickness"
                  onKeyDown={(e) => handleKeyDown(e, idx, 'thickness')}
                  onChange={(e) => {
                    update(idx, {
                      thickness: Number(e.currentTarget.value),
                    });
                  }}
                />
                )}
              </Table.Td>

              <Table.Td>
                <NumberInput
                  id={`input-row-${idx}-length`}
                  value={it.length}
                  placeholder="Length"
                  onKeyDown={(e) => handleKeyDown(e, idx, 'length')}
                  onChange={(val) => {
                    const length = Number(val || 0);
                    const quantity = Number(it.quantity || 0);
                    const rate = Number(it.salesRate || 0);
                    update(idx, {
                      length,
                      amount: length * quantity * rate,
                      totalGrossAmount: length * quantity * rate,
                      totalNetAmount: (length * quantity * rate) - (it.discountAmount || 0)
                    });
                  }}
                  min={0}
                  decimalScale={2}
                  hideControls
                />
              </Table.Td>

              <Table.Td>
                <TextInput
                  id={`input-row-${idx}-brand`}
                  value={it.brand ?? ""}
                  placeholder="Brand"
                  onKeyDown={(e) => handleKeyDown(e, idx, 'brand')}
                  onChange={(e) =>
                    update(idx, { brand: e.currentTarget.value })
                  }
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  id={`input-row-${idx}-quantity`}
                  value={it.quantity}
                  onKeyDown={(e) => handleKeyDown(e, idx, 'quantity')}
                  onChange={(v: number | string | undefined) => {
                    const quantity = Number(v || 0);
                    const length = Number(it.length || 0);
                    const rate = Number(it.salesRate || 0);
                    update(idx, {
                      quantity,
                      amount: length * quantity * rate,
                    });
                  }}
                  hideControls
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  id={`input-row-${idx}-rate`}
                  value={it.salesRate}
                  onKeyDown={(e) => handleKeyDown(e, idx, 'rate')}
                  onChange={(v: number | string | undefined) => {
                    const rate = Number(v || 0);
                    const length = Number(it.length || 0);
                    const quantity = Number(it.quantity || 0);
                    update(idx, {
                      salesRate: rate,
                      amount: length * quantity * rate,
                    });
                  }}
                  hideControls
                />
              </Table.Td>

              <Table.Td>{gross.toFixed(2)}</Table.Td>

              <Table.Td>
                <NumberInput
                  id={`input-row-${idx}-discount`}
                  value={it.discount ?? 0}
                  onKeyDown={(e) => handleKeyDown(e, idx, 'discount')}
                  onChange={(v: number | string | undefined) => {
                    const pct = Number(v || 0);
                    const discountAmount = (pct / 100) * gross;
                    update(idx, {
                      discount: pct,
                      discountAmount,
                    });
                  }}
                  hideControls
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  id={`input-row-${idx}-discountAmount`}
                  value={it.discountAmount ?? 0}
                  onKeyDown={(e) => handleKeyDown(e, idx, 'discountAmount')}
                  onChange={(v: number | string | undefined) => {
                    const amt = Number(v || 0);
                    // When user edits discountAmount, update both fields to keep them in sync
                    const pct = gross > 0 ? (amt / gross) * 100 : 0;
                    update(idx, {
                      discountAmount: amt,
                      discount: pct,
                    });
                  }}
                  hideControls
                />
              </Table.Td>

              <Table.Td>{net.toFixed(2)}</Table.Td>

              <Table.Td>
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <Button
                    variant="subtle"
                    color="red"
                    tabIndex={-1}
                    onClick={() => setDeleteIndex(idx)}
                    leftSection={<IconTrash size={18} />}
                  ></Button>
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
