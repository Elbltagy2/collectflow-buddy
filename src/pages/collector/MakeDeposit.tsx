import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Banknote,
  Smartphone,
  Upload,
  CheckCircle,
  Wallet,
  Loader2
} from 'lucide-react';
import { collectorApi, depositsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

export default function MakeDeposit() {
  const navigate = useNavigate();
  const [depositMethod, setDepositMethod] = useState<'CASH' | 'FAWRY'>('CASH');
  const [amount, setAmount] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    try {
      const response = await collectorApi.getWallet();
      if (response.data) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      toast.error('Failed to load wallet balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (depositAmount > walletBalance) {
      toast.error('Amount exceeds wallet balance');
      return;
    }

    if (depositMethod === 'FAWRY' && !receiptImage) {
      toast.error('Please upload a Fawry receipt');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create deposit
      const response = await depositsApi.create({
        amount: depositAmount,
        method: depositMethod,
      });

      // Upload receipt if Fawry
      if (depositMethod === 'FAWRY' && receiptImage && response.data?.id) {
        await depositsApi.uploadReceipt(response.data.id, receiptImage);
      }

      toast.success(
        `${depositMethod === 'CASH' ? 'Cash' : 'Fawry'} deposit of ${formatCurrency(depositAmount)} submitted successfully`
      );

      // Reset form
      setAmount('');
      setReceiptImage(null);

      // Update wallet balance
      setWalletBalance(prev => prev - depositAmount);

      // Navigate to wallet page
      navigate('/wallet');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Make Deposit" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Make Deposit" subtitle="Deposit your collected money">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Wallet Balance */}
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Wallet className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-80">Available to Deposit</p>
              <p className="text-3xl font-bold">{formatCurrency(walletBalance)}</p>
            </div>
          </div>
        </Card>

        {walletBalance === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No balance available to deposit.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/route')}
            >
              Collect Payments First
            </Button>
          </Card>
        ) : (
          <>
            {/* Deposit Form */}
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Deposit Method */}
                <div className="space-y-3">
                  <Label>Deposit Method</Label>
                  <RadioGroup
                    value={depositMethod}
                    onValueChange={(v) => setDepositMethod(v as 'CASH' | 'FAWRY')}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="cash"
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        depositMethod === 'CASH'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="CASH" id="cash" />
                      <Banknote className={`h-6 w-6 ${depositMethod === 'CASH' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium text-foreground">Cash</p>
                        <p className="text-sm text-muted-foreground">Hand over cash</p>
                      </div>
                    </Label>

                    <Label
                      htmlFor="fawry"
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        depositMethod === 'FAWRY'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="FAWRY" id="fawry" />
                      <Smartphone className={`h-6 w-6 ${depositMethod === 'FAWRY' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium text-foreground">Fawry</p>
                        <p className="text-sm text-muted-foreground">Upload receipt</p>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (EGP)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter deposit amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(walletBalance.toString())}
                  >
                    Deposit Full Balance
                  </Button>
                </div>

                {/* Fawry Receipt Upload */}
                {depositMethod === 'FAWRY' && (
                  <div className="space-y-2">
                    <Label htmlFor="receipt">Fawry Receipt Image</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      {receiptImage ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-8 w-8 text-success mx-auto" />
                          <p className="text-sm text-foreground">{receiptImage.name}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setReceiptImage(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="receipt" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 5MB
                          </p>
                          <input
                            id="receipt"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full btn-gradient-primary"
                  disabled={isSubmitting || walletBalance === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Submit ${depositMethod === 'CASH' ? 'Cash' : 'Fawry'} Deposit`
                  )}
                </Button>
              </form>
            </Card>

            {/* Instructions */}
            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold text-foreground mb-2">Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                {depositMethod === 'CASH' ? (
                  <>
                    <li>• Count the cash carefully before submission</li>
                    <li>• Hand over the cash to the accountant for verification</li>
                    <li>• Keep a record of your deposit for reference</li>
                  </>
                ) : (
                  <>
                    <li>• Complete the Fawry payment first</li>
                    <li>• Take a clear photo of the receipt</li>
                    <li>• Make sure the transaction number is visible</li>
                    <li>• The accountant will verify your receipt</li>
                  </>
                )}
              </ul>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
