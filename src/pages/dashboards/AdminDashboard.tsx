import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  UserPlus,
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import { mockProducts, mockCustomers } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const totalUsers = 20; // 5 roles with some users
  const activeCollectors = 15;

  return (
    <MainLayout title="Dashboard" subtitle="System Administration">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle="Across all roles"
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Active Collectors"
            value={activeCollectors}
            icon={Activity}
            variant="success"
          />
          <StatCard
            title="Total Customers"
            value={mockCustomers.length}
            subtitle="In the system"
            icon={UserPlus}
            variant="accent"
          />
          <StatCard
            title="Products"
            value={mockProducts.length}
            subtitle="Active products"
            icon={Package}
          />
        </div>

        {/* Quick Access Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/users" className="block">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">Add, edit, or remove users and assign roles</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/products" className="block">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Products & Prices</h3>
                  <p className="text-sm text-muted-foreground">Manage product catalog and pricing</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/customers" className="block">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground transition-colors">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Customers</h3>
                  <p className="text-sm text-muted-foreground">Manage customer database and assignments</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/settings" className="block">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">System Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure system preferences</p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-6 border-dashed">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-muted text-muted-foreground">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Security</h3>
                <p className="text-sm text-muted-foreground">Audit logs and access control</p>
                <span className="text-xs badge-primary mt-2 inline-block">Coming Soon</span>
              </div>
            </div>
          </Card>
        </div>

        {/* System Overview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">System Overview</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">User Roles Distribution</p>
              <div className="space-y-2">
                {[
                  { role: 'Admin', count: 2 },
                  { role: 'Sales Manager', count: 2 },
                  { role: 'Accountant', count: 3 },
                  { role: 'Collector', count: 15 },
                  { role: 'Sales Clerk', count: 3 },
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.role}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Customer Distribution</p>
              <p className="text-3xl font-bold text-foreground">2,000</p>
              <p className="text-sm text-muted-foreground">
                ~133 customers per collector
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick Actions</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Export User List
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Backup Database
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
