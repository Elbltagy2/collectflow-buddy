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
  Wallet,
} from 'lucide-react';
import { depositsApi } from '@/lib/api';
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

interface Deposit {
  id: string;
  amount: number;
  method: string;
  status: string;
  receiptImage: string | null;
  notes: string | null;
  createdAt: string;
  collector: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DepositApproval() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminWalletBalance, setAdminWalletBalance] = useState(0);

  useEffect(() => {
    loadPendingDeposits();
    loadAdminWalletBalance();
  }, []);

  const loadPendingDeposits = async () => {
    try {
      const response = await depositsApi.getPending();
      if (response.data) {
        setDeposits(response.data);
      }
    } catch (error) {
      console.error('Failed to load deposits:', error);
      toast.error('Failed to load pending deposits');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminWalletBalance = async () => {
    try {
      const response = await depositsApi.getAdminWalletBalance();
      if (response.data) {
        setAdminWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Failed to load admin wallet balance:', error);
    }
  };

  const handleOpenDialog = (deposit: Deposit, action: 'approve' | 'reject') => {
    setSelectedDeposit(deposit);
    setActionType(action);
    setRejectReason('');
    setIsDialogOpen(true);
  };

  const handleProcessDeposit = async () => {
    if (!selectedDeposit || !actionType) return;

    if (actionType === 'reject' && !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await depositsApi.verify(
        selectedDeposit.id,
        actionType === 'approve',
        actionType === 'reject' ? rejectReason : undefined
      );

      toast.success(
        actionType === 'approve'
          ? `Deposit of ${formatCurrency(selectedDeposit.amount)} approved`
          : `Deposit rejected`
      );

      // Remove from list
      setDeposits(deposits.filter(d => d.id !== selectedDeposit.id));

      // Refresh admin wallet balance after approval
      if (actionType === 'approve') {
        loadAdminWalletBalance();
      }

      setIsDialogOpen(false);
      setSelectedDeposit(null);
      setActionType(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Deposit Approval" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Deposit Approval" subtitle={`${deposits.length} pending deposits`}>
      <div className="space-y-6 animate-fade-in">
        {/* Admin Wallet Card */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Admin Wallet Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(adminWalletBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total received from approved deposits</p>
            </div>
          </div>
        </Card>

        {/* Summary Card */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{deposits.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(deposits.reduce((sum, d) => sum + d.amount, 0))}
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
                  {new Set(deposits.map(d => d.collector.id)).size}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Deposits List */}
        {deposits.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-muted-foreground">No pending deposits to approve.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {deposits.map((deposit) => (
              <Card key={deposit.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                        {deposit.collector.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{deposit.collector.name}</p>
                        <p className="text-sm text-muted-foreground">{deposit.collector.email}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-lg">{formatCurrency(deposit.amount)}</span>
                        <span className="badge-primary">{deposit.method}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(deposit.createdAt)}</span>
                      </div>
                      {deposit.notes && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4 mt-0.5" />
                          <span>{deposit.notes}</span>
                        </div>
                      )}
                      {deposit.receiptImage && (
                        <div className="flex items-center gap-2 text-primary">
                          <Image className="h-4 w-4" />
                          <a
                            href={`http://localhost:3001${deposit.receiptImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            View Receipt
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleOpenDialog(deposit, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleOpenDialog(deposit, 'reject')}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
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
                {actionType === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
              </DialogTitle>
            </DialogHeader>

            {selectedDeposit && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Collector</p>
                  <p className="font-semibold">{selectedDeposit.collector.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedDeposit.amount)}</p>
                </div>

                {actionType === 'approve' ? (
                  <div className="p-4 bg-success/10 rounded-lg">
                    <p className="text-sm text-success">
                      Approving this deposit will deduct {formatCurrency(selectedDeposit.amount)} from the collector's wallet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Rejection</Label>
                    <Input
                      id="reason"
                      placeholder="Enter reason..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The collector will be notified of the rejection.
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
                variant={actionType === 'approve' ? 'default' : 'destructive'}
                onClick={handleProcessDeposit}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
