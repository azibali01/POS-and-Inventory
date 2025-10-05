import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ThemeProvider from "./Theme/ThemeProvider";
import RouterProvider from "./Router/Router.tsx";
import { AuthProvider } from "./Auth/Context/AuthContext.tsx";
import { DataProvider } from "./Dashboard/Context/DataContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <RouterProvider />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
