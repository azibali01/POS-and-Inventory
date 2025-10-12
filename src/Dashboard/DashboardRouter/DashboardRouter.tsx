import type { RouteObject } from "react-router";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import Dashboard from "../Pages/Dashboard";
import SalesReturnPage from "../Pages/Sales/Salereturn";
import ProductMaster from "../Pages/Products/ProductMaster";
import StockReportPage from "../Pages/Products/StockReport";
import CustomersPage from "../Pages/Sales/Customers";
import QuotationsPage from "../Pages/Sales/Quotation";
import SalesInvoicePage from "../Pages/Sales/SaleInvoice";
import SuppliersPage from "../Pages/Purchase/Supplier";
import PurchaseOrderPage from "../Pages/Purchase/PurchaseOrder";
import GRNPage from "../Pages/Purchase/GRN";
import PurchaseInvoicePage from "../Pages/Purchase/PurchaseInvoice";
import PurchaseReturnPage from "../Pages/Purchase/PurchaseReturn";
import ExpensesPage from "../Pages/Expenses";
import ReceiptsPage from "../Pages/Accounts/ReceiptVoucher";

import ProfitLoss from "../Pages/Reports/Profit&Loss";
import Stocksummary from "../Pages/Reports/Stocksummary";

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
        path: "sales/returns",
        element: <SalesReturnPage />,
      },
      //-------------------Purchases-----------------//
      {
        path: "/purchase/suppliers",
        element: <SuppliersPage />,
      },
      {
        path: "/purchase/orders",
        element: <PurchaseOrderPage />,
      },
      {
        path: "/purchase/grn",
        element: <GRNPage />,
      },
      {
        path: "/purchase/invoices",
        element: <PurchaseInvoicePage />,
      },
      {
        path: "/purchase/returns",
        element: <PurchaseReturnPage />,
      },
      //-------------------Expenses-----------------//
      {
        path: "/expenses",
        element: <ExpensesPage />,
      },
      // -------------------Accounts-----------------//
      {
        path: "/accounts/receipts",
        element: <ReceiptsPage />,
      },
      //---------------------Reports-----------------//
      {
        path: "/reports/stock-summary",
        element: <Stocksummary />,
      },

      {
        path: "/reports/profit-loss",
        element: <ProfitLoss />,
      },
      {},
    ],
  },
];
export default routes;
