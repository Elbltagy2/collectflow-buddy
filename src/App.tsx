import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

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
import DepositApproval from "./pages/admin/DepositApproval";

// Accountant Pages
import VerifyReceipts from "./pages/accountant/VerifyReceipts";
import OutstandingReport from "./pages/accountant/OutstandingReport";
import ExportReports from "./pages/accountant/ExportReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Index />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Sales Clerk Routes */}
            <Route path="/upload-invoices" element={<ProtectedRoute><UploadInvoices /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />

            {/* Collector Routes */}
            <Route path="/my-customers" element={<ProtectedRoute><MyCustomers /></ProtectedRoute>} />
            <Route path="/route" element={<ProtectedRoute><TodaysRoute /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><MyWallet /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><MakeDeposit /></ProtectedRoute>} />

            {/* Manager Routes */}
            <Route path="/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
            <Route path="/reassign" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/deposit-approval" element={<ProtectedRoute><DepositApproval /></ProtectedRoute>} />

            {/* Placeholder routes for other features */}
            <Route path="/verify-receipts" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/outstanding" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/targets" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
