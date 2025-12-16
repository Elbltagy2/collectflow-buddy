import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Sales Clerk Pages
import UploadInvoices from "./pages/sales-clerk/UploadInvoices";
import InvoiceList from "./pages/sales-clerk/InvoiceList";

// Collector Pages
import MyCustomers from "./pages/collector/MyCustomers";
import TodaysRoute from "./pages/collector/TodaysRoute";
import MyWallet from "./pages/collector/MyWallet";
import MakeDeposit from "./pages/collector/MakeDeposit";

// Manager Pages
import CustomerManagement from "./pages/manager/CustomerManagement";

// Admin Pages
import UserManagement from "./pages/admin/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Sales Clerk Routes */}
            <Route path="/upload-invoices" element={<UploadInvoices />} />
            <Route path="/invoices" element={<InvoiceList />} />
            
            {/* Collector Routes */}
            <Route path="/my-customers" element={<MyCustomers />} />
            <Route path="/route" element={<TodaysRoute />} />
            <Route path="/wallet" element={<MyWallet />} />
            <Route path="/deposit" element={<MakeDeposit />} />
            
            {/* Manager Routes */}
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/reassign" element={<CustomerManagement />} />

            {/* Placeholder routes for other features */}
            <Route path="/verify-receipts" element={<Dashboard />} />
            <Route path="/outstanding" element={<Dashboard />} />
            <Route path="/export" element={<Dashboard />} />
            <Route path="/targets" element={<Dashboard />} />
            <Route path="/performance" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/products" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
