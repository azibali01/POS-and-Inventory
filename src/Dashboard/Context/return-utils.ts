/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  InventoryItem,
  PurchaseReturnRecord,
  PurchaseRecord,
} from "./DataContext";

export function computeInventoryAfterReturn(
  inventory: InventoryItem[],
  ret: PurchaseReturnRecord
): InventoryItem[] {
  return inventory.map((item: InventoryItem) => {
    const found = ret.items.find((ri) => String(ri._id) === String(item._id));
    if (found) {
      return {
        ...item,
        stock: Math.max(0, (item.stock || 0) - (found.quantity || 0)),
      };
    }
    return item;
  });
}

export function computePurchasesAfterReturn(
  purchases: PurchaseRecord[],
  ret: PurchaseReturnRecord
): PurchaseRecord[] {
  if (!ret.linkedPoId) return purchases;
  return purchases.map((po: PurchaseRecord) => {
    if (String(po.id) !== String(ret.linkedPoId)) return po;
    const products = (po.products || []).map((pi) => {
      const matched = ret.items.find((ri) => String(ri._id) === String(pi.id));
      if (!matched) return { ...pi };
      const prevReceived = (pi as any).received || 0;
      return {
        ...pi,
        received: Math.max(0, prevReceived - (matched.quantity || 0)),
      };
    });
    return { ...po, products };
  });
}
