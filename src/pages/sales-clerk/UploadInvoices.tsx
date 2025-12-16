import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
import { toast } from 'sonner';
import { invoicesApi, customersApi, productsApi } from '@/lib/api';

interface ParsedInvoice {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'valid' | 'error';
  error?: string;
  customerId?: string;
  productId?: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function UploadInvoices() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedInvoice[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Manual invoice state
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [manualDueDate, setManualDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState<{
    productId: string;
    quantity: number;
  }>({ productId: '', quantity: 1 });

  useEffect(() => {
    loadCustomersAndProducts();
  }, []);

  const loadCustomersAndProducts = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        customersApi.getAll({ limit: 1000 }),
        productsApi.getAll({ limit: 1000 }),
      ]);
      if (customersRes.data) setCustomers(customersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

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

    try {
      const response = await invoicesApi.uploadExcel(file);

      if (response.data) {
        const parsed: ParsedInvoice[] = response.data.rows.map((row: any, index: number) => ({
          id: String(index + 1),
          customerName: row.customerName,
          productName: row.productName,
          quantity: row.quantity,
          unitPrice: row.unitPrice || 0,
          total: (row.unitPrice || 0) * row.quantity,
          status: row.status,
          error: row.error,
          customerId: row.customerId,
          productId: row.productId,
        }));
        setParsedData(parsed);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateInvoices = async () => {
    const validRows = parsedData.filter(p => p.status === 'valid');
    if (validRows.length === 0) {
      toast.error('No valid invoices to create');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await invoicesApi.createFromExcel(validRows, dueDate);

      if (response.data) {
        toast.success(`${response.data.created} invoices created successfully`);
        setUploadComplete(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invoices');
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual invoice functions
  const handleAddItem = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      toast.error('Please select a product and enter a valid quantity');
      return;
    }

    const product = products.find(p => p.id === currentItem.productId);
    if (!product) return;

    // Check if product already exists
    const existingIndex = invoiceItems.findIndex(item => item.productId === currentItem.productId);
    if (existingIndex >= 0) {
      const updated = [...invoiceItems];
      updated[existingIndex].quantity += currentItem.quantity;
      setInvoiceItems(updated);
    } else {
      setInvoiceItems([
        ...invoiceItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: currentItem.quantity,
          unitPrice: product.price,
        },
      ]);
    }

    setCurrentItem({ productId: '', quantity: 1 });
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleCreateManualInvoice = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }
    if (invoiceItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await invoicesApi.create({
        customerId: selectedCustomer,
        dueDate: manualDueDate,
        items: invoiceItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      if (response.data) {
        toast.success('Invoice created successfully');
        setManualDialogOpen(false);
        setSelectedCustomer('');
        setInvoiceItems([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const manualTotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

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
    <MainLayout title="Upload Invoices" subtitle="Import invoices from Excel or create manually">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Action Buttons */}
        {!uploadComplete && !parsedData.length && (
          <div className="flex justify-end">
            <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Manual Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Customer Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Customer</Label>
                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={manualDueDate}
                        onChange={(e) => setManualDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Add Item */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <Label>Add Items</Label>
                    <div className="flex gap-2">
                      <Select
                        value={currentItem.productId}
                        onValueChange={(v) => setCurrentItem({ ...currentItem, productId: v })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {formatCurrency(product.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                        className="w-24"
                        placeholder="Qty"
                      />
                      <Button onClick={handleAddItem} variant="secondary">
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Items List */}
                  {invoiceItems.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Product</th>
                            <th className="text-right p-2">Qty</th>
                            <th className="text-right p-2">Price</th>
                            <th className="text-right p-2">Total</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{item.productName}</td>
                              <td className="text-right p-2">{item.quantity}</td>
                              <td className="text-right p-2">{formatCurrency(item.unitPrice)}</td>
                              <td className="text-right p-2 font-medium">
                                {formatCurrency(item.quantity * item.unitPrice)}
                              </td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t bg-muted/50">
                            <td colSpan={3} className="p-2 text-right font-medium">
                              Total:
                            </td>
                            <td className="p-2 text-right font-bold text-primary">
                              {formatCurrency(manualTotal)}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setManualDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateManualInvoice}
                      disabled={isProcessing || !selectedCustomer || invoiceItems.length === 0}
                    >
                      {isProcessing ? 'Creating...' : 'Create Invoice'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

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
            {/* Due Date Selection */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Label className="font-medium">Invoice Due Date:</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-48"
                />
                <p className="text-sm text-muted-foreground">
                  All invoices will be created with this due date
                </p>
              </div>
            </Card>

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
