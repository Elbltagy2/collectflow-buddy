import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle,
  MapPin,
  Phone,
  DollarSign,
  Navigation,
  Loader2,
  Receipt
} from 'lucide-react';
import { collectorApi, paymentsApi } from '@/lib/api';
import { toast } from 'sonner';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-EG', {
    month: 'short',
    day: 'numeric',
  });
};

interface RouteInvoice {
  id: string;
  invoiceNo: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
}

interface RouteCustomer {
  customerId: string;
  customerName: string;
  address: string;
  phone: string;
  outstandingAmount: number;
  todayDueAmount: number;
  visited: boolean;
  order: number;
  invoices: RouteInvoice[];
}

export default function TodaysRoute() {
  const [route, setRoute] = useState<RouteCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'FAWRY'>('CASH');
  const [selectedCustomer, setSelectedCustomer] = useState<RouteCustomer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<RouteInvoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRoute();
  }, []);

  const loadRoute = async () => {
    try {
      const response = await collectorApi.getRoute();
      if (response.data) {
        setRoute(response.data.map((item: any) => ({
          customerId: item.customerId,
          customerName: item.customerName,
          address: item.address,
          phone: item.phone,
          outstandingAmount: item.outstandingAmount || 0,
          todayDueAmount: item.todayDueAmount || 0,
          visited: item.visited,
          order: item.order,
          invoices: (item.invoices || []).map((inv: any) => ({
            id: inv.id,
            invoiceNo: inv.invoiceNo,
            totalAmount: inv.totalAmount,
            paidAmount: inv.paidAmount,
            dueDate: inv.dueDate,
            status: inv.status,
          })),
        })));
      }
    } catch (error) {
      console.error('Failed to load route:', error);
      toast.error('Failed to load route');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPaymentDialog = (customer: RouteCustomer) => {
    setSelectedCustomer(customer);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentMethod('CASH');
    setIsDialogOpen(true);

    // Auto-select first invoice if only one
    if (customer.invoices.length === 1) {
      const invoice = customer.invoices[0];
      setSelectedInvoice(invoice);
      setPaymentAmount((invoice.totalAmount - invoice.paidAmount).toString());
    }
  };

  const visitedCount = route.filter(r => r.visited).length;
  const progress = route.length > 0 ? (visitedCount / route.length) * 100 : 0;
  const totalToCollect = route.reduce((sum, r) => sum + r.todayDueAmount, 0);
  const collectedAmount = route.filter(r => r.visited).reduce((sum, r) => sum + r.todayDueAmount, 0);

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentAmount || !selectedInvoice) {
      toast.error('Please select an invoice and enter amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const invoiceBalance = selectedInvoice.totalAmount - selectedInvoice.paidAmount;
    if (amount > invoiceBalance) {
      toast.error(`Amount exceeds invoice balance (${formatCurrency(invoiceBalance)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Create payment record
      await paymentsApi.create({
        invoiceId: selectedInvoice.id,
        amount,
        method: paymentMethod,
      });

      // Mark as visited
      await collectorApi.markVisited(selectedCustomer.customerId, true);

      // Update local state
      setRoute(route.map(r =>
        r.customerId === selectedCustomer.customerId
          ? {
              ...r,
              visited: true,
              todayDueAmount: r.todayDueAmount - amount,
              invoices: r.invoices.map(inv =>
                inv.id === selectedInvoice.id
                  ? { ...inv, paidAmount: inv.paidAmount + amount }
                  : inv
              ),
            }
          : r
      ));

      toast.success(`Payment of ${formatCurrency(amount)} recorded for ${selectedCustomer.customerName}`);
      setIsDialogOpen(false);
      setPaymentAmount('');
      setPaymentMethod('CASH');
      setSelectedCustomer(null);
      setSelectedInvoice(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Today's Route" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Today's Route" subtitle={`${route.length} customers to visit`}>
      <div className="space-y-6 animate-fade-in">
        {/* Progress Overview */}
        <Card className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Route Progress</p>
              <Progress value={progress} className="h-3 mb-2" />
              <p className="text-sm">
                <span className="font-semibold text-foreground">{visitedCount}</span>
                <span className="text-muted-foreground"> of {route.length} visited</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Due Amount</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalToCollect)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Collected So Far</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(collectedAmount)}</p>
            </div>
          </div>
        </Card>

        {/* Route List */}
        {route.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No customers assigned to your route today.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {route.map((customer, index) => (
              <Card
                key={customer.customerId}
                className={`p-4 transition-all ${
                  customer.visited
                    ? 'bg-success/5 border-success/20'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                    customer.visited
                      ? 'bg-success text-success-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {customer.visited ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{customer.customerName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{customer.address}</span>
                        </div>
                        {customer.invoices.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {customer.invoices.length} invoice{customer.invoices.length > 1 ? 's' : ''} due
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-lg text-foreground">
                          {formatCurrency(customer.todayDueAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">Due Today</p>
                        {customer.outstandingAmount > customer.todayDueAmount && (
                          <p className="text-xs text-muted-foreground">
                            Total: {formatCurrency(customer.outstandingAmount)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <a href={`tel:${customer.phone}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Phone className="h-4 w-4" />
                          Call
                        </Button>
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(customer.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <Navigation className="h-4 w-4" />
                          Navigate
                        </Button>
                      </a>
                      {!customer.visited && customer.invoices.length > 0 && (
                        <Button
                          size="sm"
                          className="gap-2 ml-auto"
                          onClick={() => handleOpenPaymentDialog(customer)}
                        >
                          <DollarSign className="h-4 w-4" />
                          Record Payment
                        </Button>
                      )}
                      {customer.visited && (
                        <span className="badge-success ml-auto">Completed</span>
                      )}
                      {!customer.visited && customer.invoices.length === 0 && (
                        <span className="text-xs text-muted-foreground ml-auto">No invoices due</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-semibold">{selectedCustomer?.customerName}</p>
              </div>

              {/* Invoice Selection */}
              <div className="space-y-2">
                <Label>Select Invoice</Label>
                {selectedCustomer?.invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No unpaid invoices for today</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCustomer?.invoices.map((invoice) => {
                      const balance = invoice.totalAmount - invoice.paidAmount;
                      const isSelected = selectedInvoice?.id === invoice.id;
                      return (
                        <div
                          key={invoice.id}
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentAmount(balance.toString());
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {invoice.invoiceNo}
                              </span>
                            </div>
                            <span className={
                              invoice.status === 'PARTIAL' ? 'badge-warning' : 'badge-destructive'
                            }>
                              {invoice.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              Due: {formatDate(invoice.dueDate)}
                            </span>
                            <span className="text-sm font-semibold text-warning">
                              Balance: {formatCurrency(balance)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedInvoice && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Balance</p>
                    <p className="text-xl font-bold text-warning">
                      {formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'CASH' | 'FAWRY')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="FAWRY">Fawry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPaymentAmount((selectedInvoice.totalAmount - selectedInvoice.paidAmount).toString())}
                    >
                      Full Amount
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleRecordPayment}
                      disabled={isSubmitting || !selectedInvoice}
                    >
                      {isSubmitting ? 'Recording...' : 'Record Payment'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
