import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  User,
  DollarSign,
  Calendar,
  FileText,
  Image,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { paymentsApi } from '@/lib/api';
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
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  receiptImage: string | null;
  notes: string | null;
  createdAt: string;
  invoice: {
    id: string;
    invoiceNo: string;
    totalAmount: number;
  };
  customer: {
    id: string;
    name: string;
  };
  collector: {
    id: string;
    name: string;
  };
}

export default function VerifyReceipts() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      const response = await paymentsApi.getPendingVerification();
      if (response.data) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load pending receipts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (payment: Payment, action: 'verify' | 'reject') => {
    setSelectedPayment(payment);
    setActionType(action);
    setRejectReason('');
    setIsDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedPayment || !actionType) return;

    setIsProcessing(true);
    try {
      await paymentsApi.verify(
        selectedPayment.id,
        actionType === 'verify',
        actionType === 'reject' ? rejectReason : undefined
      );

      toast.success(
        actionType === 'verify'
          ? `Payment of ${formatCurrency(selectedPayment.amount)} verified`
          : `Payment marked for review`
      );

      // Remove from list
      setPayments(payments.filter(p => p.id !== selectedPayment.id));
      setIsDialogOpen(false);
      setSelectedPayment(null);
      setActionType(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Verify Receipts" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Verify Receipts" subtitle={`${payments.length} receipts pending verification`}>
      <div className="space-y-6 animate-fade-in">
        {/* Summary Card */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <User className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collectors</p>
                <p className="text-2xl font-bold">
                  {new Set(payments.map(p => p.collector.id)).size}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
                <CreditCard className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="text-lg font-bold">Fawry Only</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payments List */}
        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-muted-foreground">No pending receipts to verify.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Invoice #{payment.invoice.invoiceNo}</p>
                        <p className="text-sm text-muted-foreground">{payment.customer.name}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-lg">{formatCurrency(payment.amount)}</span>
                        <span className="badge-primary">{payment.method}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Collected by: {payment.collector.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      {payment.notes && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4 mt-0.5" />
                          <span>{payment.notes}</span>
                        </div>
                      )}
                      {payment.receiptImage && (
                        <div className="flex items-center gap-2 text-primary">
                          <Image className="h-4 w-4" />
                          <a
                            href={`http://localhost:3001${payment.receiptImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            View Receipt Image
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleOpenDialog(payment, 'verify')}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleOpenDialog(payment, 'reject')}
                    >
                      <XCircle className="h-4 w-4" />
                      Flag Issue
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'verify' ? 'Verify Payment Receipt' : 'Flag Payment Issue'}
              </DialogTitle>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Invoice</p>
                      <p className="font-semibold">#{selectedPayment.invoice.invoiceNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-semibold">{selectedPayment.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Collector</p>
                      <p className="font-semibold">{selectedPayment.collector.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-xl font-bold">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                  </div>
                </div>

                {actionType === 'verify' ? (
                  <div className="p-4 bg-success/10 rounded-lg">
                    <p className="text-sm text-success">
                      By verifying, you confirm that the Fawry payment receipt is valid and matches the recorded amount.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="reason">Issue Description (optional)</Label>
                    <Input
                      id="reason"
                      placeholder="Describe the issue..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will flag the payment for further investigation.
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'verify' ? 'default' : 'secondary'}
                onClick={handleProcessPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {actionType === 'verify' ? 'Verify Receipt' : 'Flag Issue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
