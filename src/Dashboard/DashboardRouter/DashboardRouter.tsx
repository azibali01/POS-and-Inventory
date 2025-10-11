import type { RouteObject } from "react-router";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import Dashboard from "../Pages/Dashboard";
import POS from "../Pages/POS";
import Inventory from "../Pages/Inventory";
import Reports from "../Pages/Reports";
import CashBook from "../Pages/CashBook";
import Settings from "../Pages/Settings";

import PurchaseInvoice from "../Pages/PurchaseInvoice";
import SalesReturn from "../Pages/SalesReturn";
import PurchaseReturn from "../Pages/PurchaseReturn";
import Ledger from "../Pages/Ledger";
import GRN from "../Pages/GRN";

import ProductMaster from "../Pages/Products/ProductMaster";
import StockReportPage from "../Pages/Products/StockReport";
import CustomersPage from "../Pages/Sales/Customers";
import QuotationsPage from "../Pages/Sales/Quotation";
import SalesInvoicePage from "../Pages/Sales/SaleInvoice";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      //-------------------Products-----------------//
      {
        path: "products",
        element: <ProductMaster />,
      },
      {
        path: "products/stock-report",
        element: <StockReportPage />,
      },
      //-------------------Sales-----------------//
      {
        path: "sales/customers",
        element: <CustomersPage />,
      },
      {
        path: "sales/quotations",
        element: <QuotationsPage />,
      },
      {
        path: "sales/invoices",
        element: <SalesInvoicePage />,
      },
      {
        path: "pos",
        element: <POS />,
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "grn",
        element: <GRN />,
      },
      // {
      //   path: "invoices/sales",
      //   element: <SalesInvoice />,
      // },
      {
        path: "invoices/purchase",
        element: <PurchaseInvoice />,
      },
      {
        path: "invoices/sales-return",
        element: <SalesReturn />,
      },
      {
        path: "invoices/purchase-return",
        element: <PurchaseReturn />,
      },
      {
        path: "ledger",
        element: <Ledger />,
      },
      {
        path: "cashbook",
        element: <CashBook />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
];
export default routes;
