import { useState } from "react";
// client-side parsing libraries removed — parsing handled server-side in this build
import {
  Card,
  Group,
  Text,
  Title,
  Badge,
  Box,
  Button,
  TextInput,
  Modal,
  Table,
  ScrollArea,
  Checkbox,
  NumberInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useDataContext } from "../../Context/DataContext";
import type { InventoryItem } from "../../Context/DataContext";

import { ProductForm } from "../../../components/products/ProductForm";
import { ProductDetails } from "../..//../components/products/ProductDetails";

function formatNumber(n: number) {
  return n.toLocaleString();
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ProductMaster() {
  type ParsedRow = {
    sku?: string;
    code?: string;
    name?: string;
    description?: string;
    newPrice?: number | string | null;
    matchedProductId?: number | null;
    matchedProductName?: string | null;
    // some parsers return snake_case fields
    matched_id?: number | string | null;
    matched_name?: string | null;
    selected?: boolean;
  };

  type UploadPreviewRow = {
    sku?: string;
    code?: string;
    name?: string;
    newPrice?: number | null;
    matchedProductId?: number | null;
    matchedProductName?: string | null;
    selected?: boolean;
    priceInvalid?: boolean;
  };

  type ReviewRow = UploadPreviewRow & {
    oldPrice?: number;
    delta?: number;
    include?: boolean;
  };

  type ApplyResponse = { updated?: Array<{ id: number; newPrice?: number }> };
  const { inventory, getColorById } = useDataContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(
    null
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<UploadPreviewRow[] | null>(
    null
  );
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRows, setReviewRows] = useState<ReviewRow[] | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<Map<number, number> | null>(
    null
  );

  const filtered = inventory.filter((p) =>
    Object.values(p).some((v) =>
      String(v).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock < 0) return <Badge color="red">Negative</Badge>;
    if (item.stock <= item.minStock)
      return <Badge color="yellow">Low Stock</Badge>;
    return <Badge color="green">In Stock</Badge>;
  };

  const { setInventory } = useDataContext();

  const handleDelete = (id: number) => {
    setInventory((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <Box mb="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Product Master</Title>
            <Text c="dimmed">Manage your inventory and products</Text>
          </div>
          <div>
            <Button
              leftSection={<IconPlus />}
              onClick={() => setIsAddOpen(true)}
            >
              Add Product
            </Button>
            <Button
              ml={8}
              variant="outline"
              onClick={() => setIsUploadOpen(true)}
              style={{ marginLeft: 8 }}
            >
              Upload Rates
            </Button>
          </div>
        </Group>
      </Box>

      <Card shadow="sm">
        <Group justify="space-between" style={{ marginBottom: 12 }}>
          <div>
            <Title order={4}>All Products</Title>
            <Text c="dimmed">{filtered.length} products found</Text>
          </div>

          <div style={{ width: 320 }}>
            <TextInput
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
          </div>
        </Group>

        <ScrollArea>
          <Table verticalSpacing="sm">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Color</th>
                <th>Length</th>
                <th>Brand</th>
                <th style={{ textAlign: "right" }}>Current Stock</th>
                <th style={{ textAlign: "right" }}>Purchase Rate</th>
                <th style={{ textAlign: "right" }}>Old Price</th>
                <th style={{ textAlign: "right" }}>New Price</th>
                <th style={{ textAlign: "right" }}>Sale Rate</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "monospace" }}>
                    {p.code || p.sku || String(p.id) || "-"}
                  </td>
                  <td>{p.name || "-"}</td>
                  <td>
                    <Badge>{p.category}</Badge>
                  </td>
                  <td>
                    {p.colorId && getColorById(p.colorId)
                      ? getColorById(p.colorId)!.code &&
                        getColorById(p.colorId)!.code !==
                          getColorById(p.colorId)!.name
                        ? `${getColorById(p.colorId)!.name} (${
                            getColorById(p.colorId)!.code
                          })`
                        : getColorById(p.colorId)!.name
                      : p.color ?? "-"}
                  </td>
                  <td>{p.length ?? "-"}</td>
                  <td>{p.supplier}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    {formatNumber(p.stock)} {p.unit}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(p.costPrice)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(p.oldPrice ?? 0)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(p.newPrice ?? p.sellingPrice ?? 0)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(p.sellingPrice)}
                  </td>
                  <td>{getStockStatus(p)}</td>
                  <td style={{ textAlign: "right" }}>
                    <Group justify="flex-end">
                      <Button
                        variant="subtle"
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsViewOpen(true);
                        }}
                      >
                        <IconEye />
                      </Button>
                      <Button
                        variant="subtle"
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsEditOpen(true);
                        }}
                      >
                        <IconEdit />
                      </Button>
                      <Button
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(p.id)}
                      >
                        <IconTrash />
                      </Button>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </Card>

      <Modal
        opened={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Product Details"
        size={"80%"}
      >
        {selectedProduct ? (
          <ProductDetails product={selectedProduct} />
        ) : (
          <Text c="dimmed">No product selected</Text>
        )}
      </Modal>

      <Modal
        opened={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Product"
        size={"80%"}
      >
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </Modal>

      <Modal
        opened={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Product"
        size={"80%"}
      >
        <ProductForm onClose={() => setIsAddOpen(false)} />
      </Modal>

      <Modal
        opened={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadFile(null);
          setUploadPreview(null);
        }}
        title="Upload New Rates"
        size={"60%"}
      >
        <div>
          <input
            type="file"
            accept=".csv, .xlsx, .xls, .pdf"
            onChange={(e) =>
              setUploadFile(e.target.files ? e.target.files[0] : null)
            }
          />

          <div style={{ marginTop: 12 }}>
            <Button
              onClick={async () => {
                if (!uploadFile) return;
                setUploadLoading(true);
                try {
                  const fd = new FormData();
                  fd.append("file", uploadFile);
                  const res = await fetch("/api/upload-rates", {
                    method: "POST",
                    body: fd,
                  });
                  if (!res.ok) throw new Error(await res.text());
                  const jsonResp = await res.json();
                  const raw = (jsonResp.parsed || jsonResp) as ParsedRow[];
                  // coerce and normalize parsed rows to expected types
                  const normalized = (raw || []).map((r) => {
                    const maybePrice =
                      r.newPrice != null ? Number(r.newPrice) : null;
                    const invalid =
                      maybePrice != null && !Number.isFinite(maybePrice);
                    return {
                      sku: r.sku ?? r.code ?? undefined,
                      code: r.code ?? r.sku ?? undefined,
                      name: r.name ?? r.description ?? undefined,
                      newPrice: maybePrice,
                      priceInvalid: invalid,
                      matchedProductId:
                        r.matchedProductId != null
                          ? Number(r.matchedProductId)
                          : r.matched_id != null
                          ? Number(r.matched_id)
                          : null,
                      matchedProductName:
                        r.matchedProductName ?? r.matched_name ?? undefined,
                      selected: !!r.selected,
                    } as UploadPreviewRow;
                  });
                  setUploadPreview(normalized);
                  const invalidCount = normalized.filter(
                    (x) => x.priceInvalid
                  ).length;
                  if (invalidCount) {
                    showNotification({
                      title: `Upload parsed with ${invalidCount} invalid price(s)`,
                      message: "Fix or clear invalid prices before reviewing",
                      color: "yellow",
                      icon: <IconAlertCircle size={18} />,
                    });
                  } else {
                    showNotification({
                      title: "Upload parsed",
                      message: "Preview ready",
                      color: "green",
                      icon: <IconCheck size={18} />,
                    });
                  }
                } catch (err) {
                  console.error(err);
                  showNotification({
                    title: "Upload failed",
                    message: String(err),
                    color: "red",
                    icon: <IconX size={18} />,
                  });
                } finally {
                  setUploadLoading(false);
                }
              }}
              loading={uploadLoading}
            >
              Parse & Preview
            </Button>
          </div>

          {uploadPreview && (
            <div style={{ marginTop: 12 }}>
              <Button
                disabled={
                  !uploadPreview || !uploadPreview.some((r) => r.selected)
                }
                onClick={() => {
                  if (!uploadPreview) return;
                  const rows = uploadPreview
                    .filter((r) => r.selected)
                    .map((r) => {
                      const matched = inventory.find(
                        (p) => p.id === r.matchedProductId
                      );
                      const oldPrice = matched
                        ? matched.newPrice ?? matched.sellingPrice ?? 0
                        : 0;
                      const newPrice =
                        typeof r.newPrice === "number" ? r.newPrice : null;
                      return {
                        ...r,
                        oldPrice,
                        delta: newPrice != null ? newPrice - oldPrice : 0,
                        include: !!r.selected,
                        priceInvalid:
                          !!r.priceInvalid ||
                          (newPrice != null && !Number.isFinite(newPrice)),
                      } as ReviewRow;
                    });
                  setReviewRows(rows);
                  setIsReviewOpen(true);
                }}
              >
                Review changes (
                {uploadPreview
                  ? uploadPreview.filter((r) => r.selected).length
                  : 0}
                )
              </Button>
              <Table striped verticalSpacing="sm">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <Checkbox
                        checked={uploadPreview.every((r) => r.selected)}
                        indeterminate={
                          uploadPreview.some((r) => r.selected) &&
                          !uploadPreview.every((r) => r.selected)
                        }
                        onChange={(e) => {
                          const v = e.currentTarget.checked;
                          setUploadPreview((prev) =>
                            prev
                              ? prev.map((r) => ({ ...r, selected: v }))
                              : prev
                          );
                        }}
                      />
                    </th>
                    <th>#</th>
                    <th>SKU / Code</th>
                    <th>Name</th>
                    <th>New Price</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadPreview.map((r, idx) => (
                    <tr key={idx}>
                      <td>
                        <Checkbox
                          checked={!!r.selected}
                          onChange={(e) =>
                            setUploadPreview((prev) =>
                              prev
                                ? prev.map((row, i) =>
                                    i === idx
                                      ? {
                                          ...row,
                                          selected: e.currentTarget.checked,
                                        }
                                      : row
                                  )
                                : prev
                            )
                          }
                        />
                      </td>
                      <td>{idx + 1}</td>
                      <td>{r.sku ?? r.code ?? "-"}</td>
                      <td>{r.name ?? "-"}</td>
                      <td style={{ textAlign: "right", width: 160 }}>
                        <NumberInput
                          value={r.newPrice ?? undefined}
                          min={0}
                          onChange={(val: string | number) => {
                            const num =
                              typeof val === "number"
                                ? val
                                : Number(String(val).replace(/[^0-9.]/g, ""));
                            setUploadPreview((prev) =>
                              prev
                                ? prev.map((row, i) =>
                                    i === idx
                                      ? {
                                          ...row,
                                          newPrice: Number.isFinite(num)
                                            ? num
                                            : null,
                                          priceInvalid: !Number.isFinite(num),
                                        }
                                      : row
                                  )
                                : prev
                            );
                          }}
                        />
                        {r.priceInvalid && (
                          <Text c="red" size="xs">
                            Invalid price
                          </Text>
                        )}
                      </td>
                      <td>{r.matchedProductName ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Group justify="flex-end" style={{ marginTop: 12 }}>
                <Button
                  color="green"
                  onClick={async () => {
                    // Apply selected rows (for now apply all parsed rows)
                    if (!uploadPreview) return;
                    try {
                      const res = await fetch("/api/apply-rates", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ rows: uploadPreview }),
                      });
                      if (!res.ok) throw new Error(await res.text());
                      const json = (await res.json()) as ApplyResponse;
                      // json.updated should contain updated product records
                      const updated = json.updated ?? [];
                      if (updated.length) {
                        setInventory((prev) => {
                          const map = new Map(
                            updated.map((u) => [u.id, u] as const)
                          );
                          return prev.map((p) =>
                            map.has(p.id)
                              ? {
                                  ...p,
                                  ...(map.get(p.id) as {
                                    id: number;
                                    newPrice?: number;
                                  }),
                                }
                              : p
                          );
                        });
                      }
                      setIsUploadOpen(false);
                      setUploadPreview(null);
                      setUploadFile(null);
                      alert("Rates applied successfully");
                    } catch (err) {
                      console.error(err);
                      alert("Apply failed: " + String(err));
                    }
                  }}
                >
                  Apply Rates
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setUploadPreview(null);
                    setUploadFile(null);
                  }}
                >
                  Clear
                </Button>
              </Group>
            </div>
          )}
        </div>
      </Modal>

      {/* Review modal */}
      <Modal
        opened={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Review changes"
        size="70%"
      >
        <div>
          <Table striped verticalSpacing="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>SKU</th>
                <th>Product</th>
                <th>Old Price</th>
                <th>New Price</th>
                <th>Delta</th>
                <th>Include</th>
              </tr>
            </thead>
            <tbody>
              {reviewRows?.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.sku ?? r.code ?? "-"}</td>
                  <td>{r.matchedProductName ?? r.name ?? "-"}</td>
                  <td>{formatCurrency(r.oldPrice ?? 0)}</td>
                  <td>
                    <NumberInput
                      value={r.newPrice ?? undefined}
                      min={0}
                      onChange={(v: string | number) => {
                        const num =
                          typeof v === "number"
                            ? v
                            : Number(String(v).replace(/[^0-9.]/g, ""));
                        setReviewRows((prev) =>
                          prev
                            ? prev.map((row, idx) =>
                                idx === i
                                  ? {
                                      ...row,
                                      newPrice: Number.isFinite(num)
                                        ? num
                                        : null,
                                      delta:
                                        (Number.isFinite(num) ? num : 0) -
                                        (row.oldPrice ?? 0),
                                      priceInvalid: !Number.isFinite(num),
                                    }
                                  : row
                              )
                            : prev
                        );
                      }}
                    />
                    {r.priceInvalid && (
                      <Text c="red" size="xs">
                        Invalid price
                      </Text>
                    )}
                  </td>
                  <td
                    style={{
                      color:
                        r.delta && r.delta > 0
                          ? "red"
                          : r.delta && r.delta < 0
                          ? "green"
                          : undefined,
                    }}
                  >
                    {r.delta != null ? formatCurrency(r.delta) : "-"}
                  </td>
                  <td>
                    <Checkbox
                      checked={!!r.include}
                      onChange={(e) =>
                        setReviewRows((prev) =>
                          prev
                            ? prev.map((row, idx) =>
                                idx === i
                                  ? { ...row, include: e.currentTarget.checked }
                                  : row
                              )
                            : prev
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Group justify="flex-end" style={{ marginTop: 12 }}>
            <Button
              color="green"
              onClick={() => {
                if (!reviewRows) return;
                // build apply list
                const toApply = reviewRows.filter(
                  (r) => r.include && r.matchedProductId && r.newPrice != null
                );
                if (toApply.length === 0) {
                  alert("No rows selected to apply");
                  return;
                }
                // create undo snapshot
                const snap = new Map<number, number>();
                for (const r of toApply) {
                  const id = r.matchedProductId!;
                  const prod = inventory.find((p) => p.id === id);
                  snap.set(
                    id,
                    prod ? prod.newPrice ?? prod.sellingPrice ?? 0 : 0
                  );
                }
                setUndoSnapshot(snap);
                // apply locally
                setInventory((prev) =>
                  prev.map((p) => {
                    if (snap.has(p.id)) {
                      const newVal = toApply.find(
                        (x) => x.matchedProductId === p.id
                      )!.newPrice!;
                      return { ...p, newPrice: newVal };
                    }
                    return p;
                  })
                );
                setIsReviewOpen(false);
                setIsUploadOpen(false);
                setUploadPreview(null);
                setUploadFile(null);
                // show small undo affordance by keeping undoSnapshot for 30s
                setTimeout(() => setUndoSnapshot(null), 30000);
              }}
            >
              Confirm Apply
            </Button>
            <Button variant="default" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Undo notice */}
      {undoSnapshot && (
        <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
          <Group>
            <Button
              color="yellow"
              onClick={() => {
                // rollback
                setInventory((prev) =>
                  prev.map((p) =>
                    undoSnapshot.has(p.id)
                      ? { ...p, newPrice: undoSnapshot.get(p.id)! }
                      : p
                  )
                );
                setUndoSnapshot(null);
              }}
            >
              Undo recent rate changes
            </Button>
          </Group>
        </div>
      )}
    </div>
  );
}
