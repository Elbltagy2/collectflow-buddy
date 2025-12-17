import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  BarChart3,
  AlertCircle,
  ArrowLeftRight,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { Link } from 'react-router-dom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

interface CollectorPerformance {
  collectorId: string;
  collectorName: string;
  totalCollected: number;
  paymentCount: number;
  customerCount: number;
  totalVisits: number;
  completedVisits: number;
  visitRate: number;
  rank: number;
}

interface DashboardStats {
  todayCollected: number;
  todayPayments: number;
  totalOutstanding: number;
  pendingVerifications: number;
  activeCollectors: number;
  totalCustomers: number;
}

interface OutstandingSummary {
  totalOutstanding: number;
  overdueAmount: number;
  totalInvoices: number;
  overdueInvoices: number;
}

export default function SalesManagerDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [performanceData, setPerformanceData] = useState<CollectorPerformance[]>([]);
  const [outstandingSummary, setOutstandingSummary] = useState<OutstandingSummary | null>(null);
  const [totalCollected, setTotalCollected] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Monthly target - this could come from settings/database later
  const monthlyTarget = 500000;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardRes, performanceRes, outstandingRes, collectionsRes] = await Promise.all([
        reportsApi.getDashboard(),
        reportsApi.getPerformance(),
        reportsApi.getOutstanding(),
        reportsApi.getCollections(),
      ]);

      if (dashboardRes.data) {
        setDashboardStats(dashboardRes.data);
      }
      if (performanceRes.data) {
        setPerformanceData(performanceRes.data.collectors || []);
      }
      if (outstandingRes.data) {
        setOutstandingSummary(outstandingRes.data.summary);
      }
      if (collectionsRes.data) {
        setTotalCollected(collectionsRes.data.summary.totalCollected || 0);
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

  const targetProgress = monthlyTarget > 0 ? (totalCollected / monthlyTarget) * 100 : 0;

  const performanceColumns = [
    {
      key: 'rank' as const,
      label: '#',
      render: (c: CollectorPerformance) => (
        <span className={`font-bold ${c.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          {c.rank}
        </span>
      )
    },
    {
      key: 'collectorName' as const,
      label: 'Collector'
    },
    {
      key: 'totalCollected' as const,
      label: 'Collected',
      render: (c: CollectorPerformance) => (
        <span className="font-semibold">{formatCurrency(c.totalCollected)}</span>
      )
    },
    {
      key: 'completedVisits' as const,
      label: 'Visits',
      render: (c: CollectorPerformance) => `${c.completedVisits}/${c.totalVisits || c.customerCount}`
    },
    {
      key: 'visitRate' as const,
      label: 'Efficiency',
      render: (c: CollectorPerformance) => {
        const efficiency = c.visitRate;
        return (
          <span className={
            efficiency >= 90 ? 'badge-success' :
            efficiency >= 70 ? 'badge-warning' : 'badge-destructive'
          }>
            {efficiency}%
          </span>
        );
      }
    },
  ];

  const collectorsWithId = performanceData.map(c => ({ ...c, id: c.collectorId }));

  return (
    <MainLayout title="Dashboard" subtitle="Sales Overview">
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
            title="Total Collections"
            value={formatCurrency(totalCollected)}
            icon={TrendingUp}
            variant="primary"
          />
          <StatCard
            title="Monthly Target"
            value={`${Math.round(targetProgress)}%`}
            subtitle={`${formatCurrency(totalCollected)} of ${formatCurrency(monthlyTarget)}`}
            icon={Target}
            variant={targetProgress >= 80 ? 'success' : targetProgress >= 50 ? 'warning' : 'default'}
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(outstandingSummary?.totalOutstanding || 0)}
            subtitle={`${outstandingSummary?.overdueInvoices || 0} overdue invoices`}
            icon={TrendingDown}
            variant="warning"
          />
        </div>

        {/* Monthly Target Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Monthly Target Progress</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link to="/targets">
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{formatCurrency(totalCollected)} / {formatCurrency(monthlyTarget)}</span>
            </div>
            <Progress value={Math.min(targetProgress, 100)} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className={targetProgress >= 80 ? 'text-success' : 'text-warning'}>
                {Math.round(targetProgress)}% achieved
              </span>
              <span className="text-muted-foreground">
                {targetProgress < 100 ? `${formatCurrency(monthlyTarget - totalCollected)} remaining` : 'Target achieved!'}
              </span>
            </div>
          </div>
        </Card>

        {/* Alerts and Performance */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Outstanding Alert */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Outstanding Balance</h3>
                <p className="text-sm text-muted-foreground">Total unpaid invoices</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-warning mb-2">
              {formatCurrency(outstandingSummary?.totalOutstanding || 0)}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {outstandingSummary?.totalInvoices || 0} unpaid invoices ({outstandingSummary?.overdueInvoices || 0} overdue)
            </p>
            <Link to="/customers">
              <Button variant="outline" className="w-full gap-2">
                <Users className="h-4 w-4" />
                View Customers
              </Button>
            </Link>
          </Card>

          {/* Top Performers */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Collector Performance</h2>
              <Link to="/performance">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            {performanceData.length > 0 ? (
              <DataTable
                columns={performanceColumns}
                data={collectorsWithId}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No performance data available
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/targets">
            <Button className="gap-2">
              <Target className="h-4 w-4" />
              Monthly Targets
            </Button>
          </Link>
          <Link to="/performance">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Compare Performance
            </Button>
          </Link>
          <Link to="/customers">
            <Button variant="outline" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Manage Customers
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
