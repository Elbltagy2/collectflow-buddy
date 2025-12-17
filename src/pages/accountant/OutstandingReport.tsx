import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Loader2,
  DollarSign,
  AlertTriangle,
  FileText,
  Users,
  TrendingDown,
  Filter,
  Phone,
} from 'lucide-react';
import { reportsApi, usersApi } from '@/lib/api';
import { toast } from 'sonner';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isOverdue = (dateString: string) => {
  return new Date(dateString) < new Date();
};

interface CustomerOutstanding {
  customerId: string;
  customerName: string;
  customerPhone: string;
  collectorId: string;
  collectorName: string;
  totalOutstanding: number;
  invoiceCount: number;
  oldestDueDate: string;
}

interface ReportSummary {
  totalOutstanding: number;
  overdueAmount: number;
  totalInvoices: number;
  overdueInvoices: number;
}

interface Collector {
  id: string;
  name: string;
}

export default function OutstandingReport() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [customers, setCustomers] = useState<CustomerOutstanding[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [selectedCollector, setSelectedCollector] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollectors();
  }, []);

  useEffect(() => {
    loadReport();
  }, [selectedCollector]);

  const loadCollectors = async () => {
    try {
      const response = await usersApi.getCollectors();
      if (response.data) {
        setCollectors(response.data);
      }
    } catch (error) {
      console.error('Failed to load collectors:', error);
    }
  };

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const collectorId = selectedCollector === 'all' ? undefined : selectedCollector;
      const response = await reportsApi.getOutstanding(collectorId);
      if (response.data) {
        setSummary(response.data.summary);
        setCustomers(response.data.byCustomer);
      }
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load outstanding report');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !summary) {
    return (
      <MainLayout title="Outstanding Report" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Outstanding Report" subtitle="View unpaid and overdue invoices">
      <div className="space-y-6 animate-fade-in">
        {/* Filter */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 max-w-xs">
              <Select value={selectedCollector} onValueChange={setSelectedCollector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select collector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collectors</SelectItem>
                  {collectors.map((collector) => (
                    <SelectItem key={collector.id} value={collector.id}>
                      {collector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadReport} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Refresh
            </Button>
          </div>
        </Card>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <DollarSign className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalOutstanding)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.overdueAmount)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
                  <p className="text-2xl font-bold">{summary.totalInvoices}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                  <p className="text-2xl font-bold">{summary.overdueInvoices}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Customers Table */}
        <Card>
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Outstanding by Customer</h3>
              <span className="text-sm text-muted-foreground">({customers.length} customers)</span>
            </div>
          </div>

          {customers.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-success mb-4" />
              <p className="text-lg font-medium">No Outstanding Balances</p>
              <p className="text-muted-foreground">All invoices have been paid.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-center">Invoices</TableHead>
                    <TableHead>Oldest Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.customerId}>
                      <TableCell className="font-medium">{customer.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.customerPhone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{customer.collectorName}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(customer.totalOutstanding)}
                      </TableCell>
                      <TableCell className="text-center">{customer.invoiceCount}</TableCell>
                      <TableCell>
                        <span
                          className={
                            isOverdue(customer.oldestDueDate)
                              ? 'text-destructive font-medium'
                              : ''
                          }
                        >
                          {formatDate(customer.oldestDueDate)}
                          {isOverdue(customer.oldestDueDate) && (
                            <span className="ml-1 text-xs">(Overdue)</span>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
