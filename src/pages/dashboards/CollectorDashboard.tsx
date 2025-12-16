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
  Circle
} from 'lucide-react';
import { mockDailyRoute, mockCollectorStats, formatCurrency } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function CollectorDashboard() {
  const stats = mockCollectorStats[0]; // Current collector's stats
  const visitedCount = mockDailyRoute.filter(r => r.visited).length;
  const progress = (visitedCount / mockDailyRoute.length) * 100;

  return (
    <MainLayout title="Dashboard" subtitle="Today's Overview">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Collected Today"
            value={formatCurrency(stats.totalCollected)}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Wallet Balance"
            value={formatCurrency(stats.walletBalance)}
            subtitle="Cash in hand"
            icon={Wallet}
            variant="warning"
          />
          <StatCard
            title="Customers Visited"
            value={`${stats.customersVisited}/${stats.totalCustomers}`}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Route Progress"
            value={`${visitedCount}/${mockDailyRoute.length}`}
            subtitle="Today's route"
            icon={Route}
            variant="accent"
          />
        </div>

        {/* Route Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Today's Route</h2>
              <p className="text-sm text-muted-foreground">{visitedCount} of {mockDailyRoute.length} customers visited</p>
            </div>
            <Link to="/route">
              <Button variant="outline" size="sm" className="gap-2">
                View Full Route
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Progress value={progress} className="h-2 mb-6" />
          
          {/* Next customers to visit */}
          <div className="space-y-3">
            {mockDailyRoute.slice(0, 4).map((customer, index) => (
              <div
                key={customer.customerId}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  customer.visited 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  customer.visited ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {customer.visited ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{customer.customerName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(customer.outstandingAmount)}</p>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </div>
                {!customer.visited && (
                  <Button size="sm" variant="ghost" className="hidden sm:flex">
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Link to="/my-customers" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">My Customers</h3>
              <p className="text-sm text-muted-foreground">View all 120 assigned customers</p>
            </Card>
          </Link>
          <Link to="/route" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <Route className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-foreground">Today's Route</h3>
              <p className="text-sm text-muted-foreground">40 customers to visit</p>
            </Card>
          </Link>
          <Link to="/wallet" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <Wallet className="h-8 w-8 text-warning mb-3" />
              <h3 className="font-semibold text-foreground">My Wallet</h3>
              <p className="text-sm text-muted-foreground">{formatCurrency(stats.walletBalance)} balance</p>
            </Card>
          </Link>
          <Link to="/deposit" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <TrendingUp className="h-8 w-8 text-success mb-3" />
              <h3 className="font-semibold text-foreground">Make Deposit</h3>
              <p className="text-sm text-muted-foreground">Deposit cash or Fawry</p>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
