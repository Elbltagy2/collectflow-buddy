import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Upload,
  Search,
  Users,
  Route,
  Wallet,
  Receipt,
  PiggyBank,
  BarChart3,
  FileSpreadsheet,
  Target,
  Settings,
  Package,
  UserPlus,
  LogOut,
  FileText,
  CheckSquare,
  X,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const roleNavItems = {
  sales_clerk: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload Invoices', path: '/upload-invoices' },
    { icon: Search, label: 'Search Invoices', path: '/invoices' },
  ],
  collector: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'My Customers', path: '/my-customers' },
    { icon: Route, label: "Today's Route", path: '/route' },
    { icon: Wallet, label: 'My Wallet', path: '/wallet' },
    { icon: PiggyBank, label: 'Make Deposit', path: '/deposit' },
  ],
  accountant: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Receipt, label: 'Verify Receipts', path: '/verify-receipts' },
    { icon: FileText, label: 'Outstanding Report', path: '/outstanding' },
    { icon: FileSpreadsheet, label: 'Export Reports', path: '/export' },
  ],
  sales_manager: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Target, label: 'Monthly Targets', path: '/targets' },
    { icon: BarChart3, label: 'Performance', path: '/performance' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Manage Users', path: '/users' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Upload, label: 'Upload Invoices', path: '/upload-invoices' },
    { icon: Search, label: 'Search Invoices', path: '/invoices' },
    { icon: CheckSquare, label: 'Deposit Approval', path: '/deposit-approval' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ],
};

const roleLabels = {
  sales_clerk: 'Sales Clerk',
  collector: 'Collector',
  accountant: 'Accountant',
  sales_manager: 'Sales Manager',
  admin: 'Administrator',
};

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = roleNavItems[user.role];

  return (
    <aside className="h-screen w-64 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Receipt className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-sidebar-foreground">InvoiceTrack</h1>
              <p className="text-xs text-sidebar-foreground/60">Collection System</p>
            </div>
          </div>
          {/* Close button - mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[user.role]}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      'nav-link',
                      isActive && 'nav-link-active'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={logout}
            className="nav-link w-full text-sidebar-foreground/70 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
