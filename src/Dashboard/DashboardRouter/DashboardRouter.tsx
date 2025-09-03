import type { RouteObject } from "react-router";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import Dashboard from "../Pages/Dashboard";
import POS from "../Pages/POS";
import Inventory from "../Pages/Inventory";
import Reports from "../Pages/Reports";
import Settings from "../Pages/Settings";

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
