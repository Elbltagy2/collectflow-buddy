import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  Phone,
  MapPin,
  Receipt,
  ChevronRight,
  Users,
  Loader2,
  DollarSign
} from 'lucide-react';
import { customersApi, invoicesApi } from '@/lib/api';
import { Customer, Invoice } from '@/types';
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

export default function MyCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [showInvoicesDialog, setShowInvoicesDialog] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersApi.getAll();
      if (response.data) {
        setCustomers(response.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          address: c.address,
          collectorId: c.collectorId,
          totalOutstanding: c.totalOutstanding,
          lastPurchaseDate: c.lastPurchaseDate,
        })));
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerInvoices = async (customerId: string) => {
    setIsLoadingInvoices(true);
    try {
      const response = await invoicesApi.getByCustomer(customerId);
      if (response.data) {
        setCustomerInvoices(response.data.map((inv: any) => ({
          id: inv.id,
          customerId: inv.customerId,
          customerName: inv.customer?.name || 'Unknown',
          items: inv.items || [],
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          status: inv.status.toLowerCase(),
          createdAt: inv.createdAt,
          dueDate: inv.dueDate,
        })));
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleViewInvoices = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowInvoicesDialog(true);
    await loadCustomerInvoices(customer.id);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name' as const,
      label: 'Customer',
      render: (c: Customer) => (
        <div>
          <p className="font-medium text-foreground">{c.name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {c.address}
          </p>
        </div>
      )
    },
    {
      key: 'totalOutstanding' as const,
      label: 'Outstanding',
      render: (c: Customer) => (
        <span className={c.totalOutstanding > 0 ? 'font-semibold text-warning' : 'text-success'}>
          {formatCurrency(c.totalOutstanding)}
        </span>
      )
    },
    {
      key: 'id' as const,
      label: '',
      render: (c: Customer) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedCustomer(c)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="My Customers" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Customers" subtitle={`${customers.length} assigned customers`}>
      <div className="space-y-6 animate-fade-in">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer List */}
          <div className="lg:col-span-2">
            <DataTable
              columns={columns}
              data={filteredCustomers}
              onRowClick={(customer) => setSelectedCustomer(customer)}
              emptyMessage="No customers found"
            />
          </div>

          {/* Customer Details */}
          <div className="lg:col-span-1">
            {selectedCustomer ? (
              <Card className="p-6 sticky top-24">
                <h3 className="font-semibold text-lg text-foreground mb-4">
                  {selectedCustomer.name}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-foreground">{selectedCustomer.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${selectedCustomer.phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedCustomer.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                      <p className={`text-xl font-bold ${
                        selectedCustomer.totalOutstanding > 0 ? 'text-warning' : 'text-success'
                      }`}>
                        {formatCurrency(selectedCustomer.totalOutstanding)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    className="w-full gap-2"
                    onClick={() => handleViewInvoices(selectedCustomer)}
                  >
                    <Receipt className="h-4 w-4" />
                    View Invoices
                  </Button>
                  <a href={`tel:${selectedCustomer.phone}`} className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      Call Customer
                    </Button>
                  </a>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a customer to view details</p>
              </Card>
            )}
          </div>
        </div>

        {/* Invoices Dialog */}
        <Dialog open={showInvoicesDialog} onOpenChange={setShowInvoicesDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoices for {selectedCustomer?.name}</DialogTitle>
            </DialogHeader>
            {isLoadingInvoices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : customerInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found for this customer
              </div>
            ) : (
              <div className="space-y-3">
                {customerInvoices.map((invoice) => {
                  const balance = invoice.totalAmount - invoice.paidAmount;
                  return (
                    <Card key={invoice.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invoice.id.slice(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(invoice.createdAt)} • Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(invoice.totalAmount)}</p>
                          <span className={
                            invoice.status === 'paid' ? 'badge-success' :
                            invoice.status === 'partial' ? 'badge-warning' : 'badge-destructive'
                          }>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {balance > 0 && (
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Balance: <span className="font-semibold text-warning">{formatCurrency(balance)}</span>
                          </span>
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              toast.info('Use Today\'s Route to record payments');
                            }}
                          >
                            <DollarSign className="h-4 w-4" />
                            Pay
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
