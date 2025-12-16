import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { 
  Upload, 
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
import { toast } from 'sonner';

interface ParsedInvoice {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'valid' | 'error';
  error?: string;
}

export default function UploadInvoices() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedInvoice[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload an Excel or CSV file');
        return;
      }
      setFile(selectedFile);
      setParsedData([]);
      setUploadComplete(false);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock parsed data
    const mockParsed: ParsedInvoice[] = [
      { id: '1', customerName: 'Al-Nour Supermarket', productName: 'Coca Cola 1L', quantity: 48, unitPrice: 15, total: 720, status: 'valid' },
      { id: '2', customerName: 'Al-Nour Supermarket', productName: 'Chips Ahoy', quantity: 24, unitPrice: 25, total: 600, status: 'valid' },
      { id: '3', customerName: 'El-Salam Grocery', productName: 'Pepsi 1L', quantity: 60, unitPrice: 14, total: 840, status: 'valid' },
      { id: '4', customerName: 'Unknown Store', productName: 'Water Bottle', quantity: 100, unitPrice: 0, total: 0, status: 'error', error: 'Customer not found' },
      { id: '5', customerName: 'Baraka Mini Market', productName: 'Unknown Product', quantity: 50, unitPrice: 0, total: 0, status: 'error', error: 'Product not found' },
    ];
    
    setParsedData(mockParsed);
    setIsProcessing(false);
  };

  const handleCreateInvoices = async () => {
    const validInvoices = parsedData.filter(p => p.status === 'valid');
    if (validInvoices.length === 0) {
      toast.error('No valid invoices to create');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`${validInvoices.length} invoices created successfully`);
    setUploadComplete(true);
    setIsProcessing(false);
  };

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'productName', label: 'Product' },
    { 
      key: 'quantity', 
      label: 'Qty',
      render: (row: ParsedInvoice) => row.quantity
    },
    { 
      key: 'unitPrice', 
      label: 'Unit Price',
      render: (row: ParsedInvoice) => formatCurrency(row.unitPrice)
    },
    { 
      key: 'total', 
      label: 'Total',
      render: (row: ParsedInvoice) => (
        <span className="font-semibold">{formatCurrency(row.total)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: ParsedInvoice) => (
        row.status === 'valid' ? (
          <span className="badge-success flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" />
            Valid
          </span>
        ) : (
          <div>
            <span className="badge-destructive flex items-center gap-1 w-fit">
              <AlertCircle className="h-3 w-3" />
              Error
            </span>
            <p className="text-xs text-destructive mt-1">{row.error}</p>
          </div>
        )
      )
    },
  ];

  const validCount = parsedData.filter(p => p.status === 'valid').length;
  const errorCount = parsedData.filter(p => p.status === 'error').length;
  const totalAmount = parsedData.filter(p => p.status === 'valid').reduce((sum, p) => sum + p.total, 0);

  return (
    <MainLayout title="Upload Invoices" subtitle="Import invoices from Excel">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Upload Area */}
        {!uploadComplete && (
          <Card className="p-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {file ? (
                <div className="space-y-4">
                  <FileSpreadsheet className="h-12 w-12 text-success mx-auto" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setParsedData([]);
                      }}
                    >
                      Remove
                    </Button>
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Process File'}
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-1">
                    Upload Excel File
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to browse
                  </p>
                  <Button variant="outline" asChild>
                    <span>Select File</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </Card>
        )}

        {/* Template Download */}
        {!parsedData.length && !uploadComplete && (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Need a template?</p>
                <p className="text-sm text-muted-foreground">
                  Download our Excel template with required columns: customer_name, product_name, quantity
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </Card>
        )}

        {/* Parsed Results */}
        {parsedData.length > 0 && !uploadComplete && (
          <>
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Total Rows</p>
                <p className="text-2xl font-bold text-foreground">{parsedData.length}</p>
              </Card>
              <Card className="p-4 bg-success/5 border-success/20">
                <p className="text-sm text-muted-foreground">Valid</p>
                <p className="text-2xl font-bold text-success">{validCount}</p>
              </Card>
              <Card className="p-4 bg-destructive/5 border-destructive/20">
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-destructive">{errorCount}</p>
              </Card>
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
              </Card>
            </div>

            {/* Data Table */}
            <Card className="overflow-hidden">
              <DataTable columns={columns} data={parsedData} />
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setParsedData([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoices}
                disabled={validCount === 0 || isProcessing}
                className="btn-gradient-primary"
              >
                {isProcessing ? 'Creating...' : `Create ${validCount} Invoices`}
              </Button>
            </div>
          </>
        )}

        {/* Success State */}
        {uploadComplete && (
          <Card className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Invoices Created!</h2>
            <p className="text-muted-foreground mb-6">
              {validCount} invoices totaling {formatCurrency(totalAmount)} have been created successfully.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setParsedData([]);
                  setUploadComplete(false);
                }}
              >
                Upload More
              </Button>
              <Button asChild>
                <a href="/invoices">View Invoices</a>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
