import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Loader2,
  Calendar,
  Award,
} from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { toast } from 'sonner';

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

interface CollectionsSummary {
  totalCollected: number;
  totalCash: number;
  totalFawry: number;
  totalPayments: number;
}

export default function MonthlyTargets() {
  const [collectors, setCollectors] = useState<CollectorPerformance[]>([]);
  const [collectionsSummary, setCollectionsSummary] = useState<CollectionsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Monthly target - this could come from settings/database later
  const monthlyTarget = 500000;
  const collectorTarget = monthlyTarget / Math.max(collectors.length, 1);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Parse month for date range
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      const [performanceRes, collectionsRes] = await Promise.all([
        reportsApi.getPerformance({ startDate, endDate }),
        reportsApi.getCollections({ startDate, endDate }),
      ]);

      if (performanceRes.data) {
        setCollectors(performanceRes.data.collectors || []);
      }
      if (collectionsRes.data) {
        setCollectionsSummary(collectionsRes.data.summary);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load target data');
    } finally {
      setIsLoading(false);
    }
  };

  const totalCollected = collectionsSummary?.totalCollected || 0;
  const targetProgress = monthlyTarget > 0 ? (totalCollected / monthlyTarget) * 100 : 0;
  const remaining = Math.max(0, monthlyTarget - totalCollected);

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });

  if (isLoading) {
    return (
      <MainLayout title="Monthly Targets" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Monthly Targets" subtitle="Track collection targets and progress">
      <div className="space-y-6 animate-fade-in">
        {/* Month Selector */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 max-w-xs">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Target</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyTarget)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <TrendingDown className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">{formatCurrency(remaining)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Collectors</p>
                <p className="text-2xl font-bold">{collectors.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target Progress</span>
              <span className="font-medium">
                {formatCurrency(totalCollected)} / {formatCurrency(monthlyTarget)}
              </span>
            </div>
            <Progress value={Math.min(targetProgress, 100)} className="h-4" />
            <div className="flex items-center justify-between">
              <span
                className={`text-lg font-bold ${
                  targetProgress >= 100
                    ? 'text-success'
                    : targetProgress >= 80
                    ? 'text-primary'
                    : targetProgress >= 50
                    ? 'text-warning'
                    : 'text-destructive'
                }`}
              >
                {Math.round(targetProgress)}% achieved
              </span>
              {targetProgress >= 100 && (
                <div className="flex items-center gap-2 text-success">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Target Achieved!</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Collector Targets Table */}
        <Card>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Collector Performance vs Target</h3>
              <span className="text-sm text-muted-foreground">
                Target per collector: {formatCurrency(collectorTarget)}
              </span>
            </div>
          </div>

          {collectors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No collector data available for this period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-center">Payments</TableHead>
                    <TableHead className="text-center">Customers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectors.map((collector) => {
                    const progress = collectorTarget > 0
                      ? (collector.totalCollected / collectorTarget) * 100
                      : 0;
                    return (
                      <TableRow key={collector.collectorId}>
                        <TableCell>
                          <span
                            className={`font-bold ${
                              collector.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            #{collector.rank}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{collector.collectorName}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(collector.totalCollected)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(collectorTarget)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(progress, 100)} className="w-20 h-2" />
                            <span
                              className={`text-sm font-medium ${
                                progress >= 100
                                  ? 'text-success'
                                  : progress >= 80
                                  ? 'text-primary'
                                  : progress >= 50
                                  ? 'text-warning'
                                  : 'text-destructive'
                              }`}
                            >
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{collector.paymentCount}</TableCell>
                        <TableCell className="text-center">{collector.customerCount}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
