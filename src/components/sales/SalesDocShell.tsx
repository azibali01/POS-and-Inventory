import React, { useMemo, useState, useEffect, useRef } from "react";
import { logger } from "../../lib/logger";
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Badge,
  Select,
  Text,
  Paper,
  Modal,
  SegmentedControl,
  Stack,
  Group,
  NumberInput,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { formatCurrency } from "../../lib/format-utils";
import LineItemsTable, { createEmptySalesLineItem } from "./line-items-table";
import type { LineItem } from "./line-items-table";
import type { Customer, CustomerInput, InventoryItem } from "../../types";
import { useCustomers } from "../../hooks";
import { useShift } from "../../hooks/useShift";
import { useEnterKeyNext } from "../../hooks/useEnterKeyNext";
import openPrintWindow from "../print/printWindow";
import { generateGatePassHTML } from "../print/printTemplate";
import type { InvoiceData } from "../print/printTemplate";
import type { CustomerPayload } from "../../api";
import {
  getDraftByKey,
  createDraft,
  updateDraft,
  deleteDraft,
} from "../../api";
import {
  findSelectedProduct,
  findSelectedVariant,
  getVariantStock,
  hasIncompleteVariantSelection,
  toProductId,
} from "../../lib/variant-line-item-utils";
import ShiftManager from "./ShiftManager";

function generateId() {
  try {
    return typeof crypto !== "undefined" &&
      typeof (crypto as Crypto & { randomUUID?: () => string }).randomUUID ===
        "function"
      ? (crypto as Crypto & { randomUUID?: () => string }).randomUUID()
      : Math.random().toString(36).slice(2);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

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

function mapIncomingLineItem(
  item: Record<string, any>,
  products: InventoryItem[],
): LineItem {
  const nestedProductRef =
    item.productId && typeof item.productId === "object"
      ? item.productId
      : null;
  const itemId =
    nestedProductRef?._id ?? item.productId ?? item._id ?? item.id ?? "";
  const itemName =
    item.productName ??
    item.itemName ??
    item.name ??
    nestedProductRef?.itemName ??
    nestedProductRef?.name ??
    "";
  const matchedProduct = findSelectedProduct(products, {
    productId: itemId,
    productName: itemName,
    itemName,
  });
  const rawThickness = item.thickness ?? nestedProductRef?.thickness;
  const rawColor = item.color ?? nestedProductRef?.color;
  const rawLength = item.length ?? nestedProductRef?.length;
  const thickness = String(rawThickness ?? "");
  const color = String(rawColor ?? "");
  const lengthValue = String(rawLength ?? "");
  const variant = findSelectedVariant(
    matchedProduct,
    thickness,
    color,
    lengthValue,
    item.sku,
  );
  const resolvedThickness = String(rawThickness ?? variant?.thickness ?? "");
  const resolvedColor = String(rawColor ?? variant?.color ?? "");
  const quantity = Number(item.quantity ?? item.qty ?? 0);
  const salesRate = Number(
    item.salesRate ??
      item.rate ??
      item.price ??
      item.unitPrice ??
      variant?.salesRate ??
      0,
  );
  const length = Number(rawLength ?? item.sizeFt ?? 0);
  const discount = Number(item.discount ?? item.discountPercent ?? 0);
  const subtotal = Number(
    item.subtotal ??
      item.totalGrossAmount ??
      item.amount ??
      quantity * salesRate * (length || 1),
  );
  const discountAmount = Number(
    item.discountAmount ?? (subtotal * discount) / 100,
  );

  return {
    ...createEmptySalesLineItem(),
    _id: matchedProduct?._id ? String(matchedProduct._id) : "",
    productId: matchedProduct?._id
      ? String(matchedProduct._id)
      : toProductId(itemId),
    sku: String(item.sku ?? variant?.sku ?? ""),
    itemName: String(itemName),
    productName: String(itemName),
    unit: String(item.unit ?? matchedProduct?.unit ?? ""),
    quantity,
    salesRate,
    rate: salesRate,
    discount,
    discountAmount,
    amount: subtotal,
    subtotal,
    color: resolvedColor,
    availableStock: Number(item.availableStock ?? getVariantStock(variant)),
    openingStock: Number(item.openingStock ?? getVariantStock(variant)),
    thickness: resolvedThickness,
    length,
    totalGrossAmount: Number(item.totalGrossAmount ?? subtotal),
    totalNetAmount: Number(
      item.totalNetAmount ?? Math.max(0, subtotal - discountAmount),
    ),
    brand: String(matchedProduct?.brand ?? item.brand ?? ""),
  };
}

export interface SalesPayload {
  mode: "Quotation" | "Invoice";
  docNo: string;
  docDate: string;
  invoiceDate?: string;
  products?: InventoryItem[];
  items?: LineItem[];
  customer?: CustomerPayload | string;
  totals: {
    total: number;
    amount: number;
    totalGrossAmount: number;
    totalDiscountAmount: number;
    totalNetAmount: number;
    subTotal: number;
  };
  remarks: string;
  terms: string;
  status?: string;
  sourceQuotationId?: string | number;
  convertedInvoiceId?: string | number;
  convertedAt?: string;
  receivedAmount?: number;
}

export default function SalesDocShell({
  mode,
  initial,
  onSubmit,
  customers,
  products,
  submitting,
  setSubmitting,
  saveDisabled,
}: {
  mode: "Quotation" | "Invoice";
  initial?: Partial<SalesPayload>;
  onSubmit?: (payload: SalesPayload) => void | Promise<void>;
  customers: Customer[];
  products: InventoryItem[];
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  saveDisabled?: boolean;
}) {
  const [docNo, setDocNo] = useState<string>(initial?.docNo ?? "");
  const [docDate, setDocDate] = useState<string>(
    initial?.docDate
      ? formatDateForInput(initial.docDate)
      : new Date().toISOString().slice(0, 10),
  );

  // Always start with empty customer field when modal opens
  const [customerId, setCustomerId] = useState<string>("");
  const [remarks, setRemarks] = useState<string>(
    initial && typeof initial.remarks === "string" ? initial.remarks : "",
  );
  const [terms, setTerms] = useState<string>(
    initial && typeof initial.terms === "string"
      ? initial.terms
      : "Prices valid for 15 days.\nPayment terms: Due on receipt.",
  );

  const [receivedAmount, setReceivedAmount] = useState<number>(
    initial?.receivedAmount ?? 0,
  );
  // Always start with at least one empty item row
  const [items, setItems] = useState<LineItem[]>([createEmptySalesLineItem()]);

  // Autosave / draft support
  const DRAFT_NAMESPACE = "sales-draft";
  const draftKey = `${DRAFT_NAMESPACE}:${mode}`;
  const [serverDraftId, setServerDraftId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [draftToResume, setDraftToResume] = useState<any>(null);
  const saveTimer = useRef<number | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const handleEnterKeyNext = useEnterKeyNext();
  const { createCustomerAsync } = useCustomers();
  const { hasActiveSession } = useShift();
  const [shiftManagerOpened, setShiftManagerOpened] = useState(false);

  // Customer Type State
  const [customerType, setCustomerType] = useState<string>("Regular");
  // Walking Customer Details
  const [walkingName, setWalkingName] = useState("");
  const [walkingPhone, setWalkingPhone] = useState("");
  const [walkingAddress, setWalkingAddress] = useState("");

  // New Customer Modal
  const [
    newCustomerOpened,
    { open: openNewCustomer, close: closeNewCustomer },
  ] = useDisclosure(false);
  const [newCustomer, setNewCustomer] = useState<CustomerInput>({
    name: "",
    phone: "",
    address: "",
    city: "",
    creditLimit: 0,
    openingAmount: 0,
    paymentType: "Debit",
  });

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) return;
    try {
      const created = await createCustomerAsync(newCustomer);
      setCustomerId(String(created._id));
      setCustomerType("Regular");
      closeNewCustomer();
      setNewCustomer({
        name: "",
        phone: "",
        address: "",
        city: "",
        creditLimit: 0,
        openingAmount: 0,
        paymentType: "Debit",
      });
    } catch (error) {
      logger.error("Failed to create customer", error);
    }
  };

  // Reset items when modal opens (when initial changes)
  useEffect(() => {
    if (
      initial?.items &&
      Array.isArray(initial.items) &&
      initial.items.length > 0
    ) {
      setItems(
        initial.items.map((it) => mapIncomingLineItem(it as any, products)),
      );
    } else if (
      initial?.products &&
      Array.isArray(initial.products) &&
      initial.products.length > 0
    ) {
      setItems(
        (initial.products as LineItem[]).map((it) =>
          mapIncomingLineItem(it as any, products),
        ),
      );
    } else {
      setItems([createEmptySalesLineItem()]);
    }
  }, [initial, customers, products]);

  // On mount, attempt to load a saved draft for this mode
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        const initialEmpty = !initial || Object.keys(initial).length === 0;

        if (initialEmpty && d) {
          setDraftToResume(d);
          setShowResumeModal(true);
        }
      }
    } catch (err) {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also try to fetch server-side draft for this key and offer restore
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sd = await getDraftByKey(draftKey);
        if (!mounted || !sd) return;

        const rawLocal = (() => {
          try {
            return localStorage.getItem(draftKey);
          } catch {
            return null;
          }
        })();

        const initialEmpty = !initial || Object.keys(initial).length === 0;

        if (!rawLocal && initialEmpty && sd?.data) {
          setServerDraftId(sd._id ?? null);
          setDraftToResume(sd.data);
          setShowResumeModal(true);
        } else if (sd && sd._id) {
          // just keep the ID for future updates
          setServerDraftId(sd._id);
        }
      } catch (err) {}
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyDraft(d: any) {
    if (!d) return;
    setDocNo(String(d.docNo ?? docNo));
    if (d.docDate) setDocDate(formatDateForInput(d.docDate));
    setCustomerId(String(d.customerId ?? ""));
    if (Array.isArray(d.items) && d.items.length > 0) setItems(d.items);
    setRemarks(String(d.remarks ?? ""));
    setTerms(String(d.terms ?? terms));

    // Prevent immediate save loop by syncing lastSavedRef
    const snapshotObj = {
      docNo: String(d.docNo ?? docNo),
      docDate: formatDateForInput(d.docDate ?? docDate),
      customerId: String(d.customerId ?? ""),
      items: Array.isArray(d.items) && d.items.length > 0 ? d.items : items,
      remarks: String(d.remarks ?? ""),
      terms: String(d.terms ?? terms),
    };
    lastSavedRef.current = JSON.stringify(snapshotObj);
  }

  // Debounced save of draft on key state changes
  useEffect(() => {
    // Build a lightweight snapshot for persistence
    const snapshotObj = {
      docNo,
      docDate,
      customerId,
      items,
      remarks,
      terms,
    };
    let serializedObj: string;
    try {
      serializedObj = JSON.stringify(snapshotObj);
    } catch (err) {
      return;
    }
    // If identical to last saved, skip
    if (lastSavedRef.current === serializedObj) return;
    setIsDirty(true);
    setDraftStatus("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        const payloadToSave = { ...snapshotObj, savedAt: Date.now() };
        localStorage.setItem(draftKey, JSON.stringify(payloadToSave));
        lastSavedRef.current = serializedObj;
        setIsDirty(false);
        // also attempt to save to server (best-effort). Don't block UI.
        (async () => {
          try {
            const payload = { key: draftKey, data: payloadToSave };
            if (serverDraftId) {
              const updated = await updateDraft(serverDraftId, {
                data: payload.data,
              });
              if (updated && updated._id) {
                setServerDraftId(updated._id);
              } else {
                setServerDraftId(null);
                const created = await createDraft(payload);
                if (created && created._id) setServerDraftId(created._id);
              }
            } else {
              const created = await createDraft(payload);
              if (created && created._id) setServerDraftId(created._id);
            }
            setDraftStatus("saved");
          } catch (err) {
            // network/save failed — ignore, local draft still exists
            setDraftStatus("saved");
          }
        })();
      } catch (err) {
        // ignore storage errors
        setDraftStatus("saved");
      }
    }, 3000) as unknown as number;

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [docNo, docDate, customerId, items, remarks, terms, draftKey]);

  // Warn user when closing the tab/window with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    if (isDirty) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  function clearDraft() {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* ignore */
    }
    lastSavedRef.current = null;
    setIsDirty(false);
    // remove server draft if present
    const draftId = serverDraftId;
    if (draftId) {
      // Clear the draft ID immediately to prevent race conditions
      setServerDraftId(null);
      (async () => {
        try {
          await deleteDraft(draftId);
        } catch {
          // ignore - draft might already be deleted
        }
      })();
    }
  }

  const status = mode === "Quotation" ? "Draft" : "Confirmed";

  const totals = useMemo(() => {
    // gross = sum(amount) where amount = length * quantity * rate
    const totalGrossAmount = items.reduce(
      (s, i) => s + (typeof i.amount === "number" ? i.amount : 0),
      0,
    );
    // discounts sum
    const totalDiscountAmount = items.reduce(
      (s, i) => s + (i.discountAmount ?? i.discount ?? 0),
      0,
    );
    // subtotal (for display) — keep it as gross minus discounts? We'll show both
    const sub = totalGrossAmount - totalDiscountAmount;
    // net = sub (no tax/GST per request)
    // net = sub (no tax/GST per request)
    const totalNetAmount = sub;

    // Pending Amount
    const pendingAmount = totalNetAmount - receivedAmount;

    return {
      sub,
      totalGrossAmount,
      totalDiscountAmount,
      totalNetAmount,
      receivedAmount,
      pendingAmount,
      // keep legacy fields for compatibility
      tax: 0,
      total: totalNetAmount,
    } as unknown as { sub: number; tax: number; total: number } & {
      totalGrossAmount: number;
      totalDiscountAmount: number;
      totalNetAmount: number;
      receivedAmount: number;
      pendingAmount: number;
    };
  }, [items, receivedAmount]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => String(c._id) === String(customerId)),
    [customers, customerId],
  );

  // No default customer selection; field remains empty unless user selects

  // If initial.docNo changes (e.g., pre-filled by parent), sync it into local state
  useEffect(() => {
    if (initial?.docNo && initial.docNo !== docNo) {
      setDocNo(String(initial.docNo));
    }
  }, [initial?.docNo, docNo]);

  // When the parent provides a full initial payload (e.g., for editing),
  // sync the relevant fields into local state so the form is pre-filled.
  useEffect(() => {
    if (!initial) return;
    // Only update all local state when initial changes
    setDocNo(initial.docNo ?? "");
    setDocDate(
      initial.docDate
        ? formatDateForInput(initial.docDate)
        : new Date().toISOString().slice(0, 10),
    );

    // Resolve customer ID from initial.customer (handles {id}, {_id}, or missing)
    const rawCustomer = initial.customer as
      | {
          id?: string | number;
          _id?: string | number;
          name?: string;
          phone?: string;
          address?: string;
        }
      | string
      | undefined;

    const resolvedCustomerId = (() => {
      if (!initial.customer) return "";
      const custId =
        (initial.customer as any).id ?? (initial.customer as any)._id;
      if (custId !== undefined && custId !== null) {
        const found = customers.find((c) => String(c._id) === String(custId));
        return found ? String(found._id) : "";
      }
      const customerName = String((initial.customer as any).name ?? "").trim();
      if (!customerName) return "";
      const foundByName = customers.find(
        (customer) =>
          customer.name.trim().toLowerCase() === customerName.toLowerCase(),
      );
      return foundByName ? String(foundByName._id) : "";
    })();

    if (typeof rawCustomer === "string") {
      setCustomerType("Walking");
      setWalkingName(rawCustomer);
      setWalkingPhone("");
      setWalkingAddress("");
    } else {
      setCustomerType("Regular");
      setWalkingName("");
      setWalkingPhone("");
      setWalkingAddress("");
    }

    setCustomerId(resolvedCustomerId);
    setRemarks(typeof initial.remarks === "string" ? initial.remarks : "");
    setTerms(
      typeof initial.terms === "string"
        ? initial.terms
        : "Prices valid for 15 days.\nPayment terms: Due on receipt.",
    );
    if (
      initial.items &&
      Array.isArray(initial.items) &&
      initial.items.length > 0
    ) {
      const mappedItems = initial.items.map((it) =>
        mapIncomingLineItem(it as any, products),
      );
      setItems(mappedItems);
    } else if (
      initial.products &&
      Array.isArray(initial.products) &&
      initial.products.length > 0
    ) {
      const mappedItems = (initial.products as LineItem[]).map((it) =>
        mapIncomingLineItem(it as any, products),
      );
      setItems(mappedItems);
    } else {
      setItems([createEmptySalesLineItem()]);
    }
  }, [initial, customers, products]);

  const [submitLocked, setSubmitLocked] = useState(false);
  const requiresOpenShift = mode === "Invoice";
  const shiftBlocked = requiresOpenShift && !hasActiveSession;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || submitLocked || saveDisabled || shiftBlocked) {
      if (shiftBlocked) {
        showNotification({
          title: "Shift required",
          message: "Please open a shift to start selling.",
          color: "yellow",
        });
      }
      return;
    }

    const normalizedItems = items.map((item) =>
      mapIncomingLineItem(item as Record<string, any>, products),
    );
    setItems(normalizedItems);

    if (mode !== "Quotation") {
      const invalidRowIndex = normalizedItems.findIndex((item) =>
        hasIncompleteVariantSelection(item),
      );
      if (invalidRowIndex >= 0) {
        showNotification({
          title: "Incomplete line item",
          message: `Row ${invalidRowIndex + 1} is missing thickness or color for the selected product.`,
          color: "red",
        });
        setSubmitting(false);
        setSubmitLocked(false);
        return;
      }
    }

    setSubmitting(true);
    setSubmitLocked(true);
    const payload: SalesPayload = {
      mode,
      docNo,
      docDate,
      customer:
        customerType === "Walking"
          ? {
              name: walkingName || "Walking Customer",
              phone: walkingPhone,
              address: walkingAddress,
              paymentType: "Debit", // Assume cash/walking is debit/immediate? Or Credit? Usually separate ledger handling. But payload needs structure.
              metadata: { isWalking: true },
            }
          : selectedCustomer
            ? {
                id: selectedCustomer._id,
                name: selectedCustomer.name,
                address: selectedCustomer.address,
                city: selectedCustomer.city,
                openingAmount: selectedCustomer.openingAmount,
                paymentType: selectedCustomer.paymentType,
              }
            : undefined,
      products: normalizedItems.map((item) => ({
        ...item,
        _id: String(item.productId || item._id || generateId()),
      })),
      items: normalizedItems.map((item) => ({
        ...item,
        _id: String(item.productId || item._id || generateId()),
      })),
      totals: {
        subTotal: totals.sub,
        total: totals.total ?? totals.totalNetAmount,
        totalGrossAmount: totals.totalGrossAmount,
        totalDiscountAmount: totals.totalDiscountAmount,
        totalNetAmount: totals.totalNetAmount,
        amount: totals.total ?? totals.totalNetAmount,
      },
      receivedAmount,
      remarks,
      terms,
    };
    const maybePromise = onSubmit?.(payload);
    // If onSubmit returns a promise, clear draft only on success. Always reset submitting state.
    if (
      maybePromise &&
      typeof (maybePromise as Promise<unknown>).then === "function"
    ) {
      (maybePromise as Promise<unknown>)
        .then(() => {
          clearDraft();
        })
        .finally(() => {
          setSubmitting(false);
          setSubmitLocked(false);
        });
    } else {
      // Synchronous handler — assume success
      clearDraft();
      setSubmitting(false);
      setSubmitLocked(false);
    }
  }

  return (
    <>
      <Modal
        opened={newCustomerOpened}
        onClose={closeNewCustomer}
        title="Add New Customer"
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Required"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
            required
          />
          <TextInput
            label="Phone"
            placeholder="Mobile"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
          />
          <Textarea
            label="Address"
            placeholder="Optional"
            value={newCustomer.address}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, address: e.target.value })
            }
          />
          <TextInput
            label="City"
            placeholder="Optional"
            value={newCustomer.city}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, city: e.target.value })
            }
          />
          <NumberInput
            label="Opening Balance"
            value={newCustomer.openingAmount}
            onChange={(v) =>
              setNewCustomer({ ...newCustomer, openingAmount: Number(v || 0) })
            }
          />
          <Select
            label="Payment Type"
            data={["Credit", "Debit"]}
            value={newCustomer.paymentType}
            onChange={(v) =>
              setNewCustomer({
                ...newCustomer,
                paymentType: (v as "Credit" | "Debit") || "Debit",
              })
            }
          />
          <Button onClick={handleCreateCustomer}>Save Customer</Button>
        </Stack>
      </Modal>
      <form onSubmit={handleSubmit} onKeyDown={handleEnterKeyNext}>
        <Card w={"100%"}>
          <Card.Section
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: 12,
            }}
          >
            <div>
              <Text style={{ fontSize: 18, fontWeight: 700 }}>{mode}</Text>
              <Text style={{ color: "#666" }}>Enter details and add items</Text>
            </div>
            <Badge variant="outline">{status}</Badge>
          </Card.Section>

          <Card.Section style={{ padding: 12 }}>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(3, 1fr)",
              }}
            >
              <div>
                <Text
                  style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}
                >
                  {mode} No.
                </Text>
                <TextInput
                  id="docNo"
                  value={docNo}
                  onChange={(e) => {
                    setDocNo(e.target.value);
                  }}
                  placeholder={`${mode === "Quotation" ? "QUO" : "INV"}-2025-001`}
                />
              </div>
              <div>
                <Text
                  style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}
                >
                  {mode} Date
                </Text>
                <TextInput
                  id="docDate"
                  type="date"
                  value={docDate}
                  onChange={(e) => {
                    setDocDate(e.target.value);
                  }}
                />
              </div>
              {mode === "Quotation" ? (
                <div>
                  <Text
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}
                  >
                    Valid Until
                  </Text>
                </div>
              ) : (
                <div>
                  <Text
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}
                  >
                    Payment Method
                  </Text>
                  <Select data={["Cash", "Card"]} defaultValue="Cash" />
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 12,
                border: "1px solid #eee",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <Group mb="xs" justify="space-between">
                <Text style={{ fontSize: 14, fontWeight: 600 }}>
                  Customer Details
                </Text>
                <SegmentedControl
                  value={customerType}
                  onChange={setCustomerType}
                  data={[
                    { label: "Regular Customer", value: "Regular" },
                    { label: "Walking Customer", value: "Walking" },
                  ]}
                  size="xs"
                />
              </Group>

              {customerType === "Regular" ? (
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <div>
                    <Select
                      label="Select Customer (type to search)"
                      placeholder="Type customer name or select from list"
                      value={String(customerId)}
                      onChange={(v) => {
                        setCustomerId(String(v ?? ""));
                      }}
                      data={customers
                        .filter((c) => c._id && c.name)
                        .map((c) => ({
                          value: String(c._id),
                          label: `${c.name} — ${c.city ?? ""}`,
                        }))}
                      clearable
                      searchable
                      nothingFoundMessage={
                        <Button
                          variant="subtle"
                          size="xs"
                          fullWidth
                          onClick={openNewCustomer}
                        >
                          + Create New Customer
                        </Button>
                      }
                    />
                    <Button
                      variant="subtle"
                      size="xs"
                      mt={4}
                      onClick={openNewCustomer}
                    >
                      + Create New Customer
                    </Button>
                  </div>

                  {selectedCustomer && (
                    <Paper
                      withBorder
                      p="xs"
                      style={{ boxShadow: "var(--mantine-shadow-xs)" }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {selectedCustomer.name}
                      </div>
                      <div
                        style={{ color: "#666", fontSize: 13, marginTop: 4 }}
                      >
                        {selectedCustomer.address || "No Address"}
                      </div>
                      <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#888" }}>
                            Opening Amount
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {formatCurrency(
                              selectedCustomer.openingAmount ?? 0,
                            )}
                          </div>
                        </div>
                      </div>
                    </Paper>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "1fr 1fr 1fr",
                  }}
                >
                  <TextInput
                    label="Customer Name"
                    placeholder="Name"
                    value={walkingName}
                    onChange={(e) => setWalkingName(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Phone"
                    placeholder="Mobile No"
                    value={walkingPhone}
                    onChange={(e) => setWalkingPhone(e.target.value)}
                  />
                  <TextInput
                    label="Address"
                    placeholder="Address"
                    value={walkingAddress}
                    onChange={(e) => setWalkingAddress(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              {/* Supplier label for selected product (first item) */}
              {items &&
                items.length > 0 &&
                (() => {
                  const item = items[0];
                  const product = products.find(
                    (p) => p.itemName === item.itemName || p._id === item._id,
                  );
                  let supplier = "";
                  if (product) {
                    const customProduct = product as any;
                    if (customProduct.supplier) {
                      if (typeof customProduct.supplier === "string")
                        supplier = customProduct.supplier;
                      else if (
                        typeof customProduct.supplier === "object" &&
                        customProduct.supplier.name
                      )
                        supplier = customProduct.supplier.name;
                    }
                    if (!supplier && customProduct.supplierName)
                      supplier = customProduct.supplierName;
                  }
                  return supplier ? (
                    <Badge color="green" variant="filled" mb={8}>
                      Supplier: {supplier}
                    </Badge>
                  ) : null;
                })()}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 600 }}>Items</Text>
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  setItems((prev) => [...prev, createEmptySalesLineItem()]);
                }}
              >
                Add item
              </Button>
            </div>
            <div
              className="app-table-wrapper"
              style={{ maxHeight: "40vh", overflow: "auto" }}
            >
              <LineItemsTable
                items={items}
                onChange={setItems}
                products={products}
                mode={mode}
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(2, 1fr)",
                marginTop: 16,
              }}
            >
              <div>
                <Text
                  style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}
                >
                  Remarks
                </Text>
                <Textarea
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.currentTarget.value);
                  }}
                  minRows={3}
                  placeholder="Additional notes"
                />
              </div>
            </div>
          </Card.Section>

          <Card.Section inheritPadding py="xs" withBorder>
            <Group grow align="flex-start">
              {/* Left Side: Summary / Status */}
              <Stack gap="xs" style={{ maxWidth: "50%" }}>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Items Count:
                  </Text>
                  <Text size="sm" fw={500}>
                    {items.length}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Total Quantity:
                  </Text>
                  <Text size="sm" fw={500}>
                    {items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Total Feet:
                  </Text>
                  <Text size="sm" fw={500}>
                    {items
                      .reduce(
                        (s, i) =>
                          s + (Number(i.length) * Number(i.quantity) || 0),
                        0,
                      )
                      .toFixed(2)}
                  </Text>
                </Group>
              </Stack>

              {/* Right Side: Totals - horizontal layout now handled below */}
              {/* We can remove this entire right side stack and rely on the new bottom bar */}
            </Group>
          </Card.Section>

          {/* New Horizontal Bottom Bar */}
          <Card.Section
            withBorder
            p="sm"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <Group justify="space-between" align="center">
              <Group gap="xl">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Gross
                  </Text>
                  <Text size="md" fw={500}>
                    {totals.totalGrossAmount.toFixed(2)}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Discount
                  </Text>
                  <Text size="md" fw={500} c="orange">
                    -{totals.totalDiscountAmount.toFixed(2)}
                  </Text>
                </div>
                <div>
                  <Tooltip
                    label="Formula: (Length × Qty × Rate) - Discount for each item"
                    position="top"
                    withArrow
                  >
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      fw={700}
                      style={{ cursor: "help" }}
                    >
                      Net Total ⓘ
                    </Text>
                  </Tooltip>
                  <Text size="xl" fw={700}>
                    {totals.totalNetAmount.toFixed(2)}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Received
                  </Text>
                  <NumberInput
                    value={receivedAmount}
                    onChange={(v) => setReceivedAmount(Number(v))}
                    min={0}
                    decimalScale={2}
                    fixedDecimalScale
                    thousandSeparator
                    prefix="Rs. "
                    styles={{ input: { fontWeight: 600, height: 32 } }}
                    style={{ width: 140 }}
                    size="sm"
                  />
                </div>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Pending
                  </Text>
                  <Text
                    size="xl"
                    fw={700}
                    c={totals.pendingAmount > 0.01 ? "red" : "green"}
                  >
                    {Math.abs(totals.pendingAmount).toFixed(2)}
                    {totals.pendingAmount > 0.01 ? " Dr" : ""}
                  </Text>
                </div>
              </Group>

              <Group gap="xl">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Ledger Status
                  </Text>
                  <Group gap="xs">
                    <Badge color="green" variant="light" size="sm">
                      Auto-Updated
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Ledger entries created on save
                    </Text>
                  </Group>
                </div>
              </Group>
            </Group>
          </Card.Section>
        </Card>
        {shiftBlocked ? (
          <Paper withBorder p="sm" mt="md" radius="md">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={600}>Shift Required</Text>
                <Text size="sm" c="dimmed">
                  Please open a shift to start selling.
                </Text>
              </div>
              <Button
                variant="light"
                onClick={() => {
                  setShiftManagerOpened(true);
                }}
              >
                Open Shift
              </Button>
            </Group>
          </Paper>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 12,
          }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              try {
                const data: InvoiceData = {
                  title: mode === "Invoice" ? "Sales Invoice" : "Quotation",
                  companyName: "Seven Star Traders",
                  addressLines: [
                    "Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan",
                  ],
                  invoiceNo: docNo,
                  date: docDate,
                  ms: selectedCustomer?.name ?? "",
                  customer: selectedCustomer?.name ?? "",
                  customerPhone: selectedCustomer?.phone,
                  customerAddress: selectedCustomer?.address,
                  customerCity: selectedCustomer?.city,
                  grn: null,
                  items: items.map((it, idx) => {
                    const quantity = Number(it.quantity || 0);
                    const length = Number(it.length || 0);
                    const rate = Number(it.salesRate || 0);
                    const gross = length * quantity * rate;
                    const discountPercent = Number(it.discount || 0);
                    const discountAmount = Number(
                      it.discountAmount || (gross * discountPercent) / 100,
                    );
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
                  }),
                  totals: {
                    subtotal: totals.totalGrossAmount,
                    totalGrossAmount: totals.totalGrossAmount,
                    totalDiscount: totals.totalDiscountAmount,
                    totalNetAmount: totals.totalNetAmount,
                    receivedAmount,
                    balanceAmount: totals.pendingAmount,
                    total: totals.totalNetAmount,
                  },
                  receivedAmount,
                  balanceAmount: totals.pendingAmount,
                  footerNotes: [
                    "Extrusion & Powder Coating",
                    "Aluminum Window, Door, Profiles & All Kinds of Pipes",
                  ],
                };
                openPrintWindow(data);
              } catch (err) {
                logger.error("Failed to open print preview", err);
                window.print();
              }
            }}
          >
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              try {
                const data = {
                  title: mode,
                  invoiceNo: docNo,
                  date: docDate,
                  customer: selectedCustomer?.name ?? "",
                  customerPhone: selectedCustomer?.phone ?? "",
                  customerAddress: selectedCustomer?.address ?? "",
                  customerCity: selectedCustomer?.city ?? "",
                  items: items.map((item) => {
                    const length = item.length ?? 0;
                    const quantity = item.quantity ?? 0;
                    const rate = item.salesRate ?? 0;
                    const gross = length * quantity * rate;
                    const discountAmount =
                      item.discountAmount ?? item.discount ?? 0;
                    const net = gross - discountAmount;

                    return {
                      itemName: item.itemName ?? "",
                      color: item.color ?? "",
                      thickness: item.thickness ?? "",
                      length: length,
                      quantity: quantity,
                      qty: quantity,
                      rate: rate,
                      gross: gross,
                      discount: discountAmount,
                      net: net,
                      amount: net,
                    };
                  }),
                  totals: {
                    subtotal: totals.totalGrossAmount,
                    totalGrossAmount: totals.totalGrossAmount,
                    totalDiscount: totals.totalDiscountAmount,
                    totalNetAmount: totals.totalNetAmount,
                    total: totals.totalNetAmount,
                  },
                };
                const gatePassHTML = generateGatePassHTML(data);
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(gatePassHTML);
                  printWindow.document.close();
                }
              } catch (err) {
                logger.error("Failed to open gate pass print", err);
              }
            }}
          >
            Print as Gate Pass
          </Button>
          <Group gap="xs" align="center">
            {draftStatus === "saving" && (
              <Badge color="blue" variant="dot">
                Saving...
              </Badge>
            )}
            {draftStatus === "saved" && (
              <Badge color="green" variant="dot">
                Draft Saved
              </Badge>
            )}
            <Button
              type="submit"
              loading={submitting}
              disabled={saveDisabled || submitting || shiftBlocked}
            >
              Save {mode}
            </Button>
          </Group>
        </div>
      </form>
      <ShiftManager
        opened={shiftManagerOpened}
        onClose={() => {
          setShiftManagerOpened(false);
        }}
      />
      <Modal
        opened={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        title="Resume Draft"
      >
        <Text mb="md">Resume your previous work?</Text>
        <Group justify="flex-end">
          <Button
            variant="outline"
            onClick={() => {
              clearDraft();
              setShowResumeModal(false);
            }}
          >
            Discard
          </Button>
          <Button
            onClick={() => {
              applyDraft(draftToResume);
              setShowResumeModal(false);
            }}
          >
            Resume
          </Button>
        </Group>
      </Modal>
    </>
  );
}
