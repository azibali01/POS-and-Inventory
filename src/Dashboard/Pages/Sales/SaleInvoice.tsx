/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Modal,
  Button,
  Box,
  Text,
  TextInput,
  Select,
  Menu,
  ActionIcon,
  Table,
  Title,
  Pagination,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconPrinter,
  IconDotsVertical,
  IconSearch,
} from "@tabler/icons-react";
import openPrintWindow from "../../../components/print/printWindow";
import { generateGatePassHTML } from "../../../components/print/printTemplate";
import SalesDocShell, {
  type SalesPayload,
} from "../../../components/sales/SalesDocShell";
import SavedDraftsPanel from "../../../components/sales/SavedDraftsPanel";
import ShiftManager from "../../../components/sales/ShiftManager";
import { useSales, useSalesList, useQuotations } from "../../../hooks/useSales";
import { useCustomer } from "../../../hooks/useCustomer";
import { useShift } from "../../../hooks/useShift";
import { useInventory } from "../../../lib/hooks/useInventory";
import { formatCurrency } from "../../../lib/format-utils";
import { showNotification } from "@mantine/notifications";
import type { SaleRecordPayload } from "../../../api";
import { generateNextDocumentNumber } from "../../../utils/document-utils";
import { buildSaleApiPayload } from "./sale-invoice-helpers";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  findSelectedProduct,
  findSelectedVariant,
  toProductId,
} from "../../../lib/variant-line-item-utils";

// Extend SaleRecord type to include items, id, and date for edit logic compatibility
export type SaleRecordWithItems = SaleRecordPayload & {
  items?: SaleItem[];
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

function formatDateForInput(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function normalizeInvoiceCustomer(
  customer: unknown,
  customers: Array<{
    _id?: string | number;
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    openingAmount?: number;
    paymentType?: "Credit" | "Debit";
  }>,
  customerName?: string,
) {
  if (Array.isArray(customer) && customer[0]) {
    const first = customer[0] as {
      _id?: string | number;
      id?: string | number;
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      openingAmount?: number;
      paymentType?: "Credit" | "Debit";
    };

    if (first.name) {
      return {
        _id: first._id,
        id: first.id ?? first._id,
        name: first.name,
        phone: first.phone,
        address: first.address,
        city: first.city,
        openingAmount: first.openingAmount,
        paymentType: first.paymentType,
      };
    }
  }

  if (customer && typeof customer === "object" && "name" in customer) {
    const entry = customer as {
      _id?: string | number;
      id?: string | number;
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      openingAmount?: number;
      paymentType?: "Credit" | "Debit";
    };

    if (entry.name) {
      return {
        _id: entry._id,
        id: entry.id ?? entry._id,
        name: entry.name,
        phone: entry.phone,
        address: entry.address,
        city: entry.city,
        openingAmount: entry.openingAmount,
        paymentType: entry.paymentType,
      };
    }
  }

  const fallbackName = String(customerName ?? "").trim();
  if (fallbackName) {
    const matchedCustomer = customers.find(
      (entry) =>
        String(entry.name ?? "")
          .trim()
          .toLowerCase() === fallbackName.toLowerCase(),
    );

    if (matchedCustomer?.name) {
      return {
        _id: matchedCustomer._id,
        id: matchedCustomer._id,
        name: matchedCustomer.name,
        phone: matchedCustomer.phone,
        address: matchedCustomer.address,
        city: matchedCustomer.city,
        openingAmount: matchedCustomer.openingAmount,
        paymentType: matchedCustomer.paymentType,
      };
    }

    return {
      name: fallbackName,
    };
  }

  return undefined;
}

function mapInvoiceItemForEdit(item: SaleItem, inventory: any[]) {
  const productId = item.productId ?? item._id ?? item.id ?? "";
  const productName = item.productName ?? item.itemName ?? item.name ?? "";
  const selectedProduct = findSelectedProduct(inventory, {
    productId,
    productName,
    itemName: productName,
  });
  const variant = findSelectedVariant(
    selectedProduct,
    String(item.thickness ?? ""),
    String(item.color ?? ""),
    String(item.length ?? ""),
    item.sku,
  );
  const resolvedProductId =
    toProductId(selectedProduct?._id) || toProductId(productId);
  const resolvedThickness = String(item.thickness ?? variant?.thickness ?? "");
  const resolvedColor = String(item.color ?? variant?.color ?? "");
  const resolvedRate = Number(item.salesRate ?? item.sellingPrice ?? 0);
  const resolvedQuantity = Number(item.quantity ?? 0);
  const resolvedLength = Number(item.length ?? 0);
  const subtotal = Number(
    item.totalGrossAmount ?? resolvedQuantity * resolvedRate * resolvedLength,
  );
  const discountAmount = Number(item.discountAmount ?? 0);

  return {
    ...item,
    _id: resolvedProductId,
    productId: resolvedProductId,
    sku: String(item.sku ?? variant?.sku ?? ""),
    productName: String(selectedProduct?.itemName ?? productName),
    itemName: String(selectedProduct?.itemName ?? productName),
    unit:
      typeof item.unit === "string"
        ? item.unit
        : item.unit !== undefined
          ? String(item.unit)
          : String(selectedProduct?.unit ?? ""),
    thickness: resolvedThickness,
    color: resolvedColor,
    quantity: resolvedQuantity,
    salesRate: resolvedRate,
    rate: resolvedRate,
    discount: Number(item.discount ?? 0),
    discountAmount,
    length: resolvedLength,
    amount: subtotal,
    subtotal,
    totalGrossAmount: subtotal,
    totalNetAmount: Number(
      item.totalNetAmount ?? Math.max(0, subtotal - discountAmount),
    ),
    availableStock: Number(
      variant?.availableStock ?? variant?.openingStock ?? 0,
    ),
    openingStock: Number(variant?.openingStock ?? variant?.availableStock ?? 0),
    brand: String((selectedProduct as any)?.brand ?? item.brand ?? ""),
  };
}

function buildEditPayload(
  invoice: SaleRecordWithItems,
  customers: Array<{
    _id?: string | number;
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    openingAmount?: number;
    paymentType?: "Credit" | "Debit";
  }>,
  inventory: any[],
): SalesPayload {
  const items = (
    (invoice.items && invoice.items.length > 0
      ? invoice.items
      : invoice.products) ?? []
  ).map((item: any) => mapInvoiceItemForEdit(item, inventory));

  return {
    ...invoice,
    mode: "Invoice",
    docNo: String(invoice.invoiceNumber ?? invoice.id ?? ""),
    docDate: formatDateForInput(
      invoice.invoiceDate ?? invoice.date ?? invoice.quotationDate,
    ),
    customer: normalizeInvoiceCustomer(
      invoice.customer,
      customers,
      invoice.customerName,
    ),
    items,
    totals: {
      subTotal: invoice.subTotal ?? 0,
      total: invoice.totalNetAmount ?? invoice.amount ?? 0,
      amount: invoice.amount ?? invoice.totalNetAmount ?? 0,
      totalGrossAmount: invoice.totalGrossAmount ?? 0,
      totalDiscountAmount:
        (invoice as SaleRecordPayload & { totalDiscountAmount?: number })
          .totalDiscountAmount ??
        invoice.totalDiscount ??
        0,
      totalNetAmount: invoice.totalNetAmount ?? 0,
    },
    remarks: invoice.remarks ?? "",
    terms: "",
    receivedAmount:
      (invoice as SaleRecordPayload & { receivedAmount?: number })
        .receivedAmount ?? 0,
  };
}

export default function SaleInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sales, createSaleAsync, deleteSaleAsync } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const {
    sales: salesPage,
    pagination,
    isLoading: salesListLoading,
  } = useSalesList({
    page: currentPage,
    limit: Number(pageSize),
    search: debouncedSearch || undefined,
  });
  const { quotations, updateQuotationAsync } = useQuotations();
  const { customers } = useCustomer();
  const { inventory } = useInventory();

  // Inventory is auto-loaded by useInventory hook

  const [importQuotationSearch, setImportQuotationSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editPayload, setEditPayload] = useState<SalesPayload | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [initialPayload, setInitialPayload] = useState<SalesPayload | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [shiftManagerOpen, setShiftManagerOpen] = useState(false);
  const { hasActiveSession } = useShift();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  // const [deleteTargetDisplay, setDeleteTargetDisplay] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createInitialPayload = useMemo<SalesPayload>(
    () => ({
      docNo: generateNextDocumentNumber(
        "INV",
        sales.map((s) => String(s.invoiceNumber || s.id || "")),
        4,
      ),
      docDate: (() => {
        let dateObj: Date;
        if (sales && sales.length > 0) {
          const latest = sales.reduce<Date | null>((max: Date | null, s) => {
            const nextDate = s.invoiceDate
              ? new Date(s.invoiceDate)
              : s.date
                ? new Date(s.date)
                : null;
            return nextDate && (!max || nextDate > max) ? nextDate : max;
          }, null);
          dateObj = latest || new Date();
        } else {
          dateObj = new Date();
        }

        return dateObj.toISOString().slice(0, 10);
      })(),
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
    }),
    [sales],
  );

  const filteredQuotations = useMemo(() => {
    if (!importQuotationSearch) return quotations;
    const search = importQuotationSearch.toLowerCase();
    return quotations.filter((q) => {
      const docNo = String(q.quotationNumber ?? "").toLowerCase();
      return docNo.includes(search);
    });
  }, [importQuotationSearch, quotations]);

  const [deleteTarget, setDeleteTarget] = useState<string | number | null>(
    null,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Handle incoming route state for quotation conversion
  useEffect(() => {
    if (location.state && location.state.importQuotation) {
      const q = location.state.importQuotation;
      setInitialPayload(q);
      setOpen(true);
      // Clean up state so refreshing won't re-trigger it
      navigate("/sales/invoices", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSaleAsync(String(deleteTarget));
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

  // Handler for creating a new sale invoice (not import)
  async function handleCreateInvoiceSubmit(payload: SalesPayload) {
    const existingInvoiceNumbers = sales.map((s) =>
      String(s.invoiceNumber || s.id || ""),
    );
    const invoiceNumber = generateNextDocumentNumber(
      "INV",
      existingInvoiceNumbers,
      4,
    );

    const apiPayload = buildSaleApiPayload(
      payload,
      invoiceNumber,
      inventory as any,
      customers as any,
    );

    try {
      await createSaleAsync(apiPayload);
      // Reset local form state after successful persistence.
      setOpen(false);
      setInitialPayload(null);
      navigate("/sales/invoices");
    } catch (err: unknown) {
      // Error toast is handled centrally in useSales onError.
    }
  }

  // Handler for importing quotation
  async function handleQuotationImportSubmit(payload: SalesPayload) {
    const existingInvoiceNumbers = sales.map((s) =>
      String(s.invoiceNumber || s.id || ""),
    );
    const invoiceNumber = generateNextDocumentNumber(
      "INV",
      existingInvoiceNumbers,
      4,
    );

    const apiPayload = buildSaleApiPayload(
      payload,
      invoiceNumber,
      inventory as any,
      customers as any,
    );

    try {
      await createSaleAsync(apiPayload);
      // Reset local form state after successful persistence.
      setOpen(false);
      setInitialPayload(null);
      navigate("/sales/invoices");
    } catch (err: unknown) {
      // Error toast is handled centrally in useSales onError.
      return;
    }

    // Update quotation status
    // Update quotation status via API
    try {
      const qNum = String(payload.sourceQuotationId);
      await updateQuotationAsync({
        quotationNumber: qNum,
        data: {
          status: "converted",
          convertedInvoiceId: invoiceNumber,
          convertedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Failed to update quotation status", err);
      // Non-blocking error, but good to log
    }
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
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Title>Sales Invoices</Title>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <TextInput
              placeholder="Search invoices, customers, items..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.currentTarget.value);
              }}
              leftSection={<IconSearch size={16} />}
              style={{ minWidth: 280 }}
            />
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value || "10");
                setCurrentPage(1);
              }}
              data={["10", "25", "50"]}
              w={96}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                onClick={() => {
                  setImportOpen(true);
                }}
                variant="filled"
                size="sm"
              >
                Import from Quotation
              </Button>
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                variant="filled"
                size="sm"
              >
                + Add Sale Invoice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraftsOpen(true);
                }}
              >
                Saved Drafts
              </Button>
              <Button
                variant={hasActiveSession ? "light" : "outline"}
                size="sm"
                color={hasActiveSession ? "green" : "yellow"}
                onClick={() => {
                  setShiftManagerOpen(true);
                }}
              >
                {hasActiveSession ? "Shift Open" : "Shift Manager"}
              </Button>
            </div>
          </div>
        </div>
        <Text c="dimmed" size="sm" mb="sm">
          Showing {salesPage.length} of {pagination.total} sales invoices
        </Text>
        {/* Unified Add/Edit/Import Sale Invoice Modal */}
        <Modal
          opened={open}
          onClose={() => {
            setOpen(false);
            setInitialPayload(null);
          }}
          title={
            initialPayload
              ? "Import Quotation as Sale Invoice"
              : "Create Sale Invoice"
          }
          size="100%"
        >
          <div style={{ width: "100%" }}>
            <SalesDocShell
              mode="Invoice"
              customers={customers as any}
              products={inventory as any}
              submitting={submitting}
              setSubmitting={setSubmitting}
              onSubmit={
                initialPayload
                  ? handleQuotationImportSubmit
                  : handleCreateInvoiceSubmit
              }
              initial={initialPayload ?? createInitialPayload}
            />
          </div>
        </Modal>

        <Modal
          opened={draftsOpen}
          onClose={() => {
            setDraftsOpen(false);
          }}
          title="Saved Drafts"
          size="lg"
        >
          <SavedDraftsPanel
            mode="Invoice"
            onRestore={(data) => {
              setInitialPayload(data as SalesPayload);
              setOpen(true);
              setDraftsOpen(false);
            }}
          />
        </Modal>
        <ShiftManager
          opened={shiftManagerOpen}
          onClose={() => {
            setShiftManagerOpen(false);
          }}
        />
        {salesListLoading || salesPage.length > 0 ? (
          <Table
            withRowBorders
            withColumnBorders
            highlightOnHover
            withTableBorder
          >
            <Table.Thead bg={"gray.1"}>
              <Table.Tr>
                <Table.Th>Invoice #</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {salesListLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                    Loading sales invoices...
                  </Table.Td>
                </Table.Tr>
              ) : (
                salesPage.map((inv, idx) => (
                  <Table.Tr
                    key={inv.invoiceNumber ?? inv.id ?? idx}
                    onDoubleClick={() => {
                      // open editor same as Edit menu
                      const invWithItems = inv as SaleRecordWithItems;
                      setEditPayload(
                        buildEditPayload(
                          invWithItems,
                          customers as any,
                          inventory as any,
                        ),
                      );
                      setEditOpen(true);
                      setEditingId(inv.invoiceNumber ?? inv.id ?? "");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td>{inv.invoiceNumber ?? inv.id}</Table.Td>
                    <Table.Td>
                      {(() => {
                        const dateVal =
                          inv.invoiceDate || inv.date || inv.quotationDate;
                        if (!dateVal) return "";
                        try {
                          const dateObj = new Date(dateVal);
                          return isNaN(dateObj.getTime())
                            ? ""
                            : dateObj.toLocaleDateString();
                        } catch {
                          return "";
                        }
                      })()}
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
                        inv.totalNetAmount ?? inv.subTotal ?? inv.amount ?? 0,
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
                              setEditPayload(
                                buildEditPayload(
                                  invWithItems,
                                  customers as any,
                                  inventory as any,
                                ),
                              );
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
                              const rawItemsSource =
                                (
                                  inv as SaleRecordPayload & {
                                    items?: unknown;
                                    products?: unknown;
                                  }
                                ).items ?? inv.products;

                              const normalizedSourceItems: Array<
                                SaleItem & {
                                  rate?: number;
                                  discountPercent?: number;
                                }
                              > = (() => {
                                if (Array.isArray(rawItemsSource)) {
                                  return rawItemsSource as Array<
                                    SaleItem & {
                                      rate?: number;
                                      discountPercent?: number;
                                    }
                                  >;
                                }

                                if (typeof rawItemsSource === "string") {
                                  try {
                                    const parsed = JSON.parse(rawItemsSource);
                                    return Array.isArray(parsed)
                                      ? (parsed as Array<
                                          SaleItem & {
                                            rate?: number;
                                            discountPercent?: number;
                                          }
                                        >)
                                      : [];
                                  } catch {
                                    return [];
                                  }
                                }

                                return [];
                              })();

                              const items = normalizedSourceItems.map(
                                (it, idx) => {
                                  const quantity = it.quantity ?? 0;
                                  const rate =
                                    it.salesRate ?? it.rate ?? it.price ?? 0;
                                  const length = (it as any).length ?? 0;
                                  const gross = length * quantity * rate;
                                  const discountPercent =
                                    it.discountPercent ??
                                    (it as any).discount ??
                                    0;
                                  const discountAmount =
                                    (it as any).discountAmount ??
                                    (gross * discountPercent) / 100;
                                  const net = gross - discountAmount;

                                  return {
                                    sr: idx + 1,
                                    itemName: it.itemName || "",
                                    section: it.itemName || "",
                                    color: it.color || "",
                                    thickness: it.thickness || "",
                                    length: length,
                                    sizeFt: length,
                                    quantity: quantity,
                                    qty: quantity,
                                    lengths: quantity,
                                    totalFeet: quantity * length,
                                    rate: rate,
                                    gross: gross,
                                    discountPercent: discountPercent,
                                    discount: discountAmount,
                                    net: net,
                                    amount: net,
                                  };
                                },
                              );

                              const totalGrossAmount = items.reduce(
                                (sum, it) => sum + it.gross,
                                0,
                              );
                              const totalDiscount = items.reduce(
                                (sum, it) => sum + it.discount,
                                0,
                              );
                              const totalNetAmount =
                                inv.totalNetAmount ??
                                totalGrossAmount - totalDiscount;
                              const receivedAmount = Number(
                                (
                                  inv as SaleRecordPayload & {
                                    receivedAmount?: number;
                                  }
                                ).receivedAmount ?? 0,
                              );
                              const balanceAmount =
                                totalNetAmount - receivedAmount;

                              openPrintWindow({
                                title: "Sales Invoice",
                                companyName: "Seven Star Traders",
                                addressLines: [
                                  "Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan",
                                ],
                                invoiceNo: String(
                                  inv.invoiceNumber ?? inv.id ?? "",
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
                                    : (inv.customerName ?? ""),
                                customer:
                                  Array.isArray(inv.customer) &&
                                  inv.customer[0]?.name
                                    ? inv.customer[0].name
                                    : (inv.customerName ?? ""),
                                customerPhone:
                                  Array.isArray(inv.customer) &&
                                  inv.customer[0] &&
                                  "phone" in inv.customer[0]
                                    ? (inv.customer[0] as any).phone
                                    : undefined,
                                customerAddress:
                                  Array.isArray(inv.customer) &&
                                  inv.customer[0] &&
                                  "address" in inv.customer[0]
                                    ? (inv.customer[0] as any).address
                                    : undefined,
                                customerCity:
                                  Array.isArray(inv.customer) &&
                                  inv.customer[0] &&
                                  "city" in inv.customer[0]
                                    ? (inv.customer[0] as any).city
                                    : undefined,
                                grn: null,
                                items,
                                totals: {
                                  subtotal: inv.subTotal ?? totalGrossAmount,
                                  totalGrossAmount: totalGrossAmount,
                                  totalDiscount: totalDiscount,
                                  totalNetAmount: totalNetAmount,
                                  receivedAmount,
                                  balanceAmount,
                                  total: totalNetAmount,
                                },
                                receivedAmount,
                                balanceAmount,
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
                            leftSection={<IconPrinter size={16} />}
                            onClick={() => {
                              const items = (inv.products ?? []).map(
                                (p: any) => {
                                  const length = p.length ?? 0;
                                  const quantity = p.quantity ?? 0;
                                  const rate = p.rate ?? 0;
                                  const gross = length * quantity * rate;
                                  const discountPercent =
                                    p.discountPercent ?? 0;
                                  const discountAmount =
                                    (gross * discountPercent) / 100;
                                  const net = gross - discountAmount;

                                  return {
                                    itemName: p.itemName ?? "",
                                    color: p.color ?? "",
                                    thickness: p.thickness ?? "",
                                    length,
                                    qty: quantity,
                                    rate,
                                    gross,
                                    discountPercent,
                                    discount: discountAmount,
                                    net,
                                    amount: net,
                                  };
                                },
                              );

                              const totalGrossAmount = items.reduce(
                                (sum, it) => sum + it.gross,
                                0,
                              );
                              const totalDiscount = items.reduce(
                                (sum, it) => sum + it.discount,
                                0,
                              );
                              const totalNetAmount =
                                inv.totalNetAmount ??
                                totalGrossAmount - totalDiscount;

                              const gatePassHTML = generateGatePassHTML({
                                title: "Sales Invoice",
                                invoiceNo: String(
                                  inv.invoiceNumber ?? inv.id ?? "",
                                ),
                                date:
                                  typeof inv.invoiceDate === "string"
                                    ? inv.invoiceDate
                                    : inv.invoiceDate
                                      ? String(inv.invoiceDate)
                                      : typeof inv.date === "string"
                                        ? inv.date
                                        : "",
                                customer:
                                  Array.isArray(inv.customer) &&
                                  inv.customer[0]?.name
                                    ? inv.customer[0].name
                                    : (inv.customerName ?? ""),
                                customerPhone:
                                  Array.isArray(inv.customer) &&
                                  inv.customer[0] &&
                                  "phone" in inv.customer[0]
                                    ? (inv.customer[0] as any).phone
                                    : undefined,
                                customerAddress:
                                  Array.isArray(inv.customer) &&
                                  inv.customer[0] &&
                                  "address" in inv.customer[0]
                                    ? (inv.customer[0] as any).address
                                    : undefined,
                                customerCity:
                                  Array.isArray(inv.customer) &&
                                  inv.customer[0] &&
                                  "city" in inv.customer[0]
                                    ? (inv.customer[0] as any).city
                                    : undefined,
                                items,
                                totals: {
                                  subtotal: inv.subTotal ?? totalGrossAmount,
                                  totalGrossAmount: totalGrossAmount,
                                  totalDiscount: totalDiscount,
                                  totalNetAmount: totalNetAmount,
                                  total: totalNetAmount,
                                },
                              });
                              const printWindow = window.open("", "_blank");
                              if (printWindow) {
                                printWindow.document.write(gatePassHTML);
                                printWindow.document.close();
                              }
                            }}
                          >
                            Print as Gate Pass
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => {
                              setDeleteTarget(
                                inv.invoiceNumber ?? inv.id ?? "",
                              );
                              setDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        ) : (
          <div>No sales invoices found.</div>
        )}
        {pagination.lastPage > 1 && (
          <Box mt="md">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={pagination.lastPage}
              withEdges
            />
          </Box>
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
        size="100%"
      >
        <div style={{ width: "100%" }}>
          {editPayload && (
            <SalesDocShell
              mode="Invoice"
              customers={customers as any}
              products={inventory as any}
              initial={editPayload}
              submitting={submitting}
              setSubmitting={setSubmitting}
              onSubmit={handleCreateInvoiceSubmit}
            />
          )}
        </div>
      </Modal>

      {/* Import Quotation Modal */}
      <Modal
        opened={importOpen}
        onClose={() => {
          setImportOpen(false);
        }}
        title="Import from Quotation"
        size="100%"
      >
        <div style={{ padding: 12, maxHeight: "70vh", overflow: "auto" }}>
          <h3>Quotations</h3>
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search by Quotation Number..."
              value={importQuotationSearch || ""}
              onChange={(e) => {
                setImportQuotationSearch(e.target.value);
              }}
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
                        ? new Date(q.quotationDate).toLocaleDateString()
                        : "-"}
                      {"validUntil" in q && q.validUntil
                        ? typeof q.validUntil === "string"
                          ? ` • Valid until ${new Date(q.validUntil).toLocaleDateString()}`
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
                      // Robustly find the full customer object, fallback to minimal if not found
                      let cust = customers.find(
                        (c) => String(c._id) === String(q.customer),
                      );
                      if (!cust && q.customer) {
                        if (
                          typeof q.customer === "object" &&
                          q.customer !== null &&
                          "name" in q.customer
                        ) {
                          const id =
                            typeof (q.customer as { _id?: unknown })._id ===
                            "string"
                              ? (q.customer as { _id?: string })._id
                              : String((q.customer as { name: unknown }).name);
                          cust = {
                            _id: id ?? "",
                            name: String(
                              (q.customer as { name: unknown }).name,
                            ),
                          };
                        } else {
                          cust = {
                            _id: String(q.customer),
                            name: String(q.customer),
                          };
                        }
                      }
                      const items = (q.products ?? []).map((it) => {
                        function getProp<TResult = unknown>(
                          obj: Record<string, unknown>,
                          ...keys: string[]
                        ): TResult | undefined {
                          for (const key of keys) {
                            if (obj && typeof obj === "object" && key in obj) {
                              return obj[key] as TResult;
                            }
                          }
                          return undefined;
                        }
                        let lengthValue: number | undefined;
                        const rawLength = getProp<string | number | undefined>(
                          it as unknown as Record<string, unknown>,
                          "length",
                        );
                        if (typeof rawLength === "string") {
                          const parsed = Number(rawLength);
                          lengthValue = isNaN(parsed) ? undefined : parsed;
                        } else if (typeof rawLength === "number") {
                          lengthValue = rawLength;
                        }
                        const quantity = Number(it.quantity ?? 0);
                        const salesRate = Number(it.salesRate ?? 0);
                        return {
                          // Map fields as needed, add any missing fields with sensible defaults
                          ...it,
                          id: it._id, // ensure id is present
                          quantity,
                          salesRate,
                          discount: Number(it.discount ?? 0),
                          discountAmount: Number(it.discountAmount ?? 0),
                          length: lengthValue,
                          totalGrossAmount: Number(it.totalGrossAmount ?? 0),
                          totalNetAmount: Number(it.totalNetAmount ?? 0),
                          amount: quantity * salesRate,
                          unit:
                            typeof it.unit === "string"
                              ? it.unit
                              : String(it.unit ?? ""),
                          metadata: { ...(it.metadata ?? {}) },
                        };
                      });
                      const apiPayload: SalesPayload = {
                        docNo: q.quotationNumber ?? `Quotation ${idx + 1}`,
                        docDate: q.quotationDate
                          ? new Date(q.quotationDate).toISOString().slice(0, 10)
                          : new Date().toISOString().slice(0, 10),
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
                        customer: cust ?? undefined,
                      };
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
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
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
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}
