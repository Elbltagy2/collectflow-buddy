import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  Calendar,
  Award,
  Target,
  MapPin,
  Filter,
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

interface PerformanceSummary {
  totalCollectors: number;
  totalCollected: number;
  averageVisitRate: number;
}

export default function Performance() {
  const [collectors, setCollectors] = useState<CollectorPerformance[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await reportsApi.getPerformance(params);
      if (response.data) {
        setCollectors(response.data.collectors || []);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    loadData();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    loadData();
  };

  // Calculate top performer
  const topPerformer = collectors.length > 0 ? collectors[0] : null;
  const averageCollection = collectors.length > 0
    ? collectors.reduce((sum, c) => sum + c.totalCollected, 0) / collectors.length
    : 0;

  if (isLoading) {
    return (
      <MainLayout title="Performance" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Collector Performance" subtitle="Compare and analyze collector metrics">
      <div className="space-y-6 animate-fade-in">
        {/* Date Filter */}
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <Label htmlFor="startDate" className="text-xs">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate" className="text-xs">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleFilter} disabled={isLoading}>
              Apply Filter
            </Button>
            {(startDate || endDate) && (
              <Button variant="outline" onClick={handleClearFilter}>
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collectors</p>
                <p className="text-2xl font-bold">{summary?.totalCollectors || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.totalCollected || 0)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Collection</p>
                <p className="text-2xl font-bold">{formatCurrency(averageCollection)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <MapPin className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Visit Rate</p>
                <p className="text-2xl font-bold">{summary?.averageVisitRate || 0}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performer Highlight */}
        {topPerformer && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Award className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">Top Performer</p>
                <p className="text-2xl font-bold">{topPerformer.collectorName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(topPerformer.totalCollected)} collected • {topPerformer.paymentCount} payments • {topPerformer.visitRate}% visit rate
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Performance Table */}
        <Card>
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Detailed Performance</h3>
              <span className="text-sm text-muted-foreground">({collectors.length} collectors)</span>
            </div>
          </div>

          {collectors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No performance data available for this period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead className="text-right">Total Collected</TableHead>
                    <TableHead className="text-center">Payments</TableHead>
                    <TableHead className="text-center">Customers</TableHead>
                    <TableHead className="text-center">Visits</TableHead>
                    <TableHead>Visit Rate</TableHead>
                    <TableHead>vs Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectors.map((collector) => {
                    const vsAverage = averageCollection > 0
                      ? ((collector.totalCollected - averageCollection) / averageCollection) * 100
                      : 0;
                    return (
                      <TableRow key={collector.collectorId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {collector.rank === 1 && <Award className="h-4 w-4 text-yellow-500" />}
                            {collector.rank === 2 && <Award className="h-4 w-4 text-gray-400" />}
                            {collector.rank === 3 && <Award className="h-4 w-4 text-amber-600" />}
                            <span
                              className={`font-bold ${
                                collector.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              #{collector.rank}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{collector.collectorName}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(collector.totalCollected)}
                        </TableCell>
                        <TableCell className="text-center">{collector.paymentCount}</TableCell>
                        <TableCell className="text-center">{collector.customerCount}</TableCell>
                        <TableCell className="text-center">
                          {collector.completedVisits}/{collector.totalVisits}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={collector.visitRate} className="w-16 h-2" />
                            <span
                              className={`text-sm font-medium ${
                                collector.visitRate >= 90
                                  ? 'text-success'
                                  : collector.visitRate >= 70
                                  ? 'text-warning'
                                  : 'text-destructive'
                              }`}
                            >
                              {collector.visitRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              vsAverage >= 0 ? 'text-success' : 'text-destructive'
                            }`}
                          >
                            {vsAverage >= 0 ? '+' : ''}{Math.round(vsAverage)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Performance Breakdown */}
        {collectors.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Collection Distribution */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Collection Distribution</h3>
              <div className="space-y-4">
                {collectors.slice(0, 5).map((collector) => {
                  const percentage = (summary?.totalCollected || 0) > 0
                    ? (collector.totalCollected / (summary?.totalCollected || 1)) * 100
                    : 0;
                  return (
                    <div key={collector.collectorId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{collector.collectorName}</span>
                        <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Visit Rate Comparison */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Visit Rate Comparison</h3>
              <div className="space-y-4">
                {collectors.slice(0, 5).map((collector) => (
                  <div key={collector.collectorId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{collector.collectorName}</span>
                      <span
                        className={`text-sm font-medium ${
                          collector.visitRate >= 90
                            ? 'text-success'
                            : collector.visitRate >= 70
                            ? 'text-warning'
                            : 'text-destructive'
                        }`}
                      >
                        {collector.visitRate}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          collector.visitRate >= 90
                            ? 'bg-success'
                            : collector.visitRate >= 70
                            ? 'bg-warning'
                            : 'bg-destructive'
                        }`}
                        style={{ width: `${collector.visitRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
