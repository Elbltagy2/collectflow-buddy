import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Receipt, Clock, CheckCircle, Upload, Search } from 'lucide-react';
import { mockInvoices, formatCurrency, formatDate } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function SalesClerkDashboard() {
  const todayInvoices = mockInvoices.filter(inv => inv.createdAt === '2024-01-14');
  const totalToday = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingCount = mockInvoices.filter(inv => inv.status !== 'paid').length;

  const columns = [
    { key: 'id', label: 'Invoice #' },
    { key: 'customerName', label: 'Customer' },
    { 
      key: 'totalAmount', 
      label: 'Amount',
      render: (inv: typeof mockInvoices[0]) => (
        <span className="font-medium">{formatCurrency(inv.totalAmount)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (inv: typeof mockInvoices[0]) => (
        <span className={
          inv.status === 'paid' ? 'badge-success' :
          inv.status === 'partial' ? 'badge-warning' : 'badge-destructive'
        }>
          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (inv: typeof mockInvoices[0]) => formatDate(inv.createdAt)
    },
  ];

  return (
    <MainLayout title="Dashboard" subtitle="Sales Clerk Overview">
      <div className="space-y-6 animate-fade-in">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/upload-invoices">
            <Button className="btn-gradient-primary gap-2">
              <Upload className="h-4 w-4" />
              Upload Invoices
            </Button>
          </Link>
          <Link to="/invoices">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Search Invoices
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Invoices"
            value={todayInvoices.length}
            subtitle="Created today"
            icon={FileSpreadsheet}
            variant="primary"
          />
          <StatCard
            title="Today's Sales"
            value={formatCurrency(totalToday)}
            icon={Receipt}
            variant="success"
          />
          <StatCard
            title="Pending Invoices"
            value={pendingCount}
            subtitle="Awaiting payment"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Total Invoices"
            value={mockInvoices.length}
            subtitle="All time"
            icon={CheckCircle}
          />
        </div>

        {/* Recent Invoices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Invoices</h2>
            <Link to="/invoices">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <DataTable columns={columns} data={mockInvoices.slice(0, 5)} />
        </div>
      </div>
    </MainLayout>
  );
}
