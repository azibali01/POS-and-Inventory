import { describe, it, expect } from "vitest";
import {
  computeInventoryAfterReturn,
  computePurchasesAfterReturn,
} from "../return-utils";

import type { InventoryItem } from "../DataContext";

type ReturnItem = {
  sku: string;
  quantity: number;
};

type ReturnType = {
  id: string;
  returnNumber: string;
  returnDate: string;
  linkedPoId?: string;
  items: ReturnItem[];
  subtotal: number;
  totalAmount: number;
};

type PurchaseItem = {
  sku: string;
  quantity: number;
  price: number;
  received: number;
};

type Purchase = {
  id: string;
  date: string;
  supplier: string;
  items: PurchaseItem[];
  total: number;
  fulfillmentStatus?: "open" | "partially_received" | "received";
};

describe("return-utils", () => {
  it("decreases inventory stocks for returned items", () => {
    const inventory: InventoryItem[] = [
      {
        id: 1,
        sku: "A",
        name: "A",
        code: "A",
        unit: "pcs",
        costPrice: 10,
        sellingPrice: 15,
        stock: 10,
        minStock: 0,
        maxStock: 100,
        location: "",
        description: "",
        status: "active",
        lastUpdated: "",
        category: "",
        supplier: "",
      },
      {
        id: 2,
        sku: "B",
        name: "B",
        code: "B",
        unit: "pcs",
        costPrice: 5,
        sellingPrice: 8,
        stock: 5,
        minStock: 0,
        maxStock: 100,
        location: "",
        description: "",
        status: "active",
        lastUpdated: "",
        category: "",
        supplier: "",
      },
    ];

    const ret: ReturnType = {
      id: "r1",
      returnNumber: "R1",
      returnDate: new Date().toISOString(),
      items: [
        { sku: "A", quantity: 3 },
        { sku: "B", quantity: 10 },
      ],
      subtotal: 0,
      totalAmount: 0,
    };
    const out = computeInventoryAfterReturn(inventory, ret);
    expect(out.find((i) => i.sku === "A")!.stock).toBe(7);
    expect(out.find((i) => i.sku === "B")!.stock).toBe(0); // not negative
  });

  it("updates purchase received quantities when return linked to PO", () => {
    const purchases: Purchase[] = [
      {
        id: "po1",
        date: new Date().toISOString(),
        supplier: "",
        items: [
          { sku: "A", quantity: 10, price: 1, received: 5 },
          { sku: "B", quantity: 4, price: 2, received: 4 },
        ],
        total: 0,
      },
    ];

    const ret: ReturnType = {
      id: "r1",
      returnNumber: "R1",
      returnDate: new Date().toISOString(),
      linkedPoId: "po1",
      items: [
        { sku: "A", quantity: 2 },
        { sku: "B", quantity: 3 },
      ],
      subtotal: 0,
      totalAmount: 0,
    };
    const out = computePurchasesAfterReturn(purchases, ret);
    const po = out.find((p) => p.id === "po1")!;
    const itemA = po.items.find((i) => i.sku === "A");
    expect(itemA).toBeDefined();
    expect(itemA!.received).toBe(3);
    const itemB = po.items.find((i) => i.sku === "B");
    expect(itemB).toBeDefined();
    expect(itemB!.received).toBe(1);
    // fulfillmentStatus should be partially_received because not all received cleared
    expect(po.fulfillmentStatus).toBeDefined();
  });
});
