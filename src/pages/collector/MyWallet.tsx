import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  Wallet,
  Banknote,
  Smartphone,
  ArrowUpRight,
  Loader2,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { collectorApi, paymentsApi, depositsApi } from '@/lib/api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CollectorStats, Payment } from '@/types';

interface WalletDetails {
  totalCollected: number;
  verifiedDeposits: number;
  pendingDeposits: number;
  availableForDeposit: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function MyWallet() {
  const [stats, setStats] = useState<CollectorStats | null>(null);
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, walletDetailsResponse, paymentsResponse] = await Promise.all([
        collectorApi.getStats(),
        depositsApi.getWalletDetails(),
        paymentsApi.getAll({ status: 'PENDING' }),
      ]);

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      if (walletDetailsResponse.data) {
        setWalletDetails(walletDetailsResponse.data);
      }
      if (paymentsResponse.data) {
        setPayments(paymentsResponse.data.map((p: Record<string, unknown>) => ({
          ...p,
          method: (p.method as string).toLowerCase(),
        })) as Payment[]);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const cashPending = payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
  const fawryPending = payments.filter(p => p.method === 'fawry').reduce((sum, p) => sum + p.amount, 0);

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (p: Payment) => formatDate(p.createdAt)
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (p: Payment) => (
        <span className="font-semibold">{formatCurrency(p.amount)}</span>
      )
    },
    {
      key: 'method',
      label: 'Method',
      render: (p: Payment) => (
        <span className={p.method === 'cash' ? 'badge-primary' : 'badge-success'}>
          {p.method === 'cash' ? 'Cash' : 'Fawry'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <span className="badge-warning">Pending Deposit</span>
      )
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="My Wallet" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Wallet" subtitle="Track your collections">
      <div className="space-y-6 animate-fade-in">
        {/* Wallet Balance Card */}
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-80">Available for Deposit</p>
              <p className="text-3xl font-bold">{formatCurrency(walletDetails?.availableForDeposit || 0)}</p>
            </div>
          </div>
          <p className="text-sm opacity-80 mb-4">
            Money you can deposit to admin now
          </p>
          <Link to="/deposit">
            <Button variant="secondary" className="gap-2" disabled={(walletDetails?.availableForDeposit || 0) <= 0}>
              <ArrowUpRight className="h-4 w-4" />
              Make Deposit
            </Button>
          </Link>
        </Card>

        {/* Wallet Breakdown */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Collected</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(walletDetails?.totalCollected || 0)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Deposited (Approved)</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(walletDetails?.verifiedDeposits || 0)}</p>
          </Card>

          <Card className="p-6 border-warning/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Pending Approval</span>
            </div>
            <p className="text-2xl font-bold text-warning">{formatCurrency(walletDetails?.pendingDeposits || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Waiting for admin</p>
          </Card>

          <Card className="p-6 border-primary/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(walletDetails?.availableForDeposit || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Can deposit now</p>
          </Card>
        </div>

        {/* Payment Method Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
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
            data={payments}
            emptyMessage="No pending deposits"
          />
        </div>

        {/* Daily Summary */}
        {stats && (
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
        )}
      </div>
    </MainLayout>
  );
}
