import { useState, useEffect } from "react";
import { logger } from "../../../lib/logger";
import {
  Modal,
  Button,
  TextInput,
  Menu,
  ActionIcon,
  Group,
  Text,
  Title,
} from "@mantine/core";
import openPrintWindow from "../../../components/print/printWindow";
import type { InvoiceData } from "../../../components/print/printTemplate";
import Table from "../../../lib/AppTable";
import { showNotification } from "@mantine/notifications";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
// type import replaced by helper import below
import { PurchaseOrderForm as GeneratedPOForm } from "./PurchaseOrderForm.generated";
// import { useDataContext } from "../../Context/DataContext"; // REMOVED
import { usePurchase } from "../../../hooks/usePurchase";
import { useSupplier } from "../../../hooks/useSupplier";

import { IconEdit, IconPlus, IconPrinter, IconTrash } from "@tabler/icons-react";
import { Search } from "lucide-react";
import { generateNextDocumentNumber } from "../../../utils/document-utils";
import {
  normalizePurchaseSupplier,
  mapPurchaseOrderItems,
  buildPurchaseOrderPayload,
  type PurchaseLineItem,
} from "./purchase-order-helpers";
import { useInventory } from "../../../hooks/useInventory";

type PO = {
  id: string;
  poNumber: string;
  poDate: string | Date;
  supplier?: import("../../../components/purchase/SupplierForm").Supplier;
  products: PurchaseLineItem[];
  subTotal: number;
  total: number;
  status: string;
  expectedDeliveryDate?: Date;
  remarks?: string;
  createdAt?: Date;
};

export default function PurchaseOrdersPage() {
  // const {
  //   purchases,
  //   suppliers,
  //   loadSuppliers,
  //   loadPurchases,
  // } = useDataContext(); // REMOVED

  const { purchases, createPurchaseAsync, updatePurchaseAsync, deletePurchaseAsync } = usePurchase();
  const { suppliers } = useSupplier();
  
  useInventory(); // Ensure inventory is loaded

  // Inventory is auto-loaded by useInventory hook

  // Manual loading useEffects REMOVED

  const [data, setData] = useState<PO[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [editPO, setEditPO] = useState<PO | null>(null);
  const [deletePO, setDeletePO] = useState<PO | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Replace custom getNextPONumber with shared utility
  function getNextPONumber(): string {
    return generateNextDocumentNumber(
      "PO",
      (purchases || []).map((p) => p.poNumber || ""),
      3
    );
  }
  // Update data from purchases and suppliers
  useEffect(() => {
    logger.debug("[PO] Processing purchases:", purchases);
    logger.debug("[PO] Available suppliers:", suppliers);
    setData(
      (purchases || []).map((p) => {
        let expectedDeliveryDate: Date | undefined = undefined;
        if (p.expectedDelivery) {
          if (p.expectedDelivery instanceof Date) {
            expectedDeliveryDate = p.expectedDelivery;
          } else if (typeof p.expectedDelivery === "string") {
            const d = new Date(p.expectedDelivery);
            expectedDeliveryDate = isNaN(d.getTime()) ? undefined : d;
          }
        }

        // Use helper to resolve supplier
        const supplier = normalizePurchaseSupplier(
          p.supplier, 
          (p as any).supplierId, 
          (suppliers || []) as any
        );
        
        logger.debug("[PO] Resolved supplier for", p.poNumber, ":", supplier);
        
        let total = typeof p.total === "number" ? p.total : 0;
        if (!total && Array.isArray(p.products)) {
          total = p.products.reduce(
            (sum, it) => sum + (it.quantity || 0) * (it.rate || 0),
            0
          );
        }

        // Map items using helper (casting to PurchaseLineItem[] as expected by helper)
        const products = mapPurchaseOrderItems((p.products || []) as PurchaseLineItem[]);

        return {
          id: String(p.id) || p.poNumber || crypto.randomUUID(),
          poNumber: p.poNumber || "(No PO#)",
          poDate: p.poDate,
          supplier,
          products,
          subTotal: typeof p.subTotal === "number" ? p.subTotal : total,
          total,
          status: p.status || "",
          expectedDeliveryDate,
          remarks: p.remarks,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
        };
      })
    );
  }, [purchases, suppliers]);

  // On mount load purchases REMOVED

  async function handleCreate(payload: {
    poNumber: string;
    poDate: Date;
    expectedDelivery?: Date;
    supplierId?: string;
    products: PurchaseLineItem[];
    remarks?: string;
    subTotal?: number;
    total?: number;
  }) {
    try {
      // Resolve supplier from supplierId using helper
      const supplier = normalizePurchaseSupplier(
        undefined, 
        payload.supplierId, 
        (suppliers || []) as any
      );
      
      logger.debug("[PO] Saving with supplier:", supplier);
      logger.debug("[PO] Payload:", payload);
      
      // Build API payload
      const purchasePayload = buildPurchaseOrderPayload(payload, supplier);
      
      if (editPO) {
        // Update existing PO
        // const updatedPO = await import("../../../lib/api").then((api) =>
        //   api.updatePurchaseByNumber(editPO.poNumber, purchasePayload)
        // );
        
        await updatePurchaseAsync({
          id: editPO.id || editPO.poNumber, 
          payload: purchasePayload
        });
        
        // Local state update handled by React Query invalidation -> useEffect
        
        showNotification({
          title: "Updated",
          message: `Purchase Order ${payload.poNumber} updated successfully`,
          color: "green",
        });
      } else {
        // Create new PO
        // await import("../../../lib/api").then((api) =>
        //   api.createPurchase(purchasePayload)
        // );
        
        await createPurchaseAsync(purchasePayload);
        
        // Local state update handled by React Query invalidation -> useEffect
        
        showNotification({
          title: "Created",
          message: `Purchase Order ${payload.poNumber} created successfully`,
          color: "green",
        });
      }
      
      setOpen(false);
      setEditPO(null);
      // Reload handled by React Query
    } catch (err) {
      logger.error("[PO] Save error:", err);
      showNotification({
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to save purchase order",
        color: "red",
      });
    }
  }

  // (Removed duplicate JSX block before return statement)

  return (
    <div>
      <Modal
        opened={open}
        onClose={() => {
          setOpen(false);
          setEditPO(null);
        }}
        size="80%"
      >
        <GeneratedPOForm
          onSubmit={handleCreate}
          defaultPONumber={editPO ? editPO.poNumber : getNextPONumber()}
          {...(editPO
            ? {
                initialValues: {
                  ...editPO,
                  poDate:
                    typeof editPO.poDate === "string"
                      ? new Date(editPO.poDate)
                      : editPO.poDate instanceof Date
                      ? editPO.poDate
                      : undefined,
                },
              }
            : {})}
        />
      </Modal>
      <div style={{ marginTop: 16 }}>
       <Group justify="space-between">
       
          <Title order={2}>Purchase Orders</Title>
          <Group>
          <TextInput
            placeholder="Search PO number or supplier"
            value={q}
            onChange={(e) => { setQ(e.currentTarget.value); }}
            style={{ width: 300 }}
            leftSection={<Search size={16} />}
          />
          
          
          <Button onClick={() => { setOpen(true); }}
            leftSection={<IconPlus size={16} />}
          >
            Create PO
          </Button>
          </Group>
        </Group>
      </div>
      <Table withColumnBorders withRowBorders striped highlightOnHover withTableBorder mt="md">
        <Table.Thead style={{backgroundColor: "#F1F3F5"}}>
          <Table.Tr>
            <Table.Th>PO Number</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Supplier</Table.Th>
            <Table.Th style={{ textAlign: "left" }}>Total</Table.Th>
            <Table.Th style={{ textAlign: "left" }}>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data
            .filter((o) => {
              const term = q.trim().toLowerCase();
              if (!term) return true;
              return (
                String(o.poNumber).toLowerCase().includes(term) ||
                String(o.supplier?.name || "")
                  .toLowerCase()
                  .includes(term)
              );
            })
            .map((o) => (
              <Table.Tr
                key={o.id}
                tabIndex={0}
                aria-label={`PO ${o.poNumber} for ${o.supplier?.name || ''}`}
                onDoubleClick={() => {
                  setEditPO(o);
                  setOpen(true);
                }}
                style={{ cursor: 'pointer' }}
              > 
                <Table.Td style={{ fontFamily: "monospace" }}>
                  {o.poNumber}
                </Table.Td>
                <Table.Td>{formatDate(o.poDate)}</Table.Td>
                <Table.Td>{o.supplier?.name || ""}</Table.Td>
                <Table.Td style={{ textAlign: "left" }}>
                  {formatCurrency(o.total)}
                </Table.Td>
                <Table.Td>
                  <Menu withArrow width={200} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" aria-label={`Actions for PO ${o.poNumber}`} tabIndex={0}>
                        <span style={{ fontWeight: 600, fontSize: 18 }}>⋮</span>
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        onClick={() => {
                          setEditPO(o);
                          setOpen(true);
                        }}
                        leftSection={<IconEdit size={16} />}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => {
                          const d: InvoiceData = {
                            title: "Purchase Order",
                            companyName: "Seven Star Traders",
                            addressLines: [
                              "Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan",
                            ],
                            invoiceNo: String(o.poNumber),
                            date: String(o.poDate),
                            customer: o.supplier?.name || "",
                            items: (o.products || []).map((it, idx) => ({
                              sr: idx + 1,
                              section: `${it.productName}${it.thickness || it.color ? ` (Thickness: ${it.thickness ?? '-'}, Color: ${it.color ?? '-'})` : ''}`,
                              quantity: it.quantity,
                              rate: Number(it.rate ?? 0),
                              amount: Number(it.amount ?? (it.quantity || 0) * (it.rate || 0)),
                            })),
                            totals: {
                              subtotal: o.subTotal ?? o.total,
                              total: o.total,
                            },
                          };
                          openPrintWindow(d);
                        }}
                        leftSection={<IconPrinter size={16} />}
                      >
                        Print
                      </Menu.Item>
                      <Menu.Item color="red" onClick={() => { setDeletePO(o); }} leftSection={<IconTrash size={16} />}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
      <Modal
        opened={!!deletePO}
        onClose={() => { setDeletePO(null); }}
        title="Confirm Delete"
        centered
        withCloseButton
      >
        <Text>
          Are you sure you want to delete Purchase Order{" "}
          <b>{deletePO?.poNumber}</b>?
        </Text>
        <Group justify="right" mt="md">
          <Button
            variant="default"
            onClick={() => { setDeletePO(null); }}
            disabled={deleteLoading}
            style={{ color: '#222', backgroundColor: '#f3f3f3', border: '1px solid #ccc' }}
            aria-label="Cancel Delete PO"
          >
            Cancel
          </Button>
          <Button
            color="red"
            loading={deleteLoading}
            onClick={async () => {
              if (!deletePO) return;
              setDeleteLoading(true);
              logger.debug("[PO] Deleting:", deletePO.poNumber);
              try {
                // const result = await deletePurchaseByNumber(deletePO.poNumber);
                // We use ID if available, else poNumber? 
                // The hooks use ID. If deletePurchaseByNumber used poNumber, we should check if we have ID.
                // data mapping (line 118) ensures id is present (or generated? "id: p.id || p.poNumber || crypto...").
                // If it's a real backend record, it should have an ID.
                
                await deletePurchaseAsync(deletePO.id || deletePO.poNumber);
                
                // Remove from local state handled by React Query -> useEffect
                
                showNotification({
                  title: "Deleted",
                  message: `Purchase Order ${deletePO.poNumber} deleted successfully`,
                  color: "green",
                });
                setDeletePO(null);
                
                // Reload handled by React Query
              } catch (err) {
                logger.error("[PO] Delete error:", err);
                let msg = "Failed to delete purchase order.";
                if (
                  err &&
                  typeof err === "object" &&
                  err !== null &&
                  "message" in err &&
                  typeof (err as { message?: unknown }).message === "string"
                ) {
                  msg = (err as { message: string }).message;
                }
                showNotification({
                  title: "Error",
                  message: msg,
                  color: "red",
                });
              } finally {
                setDeleteLoading(false);
              }
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
