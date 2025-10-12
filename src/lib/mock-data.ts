export const mockCustomers = [
  {
    id: "c1",
    name: "Aamir Traders",
    city: "Lahore",
    address: "12 Market Street, Lahore",
    gstNumber: "GSTIN12345",
    currentBalance: 12500,
  },
  {
    id: "c2",
    name: "Bilal Enterprises",
    city: "Karachi",
    address: "45 Industrial Area, Karachi",
    gstNumber: "GSTIN67890",
    currentBalance: 4200,
  },
  {
    id: "c3",
    name: "Hassan Aluminium",
    city: "Islamabad",
    address: "9 Corporate Ave, Islamabad",
    gstNumber: "GSTIN00011",
    currentBalance: -800,
  },
];

export type MockCustomer = (typeof mockCustomers)[number];

export const mockSuppliers = [
  {
    id: "s1",
    supplierCode: "SUP-001",
    name: "Aluminium Co",
    city: "Lahore",
    address: "1 Market Rd",
    gstNumber: "GST111",
    currentBalance: 5000,
  },
  {
    id: "s2",
    supplierCode: "SUP-002",
    name: "SteelWorks",
    city: "Karachi",
    address: "22 Industrial Ave",
    gstNumber: "GST222",
    currentBalance: -1200,
  },
];

export const mockGRNs = [
  {
    id: "g1",
    grnNumber: "GRN-001",
    supplierId: "s1",
    supplierName: "Aluminium Co",
    items: [
      {
        productId: "1",
        productName: "Alu Sheet",
        unit: "pcs",
        quantity: 10,
        rate: 100,
        discount: 0,
        taxRate: 18,
        amount: 1180,
      },
    ],
  },
];
