import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "./i18n/context";
import { AuthProvider, useAuth } from "./auth/context";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Secretary from "./pages/Secretary";
import Sales from "./pages/Sales";
import Brain from "./pages/Brain";
import Approvals from "./pages/Approvals";
import Workflows from "./pages/Workflows";
import Integrations from "./pages/Integrations";
import Activity from "./pages/Activity";
import Analytics from "./pages/Analytics";
import Tasks from "./pages/Tasks";
import Enquiries from "./pages/Enquiries";
import EnquiryDetail from "./pages/EnquiryDetail";
import Settings from "./pages/Settings";
import Marketplace from "./pages/Marketplace";
import Trust from "./pages/Trust";
import { Pilot, Pricing } from "./pages/Public";
import type { ReactNode } from "react";

function Guard({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-sm text-ink-400">…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
function AppShell({ children }: { children: ReactNode }) {
  return <Guard><Layout>{children}</Layout></Guard>;
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pilot" element={<Pilot />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/app" element={<AppShell><Dashboard /></AppShell>} />
            <Route path="/app/employees" element={<AppShell><Employees /></AppShell>} />
            <Route path="/app/secretary" element={<AppShell><Secretary /></AppShell>} />
            <Route path="/app/sales" element={<AppShell><Sales /></AppShell>} />
            <Route path="/app/brain" element={<AppShell><Brain /></AppShell>} />
            <Route path="/app/approvals" element={<AppShell><Approvals /></AppShell>} />
            <Route path="/app/workflows" element={<AppShell><Workflows /></AppShell>} />
            <Route path="/app/integrations" element={<AppShell><Integrations /></AppShell>} />
            <Route path="/app/activity" element={<AppShell><Activity /></AppShell>} />
            <Route path="/app/analytics" element={<AppShell><Analytics /></AppShell>} />
            <Route path="/app/tasks" element={<AppShell><Tasks /></AppShell>} />
            <Route path="/app/enquiries" element={<AppShell><Enquiries /></AppShell>} />
            <Route path="/app/enquiries/:id" element={<AppShell><EnquiryDetail /></AppShell>} />
            <Route path="/app/settings" element={<AppShell><Settings /></AppShell>} />
            <Route path="/app/marketplace" element={<AppShell><Marketplace /></AppShell>} />
            <Route path="/app/trust" element={<AppShell><Trust /></AppShell>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
