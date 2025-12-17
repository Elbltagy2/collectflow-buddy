import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy loaded pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Sales Clerk Pages
const UploadInvoices = lazy(() => import("./pages/sales-clerk/UploadInvoices"));
const InvoiceList = lazy(() => import("./pages/sales-clerk/InvoiceList"));

// Collector Pages
const MyCustomers = lazy(() => import("./pages/collector/MyCustomers"));
const TodaysRoute = lazy(() => import("./pages/collector/TodaysRoute"));
const MyWallet = lazy(() => import("./pages/collector/MyWallet"));
const MakeDeposit = lazy(() => import("./pages/collector/MakeDeposit"));

// Manager Pages
const CustomerManagement = lazy(() => import("./pages/manager/CustomerManagement"));
const MonthlyTargets = lazy(() => import("./pages/manager/MonthlyTargets"));
const Performance = lazy(() => import("./pages/manager/Performance"));

// Admin Pages
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const DepositApproval = lazy(() => import("./pages/admin/DepositApproval"));

// Accountant Pages
const VerifyReceipts = lazy(() => import("./pages/accountant/VerifyReceipts"));
const OutstandingReport = lazy(() => import("./pages/accountant/OutstandingReport"));
const ExportReports = lazy(() => import("./pages/accountant/ExportReports"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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

            {/* Accountant Routes */}
            <Route path="/verify-receipts" element={<ProtectedRoute><VerifyReceipts /></ProtectedRoute>} />
            <Route path="/outstanding" element={<ProtectedRoute><OutstandingReport /></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><ExportReports /></ProtectedRoute>} />

            {/* Sales Manager Routes */}
            <Route path="/targets" element={<ProtectedRoute><MonthlyTargets /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />

            {/* Placeholder routes for other features */}
            <Route path="/products" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
