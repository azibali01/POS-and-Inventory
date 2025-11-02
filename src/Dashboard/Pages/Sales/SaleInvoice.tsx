import { useState, useMemo, useEffect } from "react";
import {
  Modal,
  ScrollArea,
  Button,
  Box,
  Text,
  Menu,
  ActionIcon,
  Table,
  Title,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconPrinter,
  IconDotsVertical,
} from "@tabler/icons-react";
import openPrintWindow from "../../../components/print/printWindow";
import SalesDocShell, {
  type SalesPayload,
} from "../../../components/sales/SalesDocShell";
import { useDataContext } from "../../Context/DataContext";
import { formatCurrency } from "../../../lib/format-utils";
import { showNotification } from "@mantine/notifications";
import type { SaleRecordPayload } from "../../../lib/api";

// Extend SaleRecord type to include items, id, and date for edit logic compatibility
export type SaleRecordWithItems = SaleRecordPayload & {
  items?: any[];
  id?: string | number;
  date?: string;
};

type SaleItem = {
  id?: string | number;
  _id?: string | number;
  sku?: string;
  productId?: string | number;
  productName?: string;
  itemName?: string;
  name?: string;
  quantity?: number;
  salesRate?: number;
  sellingPrice?: number;
  thickness?: number | string;
  discount?: number;
  discountAmount?: number;
  length?: number;
  color?: string;
  unit?: string;
  price?: number;
  totalGrossAmount?: number;
  totalNetAmount?: number;
  openingStock?: number;
  minimumStockLevel?: number;
  metadata?: Record<string, unknown>;
};

export default function SaleInvoice() {
  const {
    customers,
    inventory,
    quotations,
    setQuotations,
    createSale,
    sales,
    deleteSale,
    loadInventory,
  } = useDataContext();

  // Ensure products (inventory) are loaded on mount
  useEffect(() => {
    if (!inventory || inventory.length === 0) {
      loadInventory();
    }
  }, [inventory, loadInventory]);

  const [importQuotationSearch, setImportQuotationSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editPayload, setEditPayload] = useState<SalesPayload | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [initialPayload, setInitialPayload] = useState<SalesPayload | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  // const [deleteTargetDisplay, setDeleteTargetDisplay] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredQuotations = useMemo(() => {
    if (!importQuotationSearch) return quotations;
    const search = importQuotationSearch.toLowerCase();
    return quotations.filter((q) => {
      const docNo = String(q.quotationNumber ?? "").toLowerCase();
      return docNo.includes(search);
    });
  }, [importQuotationSearch, quotations]);

  const [deleteTarget, setDeleteTarget] = useState<string | number | null>(
    null
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSale(String(deleteTarget));
      showNotification({
        title: "Invoice Deleted",
        message: `Invoice ${deleteTarget} deleted successfully`,
        color: "green",
      });
    } catch (err) {
      showNotification({
        title: "Delete Failed",
        message: String(err),
        color: "red",
      });
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  }

  function makeInvoiceNumber() {
    // Always start from INV-0001 and increment
    const prefix = "INV-";
    let maxNum = 0;
    if (sales && sales.length > 0) {
      sales.forEach((s) => {
        const numStr = String(s.invoiceNumber || s.id || "");
        if (numStr.startsWith(prefix)) {
          const n = parseInt(numStr.replace(prefix, ""), 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      });
    }
    // If no sales, start from 1
    const nextNum = (maxNum === 0 ? 1 : maxNum + 1).toString().padStart(4, "0");
    return `${prefix}${nextNum}`;
  }

  async function handleQuotationImportSubmit(payload: SalesPayload) {
    const invoiceNumber = makeInvoiceNumber();
    // Always set invoiceDate for new invoice
    const invoiceDate = payload.docDate || new Date().toISOString();
    // Robustly find the full customer object, fallback to minimal if not found
    let cust = customers.find(
      (c) => String(c._id) === String(payload.customer)
    );
    if (!cust && payload.customer) {
      if (typeof payload.customer === "object" && "name" in payload.customer) {
        const id =
          "_id" in payload.customer && payload.customer._id
            ? payload.customer._id
            : String(payload.customer.name);
        cust = {
          _id: id,
          name: payload.customer.name,
        };
      } else {
        cust = {
          _id: String(payload.customer),
          name: String(payload.customer),
        };
      }
    }
    const products =
      payload.items?.map((it) => {
        const inv = inventory.find(
          (p) =>
            String(p._id) === String(it._id) ||
            String(p.itemName) === String(it.itemName)
        );
        return {
          _id: inv?._id,
          itemName: inv?.itemName ?? it.itemName,
          category: inv?.category ?? "",
          salesRate: Number(inv?.salesRate ?? it.salesRate ?? 0),
          color: it.color ?? inv?.color ?? "",
          thickness: it.thickness ?? inv?.thickness ?? undefined,
          openingStock: Number(inv?.openingStock ?? 0),
          minimumStockLevel: Number(inv?.minimumStockLevel ?? 0),
          quantity: Number(it.quantity ?? 0),
          unit: it.unit ?? inv?.unit ?? undefined,
          discount: Number(it.discount ?? 0),
          discountAmount: Number(it.discountAmount ?? 0),
          length: it.length ?? undefined,
          metadata: {
            price: it.salesRate ?? undefined,
          },
        } as SaleItem;
      }) ?? [];
    const mappedProducts = products.map((item) => ({
      ...item,
      thickness:
        typeof item.thickness === "string"
          ? isNaN(Number(item.thickness))
            ? undefined
            : Number(item.thickness)
          : item.thickness,
    }));
    const apiPayload: SaleRecordPayload = {
      invoiceNumber,
      invoiceDate,
      products: mappedProducts,
      items: mappedProducts, // send as items too
      subTotal: payload.totals?.subTotal ?? 0,
      totalGrossAmount: payload.totals?.totalGrossAmount ?? 0,
      totalNetAmount: payload.totals?.totalNetAmount ?? 0,
      discount: 0,
      totalDiscount: payload.totals?.totalDiscountAmount ?? 0,
      quotationDate: invoiceDate,
      customer: cust ?? null,
      paymentMethod: undefined,
      length: payload.items?.length ?? 0,
      metadata: { source: "quotation-import" },
    };
    console.log("SaleInvoice payload:", apiPayload);
    try {
      await createSale(apiPayload);
    } catch (err: unknown) {
      const responseData =
        typeof err === "object" && err !== null && "response" in err
          ? (err as unknown as { response?: { data?: unknown } }).response?.data
          : undefined;
      const message =
        (typeof responseData === "object" &&
          responseData &&
          "message" in responseData &&
          (responseData as { message?: string }).message) ||
        (typeof responseData === "string" ? responseData : undefined) ||
        (typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message
          : undefined) ||
        String(err);
      showNotification({
        title: "Sale Persist Failed",
        message,
        color: "red",
      });
    }
    const now = new Date().toISOString();
    setQuotations((prev) =>
      prev.map((q) => {
        const key = q.quotationNumber;
        if (
          key === payload.sourceQuotationId ||
          String(key) === String(payload.sourceQuotationId)
        ) {
          return {
            ...q,
            status: "converted",
            convertedInvoiceId: invoiceNumber,
            convertedAt: now,
          };
        }
        return q;
      })
    );
    setOpen(false);
    setInitialPayload(null);
  }

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            gap: 8,
          }}
        >
          <Title>Sales Invoices</Title>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              onClick={() => setImportOpen(true)}
              variant="filled"
              size="sm"
            >
              Import from Quotation
            </Button>
            <Button onClick={() => setOpen(true)} variant="filled" size="sm">
              + Add Sale Invoice
            </Button>
          </div>
        </div>
        {/* Add Sale Invoice Modal */}
        <Modal
          opened={open && !initialPayload}
          onClose={() => setOpen(false)}
          title="Create Sale Invoice"
          size="80%"
        >
          <ScrollArea style={{ height: "70vh", width: "100%" }}>
            <SalesDocShell
              mode="Invoice"
              customers={customers}
              products={inventory}
              submitting={submitting}
              setSubmitting={setSubmitting}
              onSubmit={handleQuotationImportSubmit}
              initial={{
                docNo: makeInvoiceNumber(),
                docDate: new Date().toISOString(),

                mode: "Invoice",
                items: [],
                totals: {
                  subTotal: 0,
                  total: 0,
                  amount: 0,
                  totalGrossAmount: 0,
                  totalDiscountAmount: 0,
                  totalNetAmount: 0,
                },
                terms: "",
                remarks: "",
              }}
            />
          </ScrollArea>
        </Modal>
        {sales && sales.length > 0 ? (
          <Table withRowBorders withColumnBorders highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Invoice #</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sales.map((inv, idx) => (
                <Table.Tr key={inv.invoiceNumber ?? inv.id ?? idx}>
                  <Table.Td>{inv.invoiceNumber ?? inv.id}</Table.Td>
                  <Table.Td>
                    {inv.invoiceDate
                      ? new Date(inv.invoiceDate).toLocaleDateString()
                      : inv.date
                      ? new Date(inv.date).toLocaleDateString()
                      : ""}
                  </Table.Td>
                  <Table.Td>
                    {
                      // Prefer customerName if it's a string and not an invoice number
                      typeof inv.customerName === "string" &&
                      inv.customerName &&
                      !/^INV-\d+$/i.test(inv.customerName)
                        ? inv.customerName
                        : Array.isArray(inv.customer) &&
                          inv.customer[0]?.name &&
                          !/^INV-\d+$/i.test(inv.customer[0].name)
                        ? inv.customer[0].name
                        : typeof inv.customer === "object" &&
                          inv.customer &&
                          "name" in inv.customer &&
                          typeof inv.customer.name === "string" &&
                          !/^INV-\d+$/i.test(inv.customer.name)
                        ? inv.customer.name
                        : ""
                    }
                  </Table.Td>
                  <Table.Td>
                    {formatCurrency(
                      inv.totalNetAmount ?? inv.subTotal ?? inv.amount ?? 0
                    )}
                  </Table.Td>

                  <Table.Td>
                    <Menu withinPortal shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDotsVertical />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={16} />}
                          onClick={() => {
                            // Cast inv as SaleRecordWithItems to access items property
                            const invWithItems = inv as SaleRecordWithItems;
                            const { products, ...rest } = invWithItems;
                            setEditPayload({
                              ...rest,
                              mode: "Invoice",
                              docNo: String(
                                invWithItems.invoiceNumber ??
                                  invWithItems.id ??
                                  ""
                              ),
                              docDate:
                                typeof invWithItems.invoiceDate === "string"
                                  ? invWithItems.invoiceDate
                                  : invWithItems.invoiceDate
                                  ? String(invWithItems.invoiceDate)
                                  : typeof invWithItems.date === "string"
                                  ? invWithItems.date
                                  : "",
                              customer:
                                Array.isArray(invWithItems.customer) &&
                                invWithItems.customer[0]?.name
                                  ? { name: invWithItems.customer[0].name }
                                  : undefined,
                              items: (
                                (invWithItems.items &&
                                invWithItems.items.length > 0
                                  ? invWithItems.items
                                  : invWithItems.products) ?? []
                              ).map((it: any) => ({
                                ...it,
                                unit:
                                  typeof it.unit === "string"
                                    ? it.unit
                                    : it.unit !== undefined
                                    ? String(it.unit)
                                    : "",
                                amount:
                                  (it.quantity ?? 0) * (it.salesRate ?? 0),
                                totalGrossAmount:
                                  (it.quantity ?? 0) * (it.salesRate ?? 0),
                                totalNetAmount:
                                  (it.quantity ?? 0) * (it.salesRate ?? 0),
                              })),
                              totals: {
                                subTotal: inv.subTotal ?? 0,
                                total: inv.totalNetAmount ?? 0,
                                amount: inv.amount ?? 0,
                                totalGrossAmount: inv.totalGrossAmount ?? 0,
                                totalDiscountAmount: inv.totalDiscount ?? 0,
                                totalNetAmount: inv.totalNetAmount ?? 0,
                              },
                              remarks: inv.remarks ?? "",
                              terms: "",
                            });
                            setEditOpen(true);
                            setEditingId(inv.invoiceNumber ?? inv.id ?? "");
                          }}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconPrinter size={16} />}
                          onClick={() => {
                            // Print logic: build invoice data and open print window
                            const items = (inv.products ?? []).map((it) => ({
                              ...it,
                              unit:
                                typeof it.unit === "string"
                                  ? it.unit
                                  : it.unit !== undefined
                                  ? String(it.unit)
                                  : "",
                              amount: (it.quantity ?? 0) * (it.salesRate ?? 0),
                              totalGrossAmount:
                                (it.quantity ?? 0) * (it.salesRate ?? 0),
                              totalNetAmount:
                                (it.quantity ?? 0) * (it.salesRate ?? 0),
                            }));
                            openPrintWindow({
                              title: "Sales Invoice",
                              companyName: "Seven Star Traders",
                              addressLines: [
                                "Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan",
                              ],
                              invoiceNo: String(
                                inv.invoiceNumber ?? inv.id ?? ""
                              ),
                              date:
                                typeof inv.invoiceDate === "string"
                                  ? inv.invoiceDate
                                  : inv.invoiceDate
                                  ? String(inv.invoiceDate)
                                  : typeof inv.date === "string"
                                  ? inv.date
                                  : "",
                              ms:
                                Array.isArray(inv.customer) &&
                                inv.customer[0]?.name
                                  ? inv.customer[0].name
                                  : inv.customerName ?? "",
                              customer:
                                Array.isArray(inv.customer) &&
                                inv.customer[0]?.name
                                  ? inv.customer[0].name
                                  : inv.customerName ?? "",
                              grn: null,
                              items,
                              totals: {
                                subtotal: inv.subTotal ?? 0,
                                total: inv.totalNetAmount ?? 0,
                              },
                              footerNotes: [
                                "Extrusion & Powder Coating",
                                "Aluminum Window, Door, Profiles & All Kinds of Pipes",
                              ],
                            });
                          }}
                        >
                          Print
                        </Menu.Item>
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => {
                            setDeleteTarget(inv.invoiceNumber ?? inv.id ?? "");
                            setDeleteModalOpen(true);
                          }}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <div>No sales invoices found.</div>
        )}
      </div>
      {/* Edit Invoice Modal */}
      <Modal
        opened={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditPayload(null);
          setEditingId(null);
        }}
        title={`Edit Invoice: ${editPayload?.docNo || editingId}`}
        size="80%"
      >
        <ScrollArea>
          {editPayload && (
            <SalesDocShell
              mode="Invoice"
              customers={customers}
              products={inventory}
              initial={editPayload}
              submitting={submitting}
              setSubmitting={setSubmitting}
              onSubmit={async () => {
                // ...edit logic here if needed...
              }}
            />
          )}
        </ScrollArea>
      </Modal>

      {/* Import Quotation Modal */}
      <Modal
        opened={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import from Quotation"
        size="80%"
      >
        <ScrollArea>
          <div style={{ padding: 12 }}>
            <h3>Quotations</h3>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search by Quotation Number..."
                value={importQuotationSearch || ""}
                onChange={(e) => setImportQuotationSearch(e.target.value)}
                style={{
                  padding: 6,
                  width: 260,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
            {filteredQuotations.length === 0 && <div>No quotations found</div>}
            <div style={{ display: "grid", gap: 8 }}>
              {filteredQuotations.map((q, idx) => (
                <div
                  key={q.quotationNumber ?? `quotation-${idx}`}
                  style={{
                    padding: 12,
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {q.quotationNumber ?? `Quotation ${idx + 1}`}
                      </div>
                      <div style={{ color: "#666" }}>
                        Date:{" "}
                        {q.quotationDate
                          ? new Date(
                              q.quotationDate as string
                            ).toLocaleDateString()
                          : "-"}
                        {"validUntil" in q && q.validUntil
                          ? typeof q.validUntil === "string" ||
                            typeof q.validUntil === "number" ||
                            q.validUntil instanceof Date
                            ? ` • Valid until ${new Date(
                                q.validUntil
                              ).toLocaleDateString()}`
                            : ""
                          : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {q.products?.length ?? 0} items
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {formatCurrency(q.subTotal ?? 0)}
                      </div>
                    </div>
                  </div>
                  {/* ...items table, remarks, and import button as in previous logic... */}
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      size="xs"
                      onClick={() => {
                        // Convert quotation to SalesPayload-compatible import form
                        const items = (q.products ?? []).map((it, idx) => {
                          function getProp<TResult = unknown>(
                            obj: Record<string, unknown>,
                            ...keys: string[]
                          ): TResult | undefined {
                            for (const key of keys) {
                              if (
                                obj &&
                                typeof obj === "object" &&
                                key in obj
                              ) {
                                return obj[key] as TResult;
                              }
                            }
                            return undefined;
                          }
                          let lengthValue: number | undefined;
                          const rawLength = getProp<
                            string | number | undefined
                          >(it as Record<string, unknown>, "length");
                          if (typeof rawLength === "string") {
                            const parsed = Number(rawLength);
                            lengthValue = isNaN(parsed) ? undefined : parsed;
                          } else if (typeof rawLength === "number") {
                            lengthValue = rawLength;
                          }
                          return {
                            // Map fields as needed, add any missing fields with sensible defaults
                            ...it,
                            id: it._id, // ensure id is present
                            quantity: Number(it.quantity ?? 0),
                            salesRate: Number(it.salesRate ?? 0),
                            discount: Number(it.discount ?? 0),
                            discountAmount: Number(it.discountAmount ?? 0),
                            length: lengthValue,
                            totalGrossAmount: Number(it.totalGrossAmount ?? 0),
                            totalNetAmount: Number(it.totalNetAmount ?? 0),
                            metadata: {
                              // Ensure metadata is always an object
                              ...(it.metadata ?? {}),
                              // Add any additional metadata fields here
                            },
                          };
                        });
                        const apiPayload: SalesPayload = {
                          docNo: q.quotationNumber ?? `Quotation ${idx + 1}`,
                          docDate: q.quotationDate
                            ? new Date(q.quotationDate as string).toISOString()
                            : new Date().toISOString(),
                          mode: "Invoice",
                          items,
                          totals: {
                            subTotal: q.subTotal ?? 0,
                            total: q.totalNetAmount ?? 0,
                            amount: q.amount ?? 0,
                            totalGrossAmount: q.totalGrossAmount ?? 0,
                            totalDiscountAmount: q.totalDiscount ?? 0,
                            totalNetAmount: q.totalNetAmount ?? 0,
                          },
                          remarks: q.remarks ?? "",
                          terms: "",
                          customer: null, // Set customer to null or a default value
                          paymentMethod: undefined,
                          length: items.length,
                          metadata: { source: "quotation-import" },
                        };
                        console.log(
                          "Importing quotation as SalePayload:",
                          apiPayload
                        );
                        setInitialPayload(apiPayload);
                        setOpen(true);
                        setImportOpen(false);
                      }}
                    >
                      Import
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <Box p="md">
          <Text size="sm">
            Are you sure you want to delete this invoice? This action cannot be
            undone.
          </Text>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button
              variant="outline"
              color="red"
              onClick={confirmDelete}
              loading={submitting}
            >
              Delete Invoice
            </Button>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}
