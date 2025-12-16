import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import SalesClerkDashboard from './dashboards/SalesClerkDashboard';
import CollectorDashboard from './dashboards/CollectorDashboard';
import AccountantDashboard from './dashboards/AccountantDashboard';
import SalesManagerDashboard from './dashboards/SalesManagerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  switch (user?.role) {
    case 'sales_clerk':
      return <SalesClerkDashboard />;
    case 'collector':
      return <CollectorDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    case 'sales_manager':
      return <SalesManagerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
}
