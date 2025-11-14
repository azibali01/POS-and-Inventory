import {
  createBrowserRouter,
  RouterProvider as ReactRouterProvider,
} from "react-router";
import AuthRouter from "../Auth/router/AuthRouter";
import DashboardRouter from "../Dashboard/DashboardRouter/DashboardRouter";
import RootRedirect from "../components/RootRedirect";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  ...AuthRouter,
  ...DashboardRouter,
]);

const RouterProvider = () => {
  return <ReactRouterProvider router={router}></ReactRouterProvider>;
};
export default RouterProvider;
