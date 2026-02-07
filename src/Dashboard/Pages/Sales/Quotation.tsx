import { useState } from "react";
import { logger } from "../../../lib/logger";
import {
  Box,
  Button,
  Card,
  Group,
  Text,
  Title,
  Modal,
  Menu,
  ActionIcon,
} from "@mantine/core";
import Table from "../../../lib/AppTable";
import {
  IconPlus,
  IconDotsVertical,
  IconPrinter,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import { generateNextDocumentNumber } from "../../../utils/document-utils";
import {
  normalizeQuotationCustomer,
  buildQuotationPayload,
} from "./quotation-helpers";


// openPrintWindow already imported above
import type { InvoiceData } from "../../../components/print/printTemplate";
// DataContext removed
// SaleRecord type not used in this file anymore
import SalesDocShell, {
  type SalesPayload,
} from "../../../components/sales/SalesDocShell";
import SavedDraftsPanel from "../../../components/sales/SavedDraftsPanel";
// import ProductMaster from "../Products/ProductMaster";
import { showNotification } from "@mantine/notifications";
import {
  type QuotationRecordPayload,
  type InventoryItemPayload,
  type CustomerPayload,
} from "../../../lib/api";
import { useQuotations } from "../../../hooks/useSales";
import { useCustomer } from "../../../hooks/useCustomer";
import { useInventory } from "../../../lib/hooks/useInventory";

// Use LineItem type for strict item mapping
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
};
import openPrintWindow from "../../../components/print/printWindow";
import { generateGatePassHTML } from "../../../components/print/printTemplate";

function Quotation() {
  const { quotations, createQuotationAsync, updateQuotationAsync, deleteQuotationAsync } = useQuotations();
  const { customers } = useCustomer();
  // sales hook removed as unused
  const { inventory } = useInventory(); // Ensure inventory is loaded

  // Removed DataContext and manual loading effects as React Query handles this
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [initialPayload, setInitialPayload] =
    useState<Partial<SalesPayload> | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | number | null>(
    null
  );
  const [deleteTargetDisplay, setDeleteTargetDisplay] = useState<string | null>(
    null
  );
  const [draftsOpen, setDraftsOpen] = useState(false);

  async function confirmDelete() {
    const id = deleteTarget;
    if (!id) {
      setDeleteModalOpen(false);
      return;
    }
    try {
      // Find the correct unique identifier for deletion (prefer quotationNumber)
      let qNum = String(id);
      const toDelete = (quotations || []).find(
        (q) =>
          String(q.quotationNumber) === qNum ||
          String((q as { _id?: string })._id) === qNum ||
          String(
            (q as Partial<QuotationRecordPayload> & { id?: string }).id
          ) === qNum ||
          String(
            (q as Partial<QuotationRecordPayload> & { docNo?: string }).docNo
          ) === qNum
      );

      if (toDelete && (toDelete).quotationNumber) {
        qNum = String((toDelete).quotationNumber);
      } else if (toDelete && (toDelete as any).quotationNumber) {
        qNum = String((toDelete as any).quotationNumber);
      }

      await deleteQuotationAsync(qNum);
      
      showNotification({
        title: "Deleted",
        message: "Quotation deleted",
        color: "orange",
      });
    } catch (err: unknown) {
      showNotification({
        title: "Delete Failed",
        message: String(err),
        color: "red",
      });
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteTargetDisplay(null);
    }
  }

  // form state for creating quotation

  // Only show actual quotations, not sales invoices
  const quotes = (quotations || []);

  // Note: generateNextDocumentNumber is imported from utils/document-utils
  // It replaces the custom generateNextQuotationNumber function

  type QuotationLike = QuotationRecordPayload & {
    quotationNumber?: string;
    docNo?: string;
    docDate?: string;
    id?: string;
    customer?: CustomerPayload[];
    products?: InventoryItemPayload[];
    items?: InventoryItemPayload[];
    total?: number;
    quotationDate?: string;
  };

  function buildInvoiceDataFromQuotation(q: QuotationLike): InvoiceData {
    const customerData =
      Array.isArray(q.customer) && q.customer[0] ? q.customer[0] : null;
    const customerName =
      // Use customerName if present (for legacy/compatibility), otherwise extract from customer array or string
      (
        "customerName" in q
          ? (q as { customerName: string }).customerName
          : customerData?.name
          ? customerData.name
          : typeof q.customer === "string"
          ? q.customer
          : ""
      );

    return {
      title: "Quotation",
      companyName: "Seven Star Traders",
      addressLines: ["Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan"],
      // support legacy docNo/docDate while preferring new fields
      invoiceNo: String(q.docNo ?? q.id ?? q.quotationNumber),
      date: (q.docDate ?? q.quotationDate) as string,
      ms: customerName,
      customer: customerName,
      customerPhone: customerData?.phone,
      customerAddress: customerData?.address,
      customerCity: customerData?.city,
      items: ((q.items ?? q.products) || []).map(
        (it: InventoryItemPayload, idx: number) => {
          const quantity =
            (it as InventoryItemPayload & { quantity?: number }).quantity || 0;
          const length =
            Number((it as InventoryItemPayload & { length?: number }).length) ||
            0;
          const rateValue = Number(
            (
              it as InventoryItemPayload & {
                price?: number;
                rate?: number;
                unitPrice?: number;
                salesRate?: number;
              }
            ).price ??
              (it as InventoryItemPayload & { rate?: number }).rate ??
              (it as InventoryItemPayload & { salesRate?: number }).salesRate ??
              (it as InventoryItemPayload & { unitPrice?: number }).unitPrice ??
              0
          );

          const gross = length * quantity * rateValue;
          const discountPercent =
            (it as InventoryItemPayload & { discount?: number }).discount || 0;
          const discountAmount =
            (it as InventoryItemPayload & { discountAmount?: number })
              .discountAmount || (gross * discountPercent) / 100;
          const net = gross - discountAmount;

          return {
            sr: idx + 1,
            itemName: String(it.itemName || ""),
            section:
              (it.metadata && String(it.metadata.sku)) ||
              String(it.itemName) ||
              "",
            color: it.color || "",
            thickness: it.thickness || "",
            length: length,
            sizeFt: length,
            quantity: quantity,
            qty: quantity,
            lengths: quantity,
            totalFeet: quantity * length,
            rate: rateValue,
            gross: gross,
            discountPercent: discountPercent,
            discount: discountAmount,
            net: net,
            amount: net,
          };
        }
      ),
      totals: (() => {
        const grossAmount = ((q.items ?? q.products) || []).reduce(
          (sum, it) => {
            const qty =
              (it as InventoryItemPayload & { quantity?: number }).quantity ||
              0;
            const len = Number((it as any).length || 0);
            const rate = Number(
              (it as any).price ??
                (it as any).rate ??
                (it as any).salesRate ??
                (it as any).unitPrice ??
                0
            );
            return sum + len * qty * rate;
          },
          0
        );

        const totalDiscountAmt = ((q.items ?? q.products) || []).reduce(
          (sum, it) => {
            const discountAmount = Number((it as any).discountAmount || 0);
            return sum + discountAmount;
          },
          0
        );

        const netAmount = grossAmount - totalDiscountAmt;

        return {
          subtotal: grossAmount,
          totalGrossAmount: grossAmount,
          totalDiscount: totalDiscountAmt,
          totalNetAmount: netAmount,
          total: netAmount,
        };
      })(),
    };
  }

  // previous quick-create handler removed — creation now goes through SalesDocShell -> saveFromShell

  // Save from SalesDocShell: create or update depending on editingId
  async function saveFromShell(payload: SalesPayload) {
    logger.debug("=== saveFromShell called ===");
    logger.debug("Payload:", payload);
    logger.debug("Creating state:", creating);
    if (creating) return; // Prevent concurrent submissions

    // Normalize customer using helper function
    const cust = normalizeQuotationCustomer(payload.customer, customers as any);
    logger.debug("Normalized customer:", cust);

    if (!cust) {
      showNotification({
        title: "Customer not found",
        message: "Please select a valid customer before saving the quotation.",
        color: "red",
      });
      setCreating(false);
      return;
    }

    setCreating(true);
    
    // Determine quotationNumber: prefer provided docNo, otherwise generate using utility
    const assignedQuotationNumber =
      (payload as Partial<SalesPayload> & { docNo?: string }).docNo ??
      generateNextDocumentNumber(
        "Quo",
        quotes.map((q) => String(q.quotationNumber || "")),
        4
      );

    // Build API payload using helper function
    const apiPayload = buildQuotationPayload(payload, assignedQuotationNumber, customers as any);

    try {
      // ensure payload includes a quotationNumber for create
      if (!editingId) apiPayload.quotationNumber = assignedQuotationNumber;

      if (editingId) {
        // prefer updating by quotationNumber
        const qNum = String(editingId);
        await updateQuotationAsync({ quotationNumber: qNum, data: apiPayload });
        
        showNotification({
          title: "Quotation Updated",
          message: "Quotation has been updated.",
          color: "blue",
        });
      } else {
        await createQuotationAsync(apiPayload);
        
        showNotification({
          title: "Quotation Created",
          message: "Quotation created.",
          color: "green",
        });
      }
      
      // Close modal immediately
      setOpen(false);
      setInitialPayload(null);
      setEditingId(null);
      
    } catch (err: unknown) {
      showNotification({
        title: editingId ? "Update Failed" : "Create Failed",
        message: err instanceof Error ? err.message : String(err),
        color: "red",
      });
    } finally {
      setCreating(false);
    }
  }

  // Open a quotation in the full SalesDocShell editor (used by Edit menu and row double-click)
  function openQuotationInEditor(q: QuotationLike) {
    // Determine existingNumber and resolved customer similar to inline edit handler
    const existingNumber =
      q.quotationNumber ??
      (q as QuotationRecordPayload & { docNo?: string }).docNo ??
      q.quotationNumber;

    // Resolve customer id or name robustly
    let resolvedCustomerId: string | number | undefined = undefined;
    if (q && q.customer) {
      if (Array.isArray(q.customer) && q.customer[0]) {
        resolvedCustomerId =
          (q.customer[0]).id ??
          (q.customer[0] as any).customerId ??
          (q.customer[0] as any).name ??
          undefined;
      } else if (typeof q.customer === "string") {
        resolvedCustomerId = q.customer;
      }
    }
    if (!resolvedCustomerId && (q as { customerName?: string }).customerName) {
      const byName = (customers || []).find(
        (c: CustomerPayload) =>
          String(c.name).trim() ===
          String((q as { customerName?: string }).customerName).trim()
      );
      if (byName) resolvedCustomerId = byName._id;
      else resolvedCustomerId = (q as { customerName?: string }).customerName;
    }

    setInitialPayload({
      docNo: existingNumber,
      docDate: (q.quotationDate ?? ""),
      customer:
        Array.isArray(q.customer) && q.customer.length > 0
          ? { name: q.customer[0]?.name ?? String(q.customer[0]) }
          : typeof q.customer === "string" || typeof q.customer === "number"
          ? { name: String(q.customer) }
          : typeof resolvedCustomerId === "string" ||
            typeof resolvedCustomerId === "number"
          ? { name: String(resolvedCustomerId) }
          : { name: "" },
      remarks: q.remarks ?? "",
      totals: {
        subTotal: q.subTotal ?? q.totalGrossAmount ?? 0,
        total: q.totalGrossAmount ?? q.subTotal ?? 0,
        amount: q.subTotal ?? q.totalGrossAmount ?? 0,
        totalGrossAmount: q.totalGrossAmount ?? 0,
        totalDiscountAmount: q.totalDiscount ?? 0,
        totalNetAmount: q.totalNetAmount ?? 0,
      },
      items: (q.products ?? []).map((item: InventoryItemPayload): LineItem => {
        let unitVal = item.unit as any;
        if (typeof unitVal === "number") unitVal = String(unitVal);
        if (typeof unitVal !== "string") unitVal = "";
        const quantity = Number(item.quantity ?? 0);
        const salesRate = Number(item.salesRate ?? 0);
        const discount =
          typeof (item as any).discount === "number"
            ? Number((item as any).discount)
            : 0;
        const discountAmount =
          typeof (item as any).discountAmount === "number"
            ? Number((item as any).discountAmount)
            : 0;
        const length =
          typeof (item as any).length === "number"
            ? Number((item as any).length)
            : 0;
        const gross = quantity * salesRate;
        return {
          _id: String(item._id ?? ""),
          itemName: item.itemName ?? "",
          unit: unitVal,
          discount,
          discountAmount,
          salesRate,
          color: item.color ?? "",
          openingStock: Number(item.openingStock ?? 0),
          quantity,
          thickness: Number(item.thickness ?? 0),
          amount: gross,
          length,
          totalGrossAmount: gross,
          totalNetAmount: gross - discountAmount,
        };
      }),
    });
    setEditingId(existingNumber ?? "");
    setOpen(true);
  }

  return (
    <>
      <Box mb="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Quotations</Title>
            <Text color="dimmed">Prepare and manage sales quotations</Text>
          </div>
          <div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={async () => {
                // Inventory is auto-loaded by useInventory hook
                const gen = generateNextDocumentNumber(
                  "Quo",
                  quotes.map((q) => String(q.quotationNumber || "")),
                  4
                );
                setInitialPayload({
                  docNo: gen,
                  items: [
                    {
                      itemName: "Select product",
                      quantity: 1,
                      salesRate: 0,
                      discount: 0,
                      discountAmount: 0,
                      length: 0,
                      color: "",
                      unit: "pcs",
                      amount: 0,
                      totalGrossAmount: 0,
                      totalNetAmount: 0,
                    },
                  ],
                });
                setOpen(true);
              }}
            >
              New Quotation
            </Button>
            <Button
              variant="outline"
              size="sm"
              ml={8}
              onClick={() => { setDraftsOpen(true); }}
            >
              Saved Drafts
            </Button>
          </div>
        </Group>
      </Box>

      <Card>
        <Card.Section>
          <Box p="md">
            <Text fw={700}>Recent Quotations</Text>
            <Text c="dimmed">Last {quotes.length} quotations</Text>
          </Box>
        </Card.Section>
        <Card.Section>
          <div
            className="app-table-wrapper"
            style={{ maxHeight: "60vh", overflow: "auto" }}
          >
            <Table withColumnBorders withRowBorders withTableBorder>
              <Table.Thead style={{ backgroundColor: "#F1F3F5" }}>
                <Table.Tr>
                  <Table.Th>Number</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
                  <Table.Th>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {quotes.map((q: QuotationRecordPayload, idx: number) => {
                  const idVal =
                    q &&
                    (q.quotationNumber ??
                      (q as QuotationRecordPayload & { id?: string })?.id ??
                      (q as QuotationRecordPayload & { docNo?: string })
                        ?.docNo);
                  const dateVal = (q &&
                    (q.quotationDate ??
                      q.quotationDate ??
                      (q as QuotationRecordPayload & { docDate?: string })
                        ?.docDate));
                  const amountVal = Number(
                    q?.subTotal ??
                      q?.totalGrossAmount ??
                      q?.subTotal ??
                      q?.totalNetAmount ??
                      0
                  );
                  // Always resolve customer name from customer[0]?.name if available, fallback to customerId lookup for optimistic rows
                  let customerDisplay = "";
                  if (Array.isArray(q.customer) && q.customer.length > 0) {
                    customerDisplay = q.customer[0]?.name || "";
                  } else if (typeof q.customer === "string") {
                    customerDisplay = q.customer;
                  } else if (
                    q.customer &&
                    typeof q.customer === "object" &&
                    "name" in q.customer
                  ) {
                    customerDisplay =
                      (q.customer as { name?: string }).name || "";
                  }
                  // Fallback for optimistic rows: lookup customerId or customer[0]?.id in customers list
                  if (!customerDisplay && Array.isArray(customers)) {
                    let customerId: any = null;
                    if (q.customer) {
                      customerId = q.customer;
                    } else if (
                      Array.isArray(q.customer) &&
                      q.customer[0] &&
                      (q.customer[0] as { name?: string }).name
                    ) {
                      customerId = (q.customer[0] as { name?: string }).name;
                    }
                    if (customerId) {
                      const found = customers.find(
                        (c) => String(c._id) === String(customerId)
                      );
                      if (found && found.name) customerDisplay = found.name;
                    }
                  }

                  // Prefer showing a human-friendly quotation number if available;
                  // fall back to legacy docNo or the raw id when not present.
                  const displayNumber =
                    (q &&
                      (q.quotationNumber ??
                        (q as QuotationRecordPayload & { docNo?: string })
                          .docNo ??
                        idVal)) ??
                    `quotation-${idx}`;
                  const rowKey =
                    (q as any)._id ??
                    (q as any).id ??
                    idVal ??
                    `quotation-${idx}`;
                  return (
                    <Table.Tr
                      key={rowKey}
                      onDoubleClick={() => { openQuotationInEditor(q); }}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Td>{String(displayNumber ?? "-")}</Table.Td>
                      <Table.Td>
                        {dateVal ? new Date(dateVal).toLocaleDateString() : ""}
                      </Table.Td>
                      <Table.Td>{customerDisplay ?? ""}</Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        {amountVal}
                      </Table.Td>

                      <Table.Td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 6,
                          }}
                        >
                          {/* Action menu: Print (design), Edit, Delete */}
                          <Menu width={200}>
                            <Menu.Target>
                              <ActionIcon variant="subtle">
                                <IconDotsVertical />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                onClick={() => {
                                  const d = buildInvoiceDataFromQuotation(q);
                                  openPrintWindow(d);
                                }}
                              >
                                <IconPrinter
                                  size={14}
                                  style={{ marginRight: 8 }}
                                />
                                Print
                              </Menu.Item>

                              <Menu.Item
                                onClick={() => {
                                  const d = buildInvoiceDataFromQuotation(q);
                                  const gatePassHTML = generateGatePassHTML(d);
                                  const printWindow = window.open("", "_blank");
                                  if (printWindow) {
                                    printWindow.document.write(gatePassHTML);
                                    printWindow.document.close();
                                  }
                                }}
                              >
                                <IconPrinter
                                  size={14}
                                  style={{ marginRight: 8 }}
                                />
                                Print as Gate Pass
                              </Menu.Item>

                              <Menu.Item
                                onClick={() => { openQuotationInEditor(q); }}
                                leftSection={<IconEdit size={14} />}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                color="red"
                                onClick={() => {
                                  const id =
                                    q.quotationNumber ??
                                    (q)
                                      .quotationNumber ??
                                    (
                                      q as QuotationRecordPayload & {
                                        docNo?: string;
                                      }
                                    ).docNo ??
                                    "";
                                  if (!id) return;
                                  setDeleteTarget(id);
                                  setDeleteTargetDisplay(
                                    String(
                                      q.quotationNumber ??
                                        (q)
                                          .quotationNumber ??
                                        displayNumber ??
                                        id
                                    )
                                  );
                                  setDeleteModalOpen(true);
                                }}
                              >
                                <IconTrash
                                  size={14}
                                  style={{ marginRight: 8 }}
                                />
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>
        </Card.Section>
      </Card>

      {/* Main create/edit modal */}
      <Modal
        opened={open}
        onClose={() => {
          setOpen(false);
          setInitialPayload(null);
          setEditingId(null);
        }}
        size="100%"
      >
        <Box p="md">
          <Text fw={700}>
            {editingId ? "Edit Quotation" : "Create Quotation"}
          </Text>
          {/* assignedNumber is now injected into the form's docNo; hide the separate display here */}
          <Text c="dimmed" mb="md">
            Quick create: enter customer and total. For full editor, replace
            with your SalesDocShell.
          </Text>
          <SalesDocShell
            mode="Quotation"
            customers={customers as any}
            products={(inventory || []).map((p: any) => {
              const item = p as InventoryItemPayload;
              let unitVal = item.unit;
              if (typeof unitVal === "number") unitVal = String(unitVal);
              if (typeof unitVal !== "string") unitVal = undefined;
              return {
                ...item,
                _id: String(item._id ?? ""),
                itemName: item.itemName || "",
                unit: unitVal,
                discount: 0, // Always add discount for InventoryItemPayload
                discountAmount:
                  typeof item.discountAmount === "number"
                    ? item.discountAmount
                    : 0,
                salesRate:
                  typeof item.salesRate === "number" ? item.salesRate : 0,
                openingStock:
                  typeof item.openingStock === "number" ? item.openingStock : 0,
                quantity: typeof item.quantity === "number" ? item.quantity : 0,
                thickness:
                  typeof item.thickness === "number" ? item.thickness : 0,
                amount: typeof item.amount === "number" ? item.amount : 0,
                length: typeof item.length === "number" ? item.length : 0,
                totalGrossAmount:
                  typeof item.totalGrossAmount === "number"
                    ? item.totalGrossAmount
                    : 0,
                totalNetAmount:
                  typeof item.totalNetAmount === "number"
                    ? item.totalNetAmount
                    : 0,
                metadata: item.metadata ?? {},
              };
            })}
            initial={initialPayload ?? {}}
            submitting={creating}
            setSubmitting={setCreating}
            onSubmit={(payload: SalesPayload) => {
              logger.debug("=== Quotation onSubmit called ===");
              // Don't close modal immediately - let saveFromShell handle it
              saveFromShell(payload);
            }}
            saveDisabled={creating}
          />
        </Box>
      </Modal>

      {/* Delete confirmation modal OUTSIDE main modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); }}
        title="Confirm delete"
        centered
        size="xs"
      >
        <Box>
          <Text>
            Are you sure you want to delete quotation{" "}
            <strong>{deleteTargetDisplay ?? String(deleteTarget ?? "")}</strong>
            ?
          </Text>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 12,
            }}
          >
            <Button variant="default" onClick={() => { setDeleteModalOpen(false); }}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal
        opened={draftsOpen}
        onClose={() => { setDraftsOpen(false); }}
        title="Saved Drafts"
        size="lg"
      >
        <SavedDraftsPanel
          mode="Quotation"
          onRestore={(data) => {
            setInitialPayload(data as SalesPayload);
            setOpen(true);
            setDraftsOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

export default Quotation;
