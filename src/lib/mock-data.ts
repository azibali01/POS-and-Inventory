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
