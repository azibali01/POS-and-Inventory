import {
  Title,
  Button,
  Modal,
  Table,
  Box,
  Text,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { logger } from "../../../lib/logger";
import { IconDotsVertical, IconEdit, IconPrinter } from "@tabler/icons-react";
import SalesDocShell, {
  type SalesPayload,
} from "../../../components/sales/SalesDocShell";
import {
  getSaleReturns,
  createSaleReturn,
  deleteSaleReturn,
  type SaleRecordPayload,
} from "../../../lib/api";
import { showNotification } from "@mantine/notifications";
import { useDataContext } from "../../Context/DataContext";
import { formatCurrency } from "../../../lib/format-utils";
import { useState, useEffect } from "react";

export default function SaleReturnPage() {
  const { customers, inventory, loadInventory } = useDataContext();

  // Debug: log customers to check structure
  useEffect(() => {
    logger.debug("[SaleReturn] customers:", customers);
  }, [customers]);

  // Ensure products (inventory) are loaded on mount
  useEffect(() => {
    if (!inventory || inventory.length === 0) {
      loadInventory();
    }
  }, [inventory, loadInventory]);

  const [returns, setReturns] = useState<SaleRecordPayload[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | number | null>(
    null
  );
  const [initialPayload, setInitialPayload] = useState<SalesPayload | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editPayload, setEditPayload] = useState<SalesPayload | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // Generate a unique sale return number (SR-0001, SR-0002, ...)
  function makeReturnNumber() {
    const prefix = "SR-";
    let maxNum = 0;
    if (returns && returns.length > 0) {
      returns.forEach((s) => {
        const numStr = String(s.invoiceNumber || "");
        if (numStr.startsWith(prefix)) {
          const n = parseInt(numStr.replace(prefix, ""), 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      });
    }
    const nextNum = (maxNum === 0 ? 1 : maxNum + 1).toString().padStart(4, "0");
    return `${prefix}${nextNum}`;
  }

  async function handleSaleReturnSubmit(payload: SalesPayload) {
    setSubmitting(true);
    const invoiceNumber = makeReturnNumber();
    const invoiceDate = payload.docDate || new Date().toISOString();
    // Resolve customer from payload.customer (supports object with id or raw value)
    const customerRef = (payload as any).customer;
    let selectedCustomer = null;
    if (customerRef && typeof customerRef === 'object' && (customerRef.id || customerRef._id)) {
      selectedCustomer = customers.find((c) => String(c._id) === String(customerRef.id ?? customerRef._id));
    } else if (typeof customerRef === 'string' && customerRef) {
      selectedCustomer = customers.find((c) => String(c._id) === String(customerRef) || String(c.name).toLowerCase() === String(customerRef).toLowerCase());
    }
    const customerObject = selectedCustomer
      ? { _id: selectedCustomer._id, name: selectedCustomer.name }
      : (customerRef && typeof customerRef === 'object' && customerRef.name)
      ? { name: String(customerRef.name) }
      : null;
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
        };
      }) ?? [];

    const apiPayload: SaleRecordPayload = {
      invoiceNumber,
      invoiceDate,
      products: products.map((item) => ({
        ...item,
        thickness:
          typeof item.thickness === "string"
            ? isNaN(Number(item.thickness))
              ? undefined
              : Number(item.thickness)
            : item.thickness,
      })),
      subTotal: Math.floor(payload.totals?.subTotal ?? 0),
      totalGrossAmount: Math.floor(payload.totals?.totalGrossAmount ?? 0),
      totalNetAmount: Math.floor(payload.totals?.totalNetAmount ?? 0),
      discount: 0,
      totalDiscount: Math.floor(payload.totals?.totalDiscountAmount ?? 0),
      quotationDate: invoiceDate,
      customer: customerObject,
      paymentMethod: undefined,
      length: payload.items?.length ?? 0,
      remarks: payload.remarks ?? "",
      metadata: { source: "sale-return" },
    };
    try {
      logger.debug(
        "[SaleReturn] apiPayload sent to backend:",
        JSON.stringify(apiPayload, null, 2)
      );
      await createSaleReturn(apiPayload);
      showNotification({
        title: "Sale Return Saved",
        message: `Sale return ${invoiceNumber} saved successfully`,
        color: "green",
      });
      setOpen(false);
      setInitialPayload(null);
      setSubmitting(false);
      setLoading(true);
      const data = await getSaleReturns();
      setReturns(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotification({
        title: "Sale Return Failed",
        message: String(err),
        color: "red",
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSaleReturn(String(deleteTarget));
      showNotification({
        title: "Return Deleted",
        message: `Return ${deleteTarget} deleted successfully`,
        color: "green",
      });
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setLoading(true);
      const data = await getSaleReturns();
      setReturns(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotification({
        title: "Delete Failed",
        message: String(err),
        color: "red",
      });
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    getSaleReturns()
      .then((data) => {
        setReturns(Array.isArray(data) ? data : []);
      })
      .finally(() => { setLoading(false); });
  }, []);

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
          <Title>Sales Returns</Title>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Search returns..."
              value={q}
              onChange={(e) => { setQ(e.target.value); }}
              style={{
                padding: 6,
                width: 260,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
            <Button onClick={() => { setOpen(true); }} variant="filled" size="sm">
              + Add Sale Return
            </Button>
          </div>
        </div>
        {/* Add Sale Return Modal */}
        <Modal
          opened={open && !initialPayload}
          onClose={() => { setOpen(false); }}
          title="Create Sale Return"
          size="100%"
        >
          <div style={{ width: "100%" }}>
            <SalesDocShell
              mode="Invoice"
              customers={customers}
              products={inventory}
              submitting={submitting}
              setSubmitting={setSubmitting}
              onSubmit={handleSaleReturnSubmit}
              initial={{
                docNo: makeReturnNumber(),
                docDate: new Date().toISOString(),
                mode: "Invoice",
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
          </div>
        </Modal>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
        ) : returns && returns.length > 0 ? (
          <Table
            withRowBorders
            withColumnBorders
            highlightOnHover
            withTableBorder
            bg={"gray.1"}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Return #</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {returns
                .filter((ret) => {
                  const term = q.trim().toLowerCase();
                  if (!term) return true;
                  return (
                    String(ret.invoiceNumber).toLowerCase().includes(term) ||
                    (Array.isArray(ret.customer) &&
                      ret.customer[1]?.name &&
                      String(ret.customer[1].name).toLowerCase().includes(term))
                  );
                })
                .map((ret, idx) => {
                  const displayCustomerName = (() => {
                    const resolveFromRef = (ref: any): string => {
                      if (!ref) return "";
                      if (Array.isArray(ref)) {
                        for (const x of ref) {
                          if (!x) continue;
                          if (typeof x === "string") {
                            const found = customers.find(
                              (c) => String(c._id) === String(x) || String(c.name).toLowerCase() === String(x).toLowerCase()
                            );
                            if (found) return found.name;
                            return x;
                          }
                          if (typeof x === "object") {
                            if (x.name) return x.name;
                            if (x._id || x.id) {
                              const found = customers.find((c) => String(c._id) === String(x._id ?? x.id));
                              if (found) return found.name;
                              return String(x._id ?? x.id);
                            }
                          }
                        }
                        return "";
                      }
                      if (typeof ref === "object") {
                        if (ref.name) return String(ref.name);
                        if (ref._id || ref.id) {
                          const found = customers.find((c) => String(c._id) === String(ref._id ?? ref.id));
                          return found ? found.name : String(ref._id ?? ref.id);
                        }
                        return "";
                      }
                      if (typeof ref === "string") {
                        const found = customers.find(
                          (c) => String(c._id) === String(ref) || String(c.name).toLowerCase() === String(ref).toLowerCase()
                        );
                        return found ? found.name : ref;
                      }
                      return "";
                    };
                    return resolveFromRef(ret.customer);
                  })();

                  const openForEdit = (sourceRet: any) => {
                    logger.debug("[SaleReturn] Opening for edit:", sourceRet);
                    let retCustomer: any = null;
                    const custRef = sourceRet.customer;
                    logger.debug("[SaleReturn] Customer ref:", custRef);
                    if (Array.isArray(custRef)) {
                      const found = custRef.find((c: any) => c && (c.name || c._id || typeof c === 'string'));
                      if (found) {
                        if (typeof found === 'string') {
                          const byId = customers.find((c) => String(c._id) === String(found));
                          retCustomer = byId ? { id: byId._id, name: byId.name } : { id: found, name: found };
                        } else {
                          retCustomer = { id: found._id ?? found.id, name: found.name };
                        }
                      }
                    } else if (custRef && typeof custRef === 'object') {
                      retCustomer = { id: custRef._id ?? custRef.id, name: custRef.name };
                    } else if (typeof custRef === 'string') {
                      const byId = customers.find((c) => String(c._id) === String(custRef) || String(c.name).toLowerCase() === String(custRef).toLowerCase());
                      retCustomer = byId ? { id: byId._id, name: byId.name } : { id: custRef, name: custRef };
                    }
                    logger.debug("[SaleReturn] Resolved customer:", retCustomer);
                    logger.debug("[SaleReturn] Source products:", sourceRet.products);
                    logger.debug("[SaleReturn] Available inventory:", inventory);
                    setEditPayload({
                      docNo: sourceRet.invoiceNumber || "",
                      docDate: sourceRet.invoiceDate || "",
                      mode: "Invoice",
                      items: (sourceRet.products || []).map((item: any) => {
                        // Try to find the product in inventory by itemName or _id
                        const inventoryProduct = inventory.find(
                          (p) =>
                            String(p._id) === String(item._id) ||
                            String(p.itemName).toLowerCase().trim() === String(item.itemName ?? "").toLowerCase().trim()
                        );
                        logger.debug("[SaleReturn] Mapping item:", {
                          itemId: item._id,
                          itemName: item.itemName,
                          foundInInventory: inventoryProduct?.itemName,
                          inventoryId: inventoryProduct?._id,
                        });
                        return {
                          _id: inventoryProduct?._id ?? item._id ?? item.id ?? item.productId ?? "",
                          itemName: item.itemName ?? item.productName ?? "",
                          description: item.description ?? "",
                          category: item.category ?? "",
                          unit: typeof item.unit === "string" ? item.unit : typeof item.unit === "number" ? String(item.unit) : "",
                          quantity: item.quantity ?? 0,
                          salesRate: item.salesRate ?? item.rate ?? 0,
                          amount: item.amount ?? 0,
                          totalGrossAmount: item.totalGrossAmount ?? 0,
                          totalNetAmount: item.totalNetAmount ?? 0,
                          discount: item.discount ?? 0,
                          discountAmount: item.discountAmount ?? 0,
                          color: item.color ?? "",
                          thickness: item.thickness ?? 0,
                          length: item.length ?? 0,
                          metadata: item.metadata ?? {},
                        };
                      }),
                      totals: {
                        subTotal: sourceRet.subTotal ?? 0,
                        total: sourceRet.subTotal ?? 0,
                        amount: sourceRet.subTotal ?? 0,
                        totalGrossAmount: sourceRet.totalGrossAmount ?? 0,
                        totalDiscountAmount: sourceRet.totalDiscount ?? 0,
                        totalNetAmount: sourceRet.totalNetAmount ?? 0,
                      },
                      terms: "",
                      remarks: sourceRet.remarks ?? "",
                      customer: retCustomer
                        ? {
                            id: retCustomer.id ?? retCustomer._id ?? undefined,
                            name: retCustomer.name ??
                              (customers.find((c) => String(c._id) === String(retCustomer.id ?? retCustomer._id))?.name ?? undefined),
                          }
                        : undefined,
                    });
                    logger.debug("[SaleReturn] Final edit payload:", {
                      docNo: sourceRet.invoiceNumber,
                      customer: retCustomer,
                      itemsCount: sourceRet.products?.length,
                    });
                    setEditingId(sourceRet.invoiceNumber || "");
                    setEditOpen(true);
                  };

                  return (
                    <Table.Tr key={ret.invoiceNumber ?? idx} onDoubleClick={() => { openForEdit(ret); }} style={{ cursor: 'pointer' }}>
                      <Table.Td>{ret.invoiceNumber}</Table.Td>
                      <Table.Td>{ret.invoiceDate ? new Date(ret.invoiceDate).toLocaleDateString() : ""}</Table.Td>
                      <Table.Td>{displayCustomerName}</Table.Td>
                      <Table.Td>{formatCurrency(ret.totalNetAmount ?? ret.subTotal ?? 0)}</Table.Td>
                      <Table.Td>
                        <Menu withinPortal shadow="md">
                          <Menu.Target>
                            <ActionIcon variant="subtle"><IconDotsVertical /></ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => { openForEdit(ret); }}>Edit</Menu.Item>
                            <Menu.Item leftSection={<IconPrinter size={16} />} onClick={() => { /* Print if needed */ }}>Print</Menu.Item>
                            <Menu.Item color="red" onClick={() => { setDeleteTarget(ret.invoiceNumber ?? ""); setDeleteModalOpen(true); }}>Delete</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
            </Table.Tbody>
          </Table>
        ) : (
          <div>No sales returns found.</div>
        )}
      </div>
      {/* Delete confirmation modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title="Confirm delete"
        centered
        size="xs"
      >
        <Box>
          <Text>
            Are you sure you want to delete return{" "}
            {deleteTarget ? `#${deleteTarget}` : ""}?
          </Text>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 12,
            }}
          >
            <Button
              variant="default"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Edit Sale Return Modal */}
      <Modal
        opened={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditPayload(null);
          setEditingId(null);
        }}
        title={`Edit Sale Return: ${editPayload?.docNo || editingId}`}
        size="100%"
      >
        <div style={{ width: "100%" }}>
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
        </div>
      </Modal>
    </>
  );
}
