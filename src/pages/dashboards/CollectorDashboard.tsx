import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Route,
  Wallet,
  TrendingUp,
  MapPin,
  Phone,
  ChevronRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { collectorApi } from '@/lib/api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CollectorStats, DailyRoute } from '@/types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

export default function CollectorDashboard() {
  const [stats, setStats] = useState<CollectorStats | null>(null);
  const [route, setRoute] = useState<DailyRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, routeResponse] = await Promise.all([
        collectorApi.getStats(),
        collectorApi.getRoute(),
      ]);

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      if (routeResponse.data) {
        setRoute(routeResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const visitedCount = route.filter(r => r.visited).length;
  const progress = route.length > 0 ? (visitedCount / route.length) * 100 : 0;

  if (isLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" subtitle="Today's Overview">
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Collected Today"
            value={formatCurrency(stats?.totalCollected || 0)}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Wallet Balance"
            value={formatCurrency(stats?.walletBalance || 0)}
            subtitle="Cash in hand"
            icon={Wallet}
            variant="warning"
          />
          <StatCard
            title="Customers Visited"
            value={`${stats?.customersVisited || 0}/${stats?.totalCustomers || 0}`}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Route Progress"
            value={`${visitedCount}/${route.length}`}
            subtitle="Today's route"
            icon={Route}
            variant="accent"
          />
        </div>

        {/* Route Progress */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Today's Route</h2>
              <p className="text-sm text-muted-foreground">{visitedCount} of {route.length} customers visited</p>
            </div>
            <Link to="/route">
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                View Full Route
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Progress value={progress} className="h-2 mb-6" />

          {/* Next customers to visit */}
          {route.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No customers assigned to your route today.</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {route.slice(0, 4).map((customer, index) => (
                <div
                  key={customer.customerId}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-colors ${
                    customer.visited
                      ? 'bg-success/5 border-success/20'
                      : 'bg-card border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      customer.visited ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {customer.visited ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 sm:hidden">
                      <p className="font-medium text-foreground truncate">{customer.customerName}</p>
                      <p className="text-sm font-semibold text-primary">{formatCurrency(customer.outstandingAmount)}</p>
                    </div>
                    {!customer.visited && (
                      <a href={`tel:${customer.phone}`} className="sm:hidden">
                        <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                  <div className="hidden sm:block flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{customer.customerName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:block sm:text-right">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="font-semibold text-foreground">{formatCurrency(customer.outstandingAmount)}</p>
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                    </div>
                  </div>
                  {!customer.visited && (
                    <a href={`tel:${customer.phone}`} className="hidden sm:block">
                      <Button size="sm" variant="ghost">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Link to="/my-customers" className="block">
            <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">My Customers</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">View all assigned customers</p>
            </Card>
          </Link>
          <Link to="/route" className="block">
            <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <Route className="h-6 w-6 sm:h-8 sm:w-8 text-accent mb-2 sm:mb-3" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Today's Route</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{route.length} customers</p>
            </Card>
          </Link>
          <Link to="/wallet" className="block">
            <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-warning mb-2 sm:mb-3" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">My Wallet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{formatCurrency(stats?.walletBalance || 0)}</p>
            </Card>
          </Link>
          <Link to="/deposit" className="block">
            <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-success mb-2 sm:mb-3" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Make Deposit</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Deposit cash or Fawry</p>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
