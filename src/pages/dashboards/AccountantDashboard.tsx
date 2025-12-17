import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  Banknote,
  Smartphone,
  FileCheck,
  Download,
  AlertTriangle,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import { reportsApi, paymentsApi } from '@/lib/api';
import { Link } from 'react-router-dom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

interface CollectorStats {
  collectorId: string;
  collectorName: string;
  totalCollected: number;
  cashAmount: number;
  fawryAmount: number;
  paymentCount: number;
}

interface DashboardStats {
  todayCollected: number;
  todayPayments: number;
  totalOutstanding: number;
  pendingVerifications: number;
  activeCollectors: number;
  totalCustomers: number;
}

interface CollectionsData {
  summary: {
    totalCollected: number;
    totalCash: number;
    totalFawry: number;
    totalPayments: number;
  };
  byCollector: CollectorStats[];
}

export default function AccountantDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [collectionsData, setCollectionsData] = useState<CollectionsData | null>(null);
  const [pendingReceipts, setPendingReceipts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardRes, collectionsRes, pendingRes] = await Promise.all([
        reportsApi.getDashboard(),
        reportsApi.getCollections(),
        paymentsApi.getPendingVerification(),
      ]);

      if (dashboardRes.data) {
        setDashboardStats(dashboardRes.data);
      }
      if (collectionsRes.data) {
        setCollectionsData(collectionsRes.data);
      }
      if (pendingRes.data) {
        setPendingReceipts(pendingRes.data.length);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const totalCollected = collectionsData?.summary.totalCollected || 0;
  const totalCash = collectionsData?.summary.totalCash || 0;
  const totalFawry = collectionsData?.summary.totalFawry || 0;
  const collectors = collectionsData?.byCollector || [];

  const cashPercentage = totalCollected > 0 ? Math.round((totalCash / totalCollected) * 100) : 0;
  const fawryPercentage = totalCollected > 0 ? Math.round((totalFawry / totalCollected) * 100) : 0;

  const collectorColumns = [
    {
      key: 'collectorName' as const,
      label: 'Collector'
    },
    {
      key: 'totalCollected' as const,
      label: 'Total Collected',
      render: (c: CollectorStats) => (
        <span className="font-semibold">{formatCurrency(c.totalCollected)}</span>
      )
    },
    {
      key: 'cashAmount' as const,
      label: 'Cash',
      render: (c: CollectorStats) => formatCurrency(c.cashAmount)
    },
    {
      key: 'fawryAmount' as const,
      label: 'Fawry',
      render: (c: CollectorStats) => formatCurrency(c.fawryAmount)
    },
    {
      key: 'paymentCount' as const,
      label: 'Payments',
      render: (c: CollectorStats) => (
        <span className="text-muted-foreground">{c.paymentCount}</span>
      )
    },
  ];

  const collectorsWithId = collectors.map(c => ({ ...c, id: c.collectorId }));

  return (
    <MainLayout title="Dashboard" subtitle="Collections Overview">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Collections"
            value={formatCurrency(dashboardStats?.todayCollected || 0)}
            subtitle={`${dashboardStats?.todayPayments || 0} payments`}
            icon={DollarSign}
            variant="success"
          />
          <StatCard
            title="Cash Collections"
            value={formatCurrency(totalCash)}
            subtitle={totalCollected > 0 ? `${cashPercentage}% of total` : 'No collections'}
            icon={Banknote}
            variant="primary"
          />
          <StatCard
            title="Fawry Collections"
            value={formatCurrency(totalFawry)}
            subtitle={totalCollected > 0 ? `${fawryPercentage}% of total` : 'No collections'}
            icon={Smartphone}
            variant="accent"
          />
          <StatCard
            title="Pending Verification"
            value={pendingReceipts}
            subtitle="Fawry receipts"
            icon={FileCheck}
            variant={pendingReceipts > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Outstanding Alert */}
        {dashboardStats && dashboardStats.totalOutstanding > 0 && (
          <Card className="p-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {formatCurrency(dashboardStats.totalOutstanding)} total outstanding
                </p>
                <p className="text-sm text-muted-foreground">
                  Review outstanding balances and follow up on overdue invoices
                </p>
              </div>
              <Link to="/outstanding">
                <Button variant="outline" size="sm">View Report</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Pending Receipts Alert */}
        {pendingReceipts > 0 && (
          <Card className="p-4 border-warning/30 bg-warning/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {pendingReceipts} Fawry receipt{pendingReceipts > 1 ? 's' : ''} pending verification
                </p>
                <p className="text-sm text-muted-foreground">Review and verify uploaded receipts</p>
              </div>
              <Link to="/verify-receipts">
                <Button variant="outline" size="sm">Review Now</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Collection Breakdown */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Collectors Performance</h2>
              <div className="text-sm text-muted-foreground">
                {collectors.length} collectors with activity
              </div>
            </div>
            {collectors.length > 0 ? (
              <DataTable
                columns={collectorColumns}
                data={collectorsWithId}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No collection data available
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h2>
            {totalCollected > 0 ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Cash</span>
                    <span className="text-sm font-medium">{cashPercentage}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${cashPercentage}%` }}
                    />
                  </div>
                  <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(totalCash)}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Fawry</span>
                    <span className="text-sm font-medium">{fawryPercentage}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${fawryPercentage}%` }}
                    />
                  </div>
                  <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(totalFawry)}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCollected)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No collections yet
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/verify-receipts">
            <Button className="gap-2">
              <FileCheck className="h-4 w-4" />
              Verify Receipts
              {pendingReceipts > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {pendingReceipts}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/outstanding">
            <Button variant="outline" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Outstanding Balances
            </Button>
          </Link>
          <Link to="/export">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Reports
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
