import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { 
  Wallet, 
  Banknote, 
  Smartphone,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { mockPayments, mockCollectorStats, formatCurrency, formatDate } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function MyWallet() {
  const stats = mockCollectorStats[0];
  const myPayments = mockPayments.filter(p => p.collectorId === '2' && p.status === 'pending');
  const cashPending = myPayments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
  const fawryPending = myPayments.filter(p => p.method === 'fawry').reduce((sum, p) => sum + p.amount, 0);

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (p: typeof mockPayments[0]) => formatDate(p.createdAt)
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (p: typeof mockPayments[0]) => (
        <span className="font-semibold">{formatCurrency(p.amount)}</span>
      )
    },
    {
      key: 'method',
      label: 'Method',
      render: (p: typeof mockPayments[0]) => (
        <span className={p.method === 'cash' ? 'badge-primary' : 'badge-success'}>
          {p.method === 'cash' ? 'Cash' : 'Fawry'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (p: typeof mockPayments[0]) => (
        <span className="badge-warning">Pending Deposit</span>
      )
    },
  ];

  return (
    <MainLayout title="My Wallet" subtitle="Track your collections">
      <div className="space-y-6 animate-fade-in">
        {/* Wallet Balance Card */}
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-80">Wallet Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.walletBalance)}</p>
            </div>
          </div>
          <p className="text-sm opacity-80 mb-4">
            Money collected but not yet deposited
          </p>
          <Link to="/deposit">
            <Button variant="secondary" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Make Deposit
            </Button>
          </Link>
        </Card>

        {/* Breakdown */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Cash in Hand</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(cashPending)}</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Smartphone className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Fawry Pending</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(fawryPending)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Total Today</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCollected)}</p>
          </Card>
        </div>

        {/* Pending Deposits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Pending Deposits</h2>
            <Link to="/deposit">
              <Button size="sm">Deposit Now</Button>
            </Link>
          </div>
          <DataTable 
            columns={columns} 
            data={myPayments}
            emptyMessage="No pending deposits"
          />
        </div>

        {/* Daily Summary */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Today's Summary</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Collected</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalCollected)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cash Collections</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.cashAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fawry Collections</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.fawryAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customers Visited</p>
              <p className="text-xl font-bold text-foreground">{stats.customersVisited}/{stats.totalCustomers}</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
