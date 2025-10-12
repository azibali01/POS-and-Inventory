import type {
  InventoryItem,
  PurchaseReturnRecord,
  PurchaseRecord,
} from "./DataContext";

export function computeInventoryAfterReturn(
  inventory: InventoryItem[],
  ret: PurchaseReturnRecord
): InventoryItem[] {
  return inventory.map((item) => {
    const found = ret.items.find((ri) => String(ri.sku) === String(item.sku));
    if (found) {
      return {
        ...item,
        stock: Math.max(0, (item.stock || 0) - (found.quantity || 0)),
      } as InventoryItem;
    }
    return item;
  });
}

export function computePurchasesAfterReturn(
  purchases: PurchaseRecord[],
  ret: PurchaseReturnRecord
): PurchaseRecord[] {
  if (!ret.linkedPoId) return purchases;
  return purchases.map((po) => {
    if (String(po.id) !== String(ret.linkedPoId)) return po;
    const items = (po.items || []).map((pi) => {
      const matched = ret.items.find((ri) => String(ri.sku) === String(pi.sku));
      if (!matched) return { ...pi };
      const prevReceived = pi.received || 0;
      return {
        ...pi,
        received: Math.max(0, prevReceived - (matched.quantity || 0)),
      };
    });

    let fulfillmentStatus: PurchaseRecord["fulfillmentStatus"] = "open";
    const totalOrdered = items.reduce((s, i) => s + (i.quantity || 0), 0);
    const totalReceived = items.reduce((s, i) => s + (i.received || 0), 0);
    if (totalReceived <= 0) fulfillmentStatus = "open";
    else if (totalReceived < totalOrdered)
      fulfillmentStatus = "partially_received";
    else fulfillmentStatus = "received";

    return { ...po, items, fulfillmentStatus } as PurchaseRecord;
  });
}
