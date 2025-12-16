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
  ArrowLeftRight
} from 'lucide-react';
import { mockCollectorStats, mockInvoices, formatCurrency } from '@/data/mockData';
import { CollectorStats } from '@/types';
import { Link } from 'react-router-dom';

type CollectorWithId = CollectorStats & { id: string; rank: number };

export default function SalesManagerDashboard() {
  const totalSales = mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = mockCollectorStats.reduce((sum, c) => sum + c.totalCollected, 0);
  const monthlyTarget = 500000;
  const targetProgress = (totalSales / monthlyTarget) * 100;
  const inactiveCustomers = 342; // Customers who haven't purchased this month

  const performanceColumns = [
    { 
      key: 'rank' as const,
      label: '#',
      render: (c: CollectorWithId) => (
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
      render: (c: CollectorWithId) => (
        <span className="font-semibold">{formatCurrency(c.totalCollected)}</span>
      )
    },
    { 
      key: 'customersVisited' as const, 
      label: 'Visits',
      render: (c: CollectorWithId) => `${c.customersVisited}/${c.totalCustomers}`
    },
    { 
      key: 'id' as const, 
      label: 'Efficiency',
      render: (c: CollectorWithId) => {
        const efficiency = Math.round((c.customersVisited / c.totalCustomers) * 100);
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

  const sortedCollectors: CollectorWithId[] = [...mockCollectorStats]
    .sort((a, b) => b.totalCollected - a.totalCollected)
    .map((c, i) => ({ ...c, id: c.collectorId, rank: i + 1 }));

  return (
    <MainLayout title="Dashboard" subtitle="Sales Overview">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Sales"
            value={formatCurrency(totalSales)}
            icon={DollarSign}
            variant="success"
            trend={{ value: 8, isPositive: true }}
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
            subtitle={`${formatCurrency(totalSales)} of ${formatCurrency(monthlyTarget)}`}
            icon={Target}
            variant={targetProgress >= 80 ? 'success' : targetProgress >= 50 ? 'warning' : 'default'}
          />
          <StatCard
            title="Inactive Customers"
            value={inactiveCustomers}
            subtitle="No purchase this month"
            icon={Users}
            variant="warning"
          />
        </div>

        {/* Monthly Target Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Monthly Target Progress</h2>
              <p className="text-sm text-muted-foreground">January 2024</p>
            </div>
            <Link to="/targets">
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{formatCurrency(totalSales)} / {formatCurrency(monthlyTarget)}</span>
            </div>
            <Progress value={targetProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className={targetProgress >= 80 ? 'text-success' : 'text-warning'}>
                {Math.round(targetProgress)}% achieved
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(monthlyTarget - totalSales)} remaining
              </span>
            </div>
          </div>
        </Card>

        {/* Alerts and Performance */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Inactive Customers Alert */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Inactive Customers</h3>
                <p className="text-sm text-muted-foreground">Customers who haven't purchased this month</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-warning mb-2">{inactiveCustomers}</p>
            <p className="text-sm text-muted-foreground mb-4">out of 2,000 total customers</p>
            <Link to="/targets">
              <Button variant="outline" className="w-full gap-2">
                <Target className="h-4 w-4" />
                View Target Tracker
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
            <DataTable 
              columns={performanceColumns} 
              data={sortedCollectors} 
            />
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
          <Link to="/reassign">
            <Button variant="outline" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Reassign Customers
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
