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
import { useDisclosure } from '@mantine/hooks';
import { formatCurrency } from "../../lib/format-utils";
import LineItemsTable from "./line-items-table";
import type { LineItem } from "./line-items-table";
import type {
  Customer,
  InventoryItem,
  CustomerInput,
} from "../../Dashboard/Context/DataContext";
import { useDataContext } from "../../Dashboard/Context/DataContext";
import openPrintWindow from "../print/printWindow";
import { generateGatePassHTML } from "../print/printTemplate";
import type { InvoiceData } from "../print/printTemplate";
import type { CustomerPayload } from "../../lib/api";
import {
  getDraftByKey,
  createDraft,
  updateDraft,
  deleteDraft,
} from "../../lib/api";

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

export interface SalesPayload {
  mode: "Quotation" | "Invoice";
  docNo: string;
  docDate: string;
  invoiceDate?: string;
  products?: InventoryItem[];
  items?: LineItem[];
  customer?: CustomerPayload;
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
      ? String(initial.docDate)
      : new Date().toISOString().slice(0, 10)
  );

  // Always start with empty customer field when modal opens
  const [customerId, setCustomerId] = useState<string>("");
  const [remarks, setRemarks] = useState<string>(
    initial && typeof initial.remarks === "string" ? initial.remarks : ""
  );
  const [terms, setTerms] = useState<string>(
    initial && typeof initial.terms === "string"
      ? initial.terms
      : "Prices valid for 15 days.\nPayment terms: Due on receipt."
  );

  // Brand State
  const [globalBrand, setGlobalBrand] = useState<string>("Haq Interior");
  const brandOptions = [
    "Haq Interior",
    "Haq Aluminium",
    "Seven Star",
    "Al-Fazal",
    "Local",
  ];

  const [receivedAmount, setReceivedAmount] = useState<number>(
    initial?.receivedAmount ?? 0
  );
  // Always start with at least one empty item row
  const [items, setItems] = useState<LineItem[]>([
    {
      _id: generateId(),
      itemName: "",
      unit: "",
      quantity: 1,
      salesRate: 0,
      discount: 0,
      amount: 0,
      color: "",
      openingStock: 0,
      thickness: 0,
      length: 0,
      totalGrossAmount: 0,
      totalNetAmount: 0,
      discountAmount: 0,
      brand: "Haq Interior",
    },
  ]);

  // Update items when global brand changes
  useEffect(() => {
    setItems(items.map(i => ({ ...i, brand: i.brand || globalBrand })));
  }, [globalBrand]);

  // Autosave / draft support
  const DRAFT_NAMESPACE = "sales-draft";
  const draftKey = `${DRAFT_NAMESPACE}:${mode}`;
  const [serverDraftId, setServerDraftId] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const { createCustomer } = useDataContext();

  // Customer Type State
  const [customerType, setCustomerType] = useState<string>("Regular");
  // Walking Customer Details
  const [walkingName, setWalkingName] = useState("");
  const [walkingPhone, setWalkingPhone] = useState("");
  const [walkingAddress, setWalkingAddress] = useState("");

  // New Customer Modal
  const [newCustomerOpened, { open: openNewCustomer, close: closeNewCustomer }] = useDisclosure(false);
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
        const created = await createCustomer(newCustomer);
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

  // Reset customer and items when modal opens (when initial changes)
  useEffect(() => {
    // Helper to get supplier name for selected product
    const getSupplierForItem = (item: LineItem) => {
      if (!item || !item.itemName) return "";
      const product = products.find(
        (p) => p.itemName === item.itemName || p._id === item._id
      );
      if (product && (product as any).supplier) {
        const supplier = (product as any).supplier;
        if (typeof supplier === "string") return supplier;
        if (typeof supplier === "object" && supplier.name) return supplier.name;
      }
      if (product && (product as any).supplierName) {
        return (product as any).supplierName;
      }
      return "";
    };
    setCustomerId("");
    if (
      initial?.items &&
      Array.isArray(initial.items) &&
      initial.items.length > 0
    ) {
      {
        /* Supplier label for selected product (first item) */
      }
      {
        items && items.length > 0 && getSupplierForItem(items[0]) ? (
          <Text size="sm" color="dimmed" mb={8}>
            <b>Supplier:</b> {getSupplierForItem(items[0])}
          </Text>
        ) : null;
      }
      setItems(
        (initial.items).map((it) => ({
          _id:
            (it as any)._id ??
            (it as any).id ??
            (it as any).productId ??
            products.find(
              (p) =>
                p.itemName === it.itemName ||
                String(p._id) === String((it as any)._id) ||
                p.itemName === it.itemName
            )?._id ??
            "",
          itemName: it.itemName ?? "",
          invoiceNumber: it._id ?? generateId(),
          unit: it.unit ?? "",
          quantity: Number(it.quantity ?? 0),
          salesRate: Number(it.salesRate ?? it.salesRate ?? 0),
          discount: it.discount ?? 0,
          amount:
            Number(it.quantity ?? 0) *
            Number(it.salesRate ?? it.salesRate ?? 0),
          price: it.salesRate ?? 0,
          color: it.color ?? "",
          openingStock: it.openingStock ?? 0,
          thickness: it.thickness ?? 0,
          length: it.length ?? 0,
          totalGrossAmount: it.totalGrossAmount ?? 0,
          totalNetAmount: it.totalNetAmount ?? 0,
          discountAmount: it.discountAmount ?? 0,
        }))
      );
    } else if (
      initial?.products &&
      Array.isArray(initial.products) &&
      initial.products.length > 0
    ) {
      setItems(
        (initial.products as LineItem[]).map((it) => ({
          _id:
            (it as any)._id ??
            (it as any).id ??
            (it as any).productId ??
            products.find(
              (p) =>
                p.itemName === it.itemName ||
                String(p._id) === String((it as any)._id) ||
                p.itemName === it.itemName
            )?._id ??
            "",
          itemName: it.itemName ?? "",
          invoiceNumber: it._id ?? generateId(),
          unit: it.unit ?? "",
          quantity: Number(it.quantity ?? 0),
          salesRate: Number(it.salesRate ?? it.salesRate ?? 0),
          discount: it.discount ?? 0,
          amount:
            Number(it.quantity ?? 0) *
            Number(it.salesRate ?? it.salesRate ?? 0),
          price: it.salesRate ?? 0,
          color: it.color ?? "",
          openingStock: it.openingStock ?? 0,
          thickness: it.thickness ?? 0,
          length: it.length ?? 0,
          totalGrossAmount: it.totalGrossAmount ?? 0,
          totalNetAmount: it.totalNetAmount ?? 0,
          discountAmount: it.discountAmount ?? 0,
        }))
      );
    } else {
      setItems([
        {
          _id: generateId(),
          itemName: "",
          unit: "",
          quantity: 1,
          salesRate: 0,
          discount: 0,
          amount: 0,
          color: "",
          openingStock: 0,
          thickness: 0,
          length: 0,
          totalGrossAmount: 0,
          totalNetAmount: 0,
          discountAmount: 0,
        },
      ]);
    }
  }, [initial, products]);

  // On mount, attempt to load a saved draft for this mode
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        // If there is a provided `initial` payload and it's non-empty, skip restoring.
        // If it is empty, auto-restore without annoying the user.
        const initialEmpty = !initial || Object.keys(initial).length === 0;
        const shouldRestore = initialEmpty;

        if (shouldRestore && d) {
          setDocNo(d.docNo ?? initial?.docNo ?? docNo);
          setDocDate(d.docDate ?? initial?.docDate ?? docDate);
          setCustomerId(d.customerId ?? "");
          if (Array.isArray(d.items) && d.items.length > 0) setItems(d.items);
          setRemarks(d.remarks ?? initial?.remarks ?? "");
          setTerms(d.terms ?? initial?.terms ?? terms);
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
          const d = sd.data;
          setDocNo(String(d.docNo ?? initial?.docNo ?? docNo));
          setDocDate(String(d.docDate ?? initial?.docDate ?? docDate));
          setCustomerId(String(d.customerId ?? ""));
          if (Array.isArray(d.items) && d.items.length > 0) setItems(d.items);
          setRemarks(String(d.remarks ?? initial?.remarks ?? ""));
          setTerms(String(d.terms ?? initial?.terms ?? terms));
          setServerDraftId(sd._id ?? null);
        } else if (sd && sd._id) {
          // just keep the ID for future updates
          setServerDraftId(sd._id);
        }
      } catch (err) {
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save of draft on key state changes
  useEffect(() => {
    // Build a lightweight snapshot for persistence
    const snapshot = {
      docNo,
      docDate,
      customerId,
      items,
      remarks,
      terms,
      savedAt: Date.now(),
    };
    let serialized: string;
    try {
      serialized = JSON.stringify(snapshot);
    } catch (err) {
      return;
    }
    // If identical to last saved, skip
    if (lastSavedRef.current === serialized) return;
    setIsDirty(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, serialized);
        lastSavedRef.current = serialized;
        setIsDirty(false);
        // also attempt to save to server (best-effort). Don't block UI.
        (async () => {
          try {
            const payload = { key: draftKey, data: JSON.parse(serialized) };
            if (serverDraftId) {
              await updateDraft(serverDraftId, { data: payload.data });
            } else {
              const created = await createDraft(payload);
              if (created && created._id)
                setServerDraftId(created._id);
            }
          } catch (err) {
            // network/save failed — ignore, local draft still exists
          }
        })();
      } catch (err) {
        // ignore storage errors
      }
    }, 1000) as unknown as number;

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
      0
    );
    // discounts sum
    const totalDiscountAmount = items.reduce(
      (s, i) => s + (i.discountAmount ?? i.discount ?? 0),
      0
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
    [customers, customerId]
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
    logger.debug("[SalesDocShell] Syncing initial payload:", initial);
    logger.debug("[SalesDocShell] Available customers:", customers);
    logger.debug("[SalesDocShell] Available products:", products);
    // Only update all local state when initial changes
    setDocNo(initial.docNo ?? "");
    setDocDate(
      initial.docDate
        ? String(initial.docDate)
        : new Date().toISOString().slice(0, 10)
    );

    // Resolve customer ID from initial.customer (handles {id}, {_id}, or missing)
    const resolvedCustomerId = (() => {
      if (!initial.customer) return "";
      const custId =
        (initial.customer as any).id ?? (initial.customer as any)._id;
      if (custId !== undefined && custId !== null) {
        const found = customers.find((c) => String(c._id) === String(custId));
        logger.debug("[SalesDocShell] Resolved customer:", found);
        return found ? String(found._id) : "";
      }
      return "";
    })();
    setCustomerId(resolvedCustomerId);
    logger.debug("[SalesDocShell] Set customerId to:", resolvedCustomerId);
    setRemarks(typeof initial.remarks === "string" ? initial.remarks : "");
    setTerms(
      typeof initial.terms === "string"
        ? initial.terms
        : "Prices valid for 15 days.\nPayment terms: Due on receipt."
    );
    if (initial.items && Array.isArray(initial.items)) {
      logger.debug("[SalesDocShell] Mapping initial.items:", initial.items);
      const mappedItems = (initial.items).map((it) => {
        const itemId =
          (it as any)._id ?? (it as any).id ?? (it as any).productId ?? "";
        const itemNameValue = it.itemName ?? (it as any).productName ?? "";
        // Find matching product by id or name
        const matchedProduct = products.find(
          (p) =>
            String(p._id) === String(itemId) ||
            (itemNameValue &&
              String(p.itemName).toLowerCase() ===
                String(itemNameValue).toLowerCase())
        );
        const resolvedId = matchedProduct?._id ?? itemId;
        logger.debug("[SalesDocShell] Item mapping:", {
          itemId,
          itemNameValue,
          matchedProduct: matchedProduct?.itemName,
          resolvedId,
        });
        return {
          _id: resolvedId ? String(resolvedId) : "",
          itemName: itemNameValue,
          invoiceNumber: itemId || generateId(),
          unit: it.unit ?? "",
          quantity: Number(it.quantity ?? 0),
          salesRate: Number(it.salesRate ?? (it as any).rate ?? 0),
          discount: it.discount ?? 0,
          amount:
            Number(it.quantity ?? 0) *
            Number(it.salesRate ?? (it as any).rate ?? 0),
          price: it.salesRate ?? 0,
          color: it.color ?? "",
          openingStock: it.openingStock ?? 0,
          thickness: it.thickness ?? 0,
          length: it.length ?? 0,
          totalGrossAmount: it.totalGrossAmount ?? 0,
          totalNetAmount: it.totalNetAmount ?? 0,
          discountAmount: it.discountAmount ?? 0,
        };
      });
      logger.debug("[SalesDocShell] Final mapped items:", mappedItems);
      setItems(mappedItems);
    } else if (initial.products && Array.isArray(initial.products)) {
      logger.debug(
        "[SalesDocShell] Mapping initial.products:",
        initial.products
      );
      const mappedItems = (initial.products as LineItem[]).map((it) => {
        const itemId =
          (it as any)._id ?? (it as any).id ?? (it as any).productId ?? "";
        const itemNameValue = it.itemName ?? (it as any).productName ?? "";
        const matchedProduct = products.find(
          (p) =>
            String(p._id) === String(itemId) ||
            (itemNameValue &&
              String(p.itemName).toLowerCase() ===
                String(itemNameValue).toLowerCase())
        );
        const resolvedId = matchedProduct?._id ?? itemId;
        logger.debug("[SalesDocShell] Product mapping:", {
          itemId,
          itemNameValue,
          matchedProduct: matchedProduct?.itemName,
          resolvedId,
        });
        return {
          _id: resolvedId ? String(resolvedId) : "",
          itemName: itemNameValue,
          invoiceNumber: itemId || generateId(),
          unit: it.unit ?? "",
          quantity: Number(it.quantity ?? 0),
          salesRate: Number(it.salesRate ?? (it as any).rate ?? 0),
          discount: it.discount ?? 0,
          amount:
            Number(it.quantity ?? 0) *
            Number(it.salesRate ?? (it as any).rate ?? 0),
          price: it.salesRate ?? 0,
          color: it.color ?? "",
          openingStock: it.openingStock ?? 0,
          thickness: it.thickness ?? 0,
          length: it.length ?? 0,
          totalGrossAmount: it.totalGrossAmount ?? 0,
          totalNetAmount: it.totalNetAmount ?? 0,
          discountAmount: it.discountAmount ?? 0,
        };
      });
      logger.debug("[SalesDocShell] Final mapped products:", mappedItems);
      setItems(mappedItems);
    } else {
      setItems([
        {
          _id: generateId(),
          itemName: "",
          unit: "",
          quantity: 1,
          salesRate: 0,
          discount: 0,
          amount: 0,
          color: "",
          openingStock: 0,
          thickness: 0,
          length: 0,
          totalGrossAmount: 0,
          totalNetAmount: 0,
          discountAmount: 0,
        },
      ]);
    }
  }, [initial, customers]);

  const [submitLocked, setSubmitLocked] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    logger.debug("=== SalesDocShell handleSubmit called ===");
    e.preventDefault();
    if (submitting || submitLocked || saveDisabled) {
      logger.debug("Submit blocked:", {
        submitting,
        submitLocked,
        saveDisabled,
      });
      return;
    }
    setSubmitting(true);
    setSubmitLocked(true);
    const payload: SalesPayload = {
      mode,
      docNo,
      docDate,
      customer: customerType === 'Walking' 
        ? {
            name: walkingName || "Walking Customer",
            phone: walkingPhone,
            address: walkingAddress,
            paymentType: "Debit", // Assume cash/walking is debit/immediate? Or Credit? Usually separate ledger handling. But payload needs structure.
            metadata: { isWalking: true }
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
      products: items.map((item) => ({
        ...item,
        _id: String(item._id ?? generateId()),
      })),
      items: items.map((item) => ({
        ...item,
        _id: String(item._id ?? generateId()),
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
    logger.debug("[SalesDocShell] selectedCustomer:", selectedCustomer);
    logger.debug("[SalesDocShell] payload:", payload);
    logger.debug("[SalesDocShell] Calling onSubmit with payload");
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
      <Modal opened={newCustomerOpened} onClose={closeNewCustomer} title="Add New Customer">
        <Stack>
            <TextInput 
                label="Name" 
                placeholder="Required" 
                value={newCustomer.name} 
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                required
            />
            <TextInput 
                label="Phone" 
                placeholder="Mobile" 
                value={newCustomer.phone} 
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            />
            <Textarea 
                label="Address" 
                placeholder="Optional" 
                value={newCustomer.address} 
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            />
            <TextInput 
                label="City" 
                placeholder="Optional" 
                value={newCustomer.city} 
                onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
            />
            <NumberInput
                label="Opening Balance"
                value={newCustomer.openingAmount}
                onChange={(v) => setNewCustomer({ ...newCustomer, openingAmount: Number(v || 0) })}
            />
             <Select
                label="Payment Type"
                data={['Credit', 'Debit']}
                value={newCustomer.paymentType}
                onChange={(v) => setNewCustomer({ ...newCustomer, paymentType: (v as "Credit" | "Debit") || "Debit" })}
            />
            <Button onClick={handleCreateCustomer}>Save Customer</Button>
        </Stack>
      </Modal>
    <form onSubmit={handleSubmit}>
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
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {mode} No.
              </Text>
              <TextInput
                id="docNo"
                value={docNo}
                onChange={(e) => { setDocNo(e.target.value); }}
                placeholder={`${mode === "Quotation" ? "QUO" : "INV"}-2025-001`}
              />
            </div>
            <div>
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {mode} Date
              </Text>
              <TextInput
                id="docDate"
                type="date"
                value={docDate}
                onChange={(e) => { setDocDate(e.target.value); }}
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
             <div>
                <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                  Brand
                </Text>
                <Select
                  data={brandOptions}
                  value={globalBrand}
                  onChange={(v) => setGlobalBrand(v || "Haq Interior")}
                  searchable
                  allowDeselect={false}
                />
            </div>
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
                <Text style={{ fontSize: 14, fontWeight: 600 }}>Customer Details</Text>
                <SegmentedControl
                    value={customerType}
                    onChange={setCustomerType}
                    data={[
                        { label: 'Regular Customer', value: 'Regular' },
                        { label: 'Walking Customer', value: 'Walking' },
                    ]}
                    size="xs"
                />
            </Group>

            {customerType === 'Regular' ? (
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                    <div>
                        <Select
                            label="Select Customer (type to search)"
                            placeholder="Type customer name or select from list"
                            value={String(customerId)}
                            onChange={(v) => { setCustomerId(String(v ?? "")); }}
                            data={customers
                            .filter((c) => c._id && c.name)
                            .map((c) => ({
                                value: String(c._id),
                                label: `${c.name} — ${c.city ?? ""}`,
                            }))}
                            clearable
                            searchable
                            nothingFoundMessage={
                                <Button variant="subtle" size="xs" fullWidth onClick={openNewCustomer}>
                                    + Create New Customer
                                </Button>
                            }
                        />
                        <Button variant="subtle" size="xs" mt={4} onClick={openNewCustomer}>
                            + Create New Customer
                        </Button>
                    </div>

                    {selectedCustomer && (
                    <Paper
                        withBorder
                        p="xs"
                        style={{ boxShadow: "var(--mantine-shadow-xs)" }}
                    >
                        <div style={{ fontWeight: 700 }}>{selectedCustomer.name}</div>
                        <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                            {selectedCustomer.address || "No Address"}
                        </div>
                        <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 11, color: "#888" }}>
                                    Opening Amount
                                </div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                    {formatCurrency(selectedCustomer.openingAmount ?? 0)}
                                </div>
                            </div>
                        </div>
                    </Paper>
                    )}
                </div>
            ) : (
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
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
                  (p) => p.itemName === item.itemName || p._id === item._id
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
                onClick={() =>
                  { setItems((prev) => [
                    ...prev,
                    {
                      invoiceNumber: generateId(),
                      itemName: "",
                      unit: "",
                      quantity: 1,
                      salesRate: 0,
                      discount: 0,
                      amount: 0,
                      price: 0,
                      color: "",
                      openingStock: 0,
                      thickness: 0,
                      length: 0,
                      totalGrossAmount: 0,
                      totalNetAmount: 0,
                      discountAmount: 0,
                      brand: globalBrand,
                    },
                  ]); }
                }
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
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Remarks
              </Text>
              <Textarea
                value={remarks}
                onChange={(e) => { setRemarks(e.currentTarget.value); }}
                minRows={3}
                placeholder="Additional notes"
              />
            </div>
          </div>
        </Card.Section>

        <Card.Section inheritPadding py="xs" withBorder>
            <Group grow align="flex-start">
                {/* Left Side: Summary / Status */}
                <Stack gap="xs" style={{ maxWidth: '50%' }}>
                     <Group justify="space-between">
                         <Text size="sm" c="dimmed">Items Count:</Text>
                         <Text size="sm" fw={500}>{items.length}</Text>
                     </Group>
                     <Group justify="space-between">
                         <Text size="sm" c="dimmed">Total Quantity:</Text>
                         <Text size="sm" fw={500}>{items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)}</Text>
                     </Group>
                     <Group justify="space-between">
                         <Text size="sm" c="dimmed">Total Feet:</Text>
                         <Text size="sm" fw={500}>{items.reduce((s, i) => s + (Number(i.length) * Number(i.quantity) || 0), 0).toFixed(2)}</Text>
                     </Group>
                </Stack>

                {/* Right Side: Totals - horizontal layout now handled below */}
                {/* We can remove this entire right side stack and rely on the new bottom bar */}
            </Group>
        </Card.Section>
        
        {/* New Horizontal Bottom Bar */}
         <Card.Section withBorder p="sm" style={{ backgroundColor: "#f8f9fa" }}>
            <Group justify="space-between" align="center">
                 <Group gap="xl">
                     <div>
                         <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Gross</Text>
                         <Text size="md" fw={500}>{totals.totalGrossAmount.toFixed(2)}</Text>
                     </div>
                     <div>
                         <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Discount</Text>
                         <Text size="md" fw={500} c="orange">-{totals.totalDiscountAmount.toFixed(2)}</Text>
                     </div>
                     <div>
                         <Tooltip 
                             label="Formula: (Length × Qty × Rate) - Discount for each item"
                             position="top"
                             withArrow
                         >
                             <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ cursor: 'help' }}>Net Total ⓘ</Text>
                         </Tooltip>
                         <Text size="xl" fw={700}>{totals.totalNetAmount.toFixed(2)}</Text>
                     </div>
                     <div>
                         <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Received</Text>
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
                         <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pending</Text>
                         <Text size="xl" fw={700} c={totals.pendingAmount > 0.01 ? "red" : "green"}>
                             {Math.abs(totals.pendingAmount).toFixed(2)}
                             {totals.pendingAmount > 0.01 ? " Dr" : ""}
                         </Text>
                     </div>
                 </Group>

                 <Group gap="xl">
                     <div>
                         <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Ledger Status</Text>
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
                    it.discountAmount || (gross * discountPercent) / 100
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
                  total: totals.totalNetAmount,
                },
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
        <Button
          type="submit"
          disabled={saveDisabled || submitting}
          onClick={() =>
            { logger.debug("=== Save button clicked ===", {
              saveDisabled,
              submitting,
            }); }
          }
        >
          Save {mode}
        </Button>
      </div>
    </form>
    </>
  );
}
