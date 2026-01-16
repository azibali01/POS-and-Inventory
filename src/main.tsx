import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ThemeProvider from "./Theme/ThemeProvider";
import RouterProvider from "./Router/Router.tsx";
import { AuthProvider } from "./Auth/Context/AuthContext.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { DataProvider } from "./Dashboard/Context/DataContext.tsx";
import {
  InventoryProvider,
  SalesProvider,
  PurchaseProvider,
  AccountsProvider,
  ExpensesProvider,
} from "./contexts/index.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          {/* OLD DataProvider - for components not yet migrated */}
          <DataProvider>
            <QueryClientProvider client={queryClient}>
              {/* NEW domain-specific providers - for migrated components */}
              <InventoryProvider>
                <SalesProvider>
                  <PurchaseProvider>
                    <AccountsProvider>
                      <ExpensesProvider>
                        <RouterProvider />
                      </ExpensesProvider>
                    </AccountsProvider>
                  </PurchaseProvider>
                </SalesProvider>
              </InventoryProvider>
            </QueryClientProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
