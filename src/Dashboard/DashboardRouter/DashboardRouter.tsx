import type { RouteObject } from "react-router";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import Dashboard from "../Pages/Dashboard";
import POS from "../Pages/POS";
import Inventory from "../Pages/Inventory";
import Reports from "../Pages/Reports";
import CashBook from "../Pages/CashBook";
import Settings from "../Pages/Settings";
import SalesInvoice from "../Pages/SalesInvoice";
import PurchaseInvoice from "../Pages/PurchaseInvoice";
import SalesReturn from "../Pages/SalesReturn";
import PurchaseReturn from "../Pages/PurchaseReturn";
import Ledger from "../Pages/Ledger";
import GRN from "../Pages/GRN";

const routes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
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
      {
        path: "invoices/sales",
        element: <SalesInvoice />,
      },
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
