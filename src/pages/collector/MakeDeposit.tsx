import { useState } from 'react';
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
  Wallet
} from 'lucide-react';
import { mockCollectorStats, formatCurrency } from '@/data/mockData';
import { toast } from 'sonner';

export default function MakeDeposit() {
  const [depositMethod, setDepositMethod] = useState<'cash' | 'fawry'>('cash');
  const [amount, setAmount] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = mockCollectorStats[0];

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

    if (depositAmount > stats.walletBalance) {
      toast.error('Amount exceeds wallet balance');
      return;
    }

    if (depositMethod === 'fawry' && !receiptImage) {
      toast.error('Please upload a Fawry receipt');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`${depositMethod === 'cash' ? 'Cash' : 'Fawry'} deposit of ${formatCurrency(depositAmount)} submitted successfully`);
    setAmount('');
    setReceiptImage(null);
    setIsSubmitting(false);
  };

  return (
    <MainLayout title="Make Deposit" subtitle="Deposit your collected money">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Wallet Balance */}
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Wallet className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-80">Available to Deposit</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.walletBalance)}</p>
            </div>
          </div>
        </Card>

        {/* Deposit Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deposit Method */}
            <div className="space-y-3">
              <Label>Deposit Method</Label>
              <RadioGroup
                value={depositMethod}
                onValueChange={(v) => setDepositMethod(v as 'cash' | 'fawry')}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="cash"
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    depositMethod === 'cash'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="cash" id="cash" />
                  <Banknote className={`h-6 w-6 ${depositMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-foreground">Cash</p>
                    <p className="text-sm text-muted-foreground">Hand over cash</p>
                  </div>
                </Label>
                
                <Label
                  htmlFor="fawry"
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    depositMethod === 'fawry'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="fawry" id="fawry" />
                  <Smartphone className={`h-6 w-6 ${depositMethod === 'fawry' ? 'text-primary' : 'text-muted-foreground'}`} />
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
                onClick={() => setAmount(stats.walletBalance.toString())}
              >
                Deposit Full Balance
              </Button>
            </div>

            {/* Fawry Receipt Upload */}
            {depositMethod === 'fawry' && (
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Submit ${depositMethod === 'cash' ? 'Cash' : 'Fawry'} Deposit`}
            </Button>
          </form>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-2">Instructions</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            {depositMethod === 'cash' ? (
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
      </div>
    </MainLayout>
  );
}
