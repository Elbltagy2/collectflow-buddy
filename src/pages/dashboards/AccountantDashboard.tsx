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
  Users,
  FileCheck,
  Download,
  AlertTriangle
} from 'lucide-react';
import { mockCollectorStats, mockPayments, formatCurrency } from '@/data/mockData';
import { CollectorStats } from '@/types';
import { Link } from 'react-router-dom';

type CollectorWithId = CollectorStats & { id: string };

export default function AccountantDashboard() {
  const totalCollected = mockCollectorStats.reduce((sum, c) => sum + c.totalCollected, 0);
  const totalCash = mockCollectorStats.reduce((sum, c) => sum + c.cashAmount, 0);
  const totalFawry = mockCollectorStats.reduce((sum, c) => sum + c.fawryAmount, 0);
  const pendingReceipts = mockPayments.filter(p => p.status === 'pending' && p.method === 'fawry').length;

  const collectorColumns = [
    { 
      key: 'collectorName' as const, 
      label: 'Collector' 
    },
    { 
      key: 'totalCollected' as const, 
      label: 'Total Collected',
      render: (c: CollectorWithId) => (
        <span className="font-semibold">{formatCurrency(c.totalCollected)}</span>
      )
    },
    { 
      key: 'cashAmount' as const, 
      label: 'Cash',
      render: (c: CollectorWithId) => formatCurrency(c.cashAmount)
    },
    { 
      key: 'fawryAmount' as const, 
      label: 'Fawry',
      render: (c: CollectorWithId) => formatCurrency(c.fawryAmount)
    },
    { 
      key: 'customersVisited' as const, 
      label: 'Progress',
      render: (c: CollectorWithId) => (
        <div className="flex items-center gap-2">
          <Progress value={(c.customersVisited / c.totalCustomers) * 100} className="w-20 h-2" />
          <span className="text-sm text-muted-foreground">{c.customersVisited}/{c.totalCustomers}</span>
        </div>
      )
    },
  ];

  const collectorsWithId: CollectorWithId[] = mockCollectorStats.map(c => ({ ...c, id: c.collectorId }));

  return (
    <MainLayout title="Dashboard" subtitle="Collections Overview">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Collected Today"
            value={formatCurrency(totalCollected)}
            icon={DollarSign}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Cash Collections"
            value={formatCurrency(totalCash)}
            subtitle={`${Math.round((totalCash / totalCollected) * 100)}% of total`}
            icon={Banknote}
            variant="primary"
          />
          <StatCard
            title="Fawry Collections"
            value={formatCurrency(totalFawry)}
            subtitle={`${Math.round((totalFawry / totalCollected) * 100)}% of total`}
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

        {/* Alerts */}
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

        {/* Collection Breakdown Chart */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Collectors Performance</h2>
              <div className="text-sm text-muted-foreground">
                {mockCollectorStats.length} active collectors
              </div>
            </div>
            <DataTable 
              columns={collectorColumns} 
              data={collectorsWithId} 
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Cash</span>
                  <span className="text-sm font-medium">{Math.round((totalCash / totalCollected) * 100)}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(totalCash / totalCollected) * 100}%` }}
                  />
                </div>
                <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(totalCash)}</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Fawry</span>
                  <span className="text-sm font-medium">{Math.round((totalFawry / totalCollected) * 100)}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${(totalFawry / totalCollected) * 100}%` }}
                  />
                </div>
                <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(totalFawry)}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCollected)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/verify-receipts">
            <Button className="gap-2">
              <FileCheck className="h-4 w-4" />
              Verify Receipts
            </Button>
          </Link>
          <Link to="/outstanding">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
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
