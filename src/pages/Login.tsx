import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types';

const demoAccounts = [
  { role: 'sales_clerk' as UserRole, email: 'clerk@demo.com', label: 'Sales Clerk' },
  { role: 'collector' as UserRole, email: 'collector@demo.com', label: 'Collector' },
  { role: 'accountant' as UserRole, email: 'accountant@demo.com', label: 'Accountant' },
  { role: 'sales_manager' as UserRole, email: 'manager@demo.com', label: 'Sales Manager' },
  { role: 'admin' as UserRole, email: 'admin@demo.com', label: 'Administrator' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-primary">
              <Receipt className="h-7 w-7 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sidebar-foreground">InvoiceTrack</h1>
              <p className="text-sm text-sidebar-foreground/70">Collection Management System</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-sidebar-foreground mb-4">
            Streamline Your<br />Collections
          </h2>
          <p className="text-lg text-sidebar-foreground/70 max-w-md">
            Manage invoices, track collections, and monitor your team's performance all in one powerful platform.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-sidebar-accent/50 backdrop-blur">
              <p className="text-3xl font-bold text-sidebar-foreground">2,000+</p>
              <p className="text-sm text-sidebar-foreground/70">Active Customers</p>
            </div>
            <div className="p-4 rounded-xl bg-sidebar-accent/50 backdrop-blur">
              <p className="text-3xl font-bold text-sidebar-foreground">15</p>
              <p className="text-sm text-sidebar-foreground/70">Collectors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Receipt className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">InvoiceTrack</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 btn-gradient-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-3">Quick login as:</p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  onClick={() => handleQuickLogin(account.email)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Password: <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">demo123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
