import { Box } from "@mantine/core";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout/DashboardLayout";
import Dashboard from "../Dashboard/Pages/Dashboard";
import ContactLandingPage from "./ContactLandingPage";

/**
 * Blurred dashboard preview (read-only) with contact popup on top.
 * Uses an isolated MemoryRouter so the real app URL stays at `/` if we later add BrowserRouter.
 */
export default function DemoShowcaseShell() {
  return (
    <Box pos="relative" mih="100dvh" w="100%" style={{ overflow: "hidden" }}>
      <Box
        pos="fixed"
        inset={0}
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          zIndex: 0,
          filter: "blur(8px)",
          WebkitFilter: "blur(8px)",
          transform: "scale(1.02)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Box>

      <Box
        pos="fixed"
        inset={0}
        style={{
          zIndex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.38)",
        }}
      />

      <Box
        pos="fixed"
        inset={0}
        style={{
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--mantine-spacing-md)",
          pointerEvents: "none",
        }}
      >
        <Box style={{ pointerEvents: "auto", width: "100%", maxWidth: 520 }}>
          <ContactLandingPage embedded />
        </Box>
      </Box>
    </Box>
  );
}
