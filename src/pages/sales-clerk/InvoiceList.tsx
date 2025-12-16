import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Search,
  Filter,
  Eye,
  Loader2
} from 'lucide-react';
import { invoicesApi } from '@/lib/api';
import { Invoice } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await invoicesApi.getAll(params);
      if (response.data) {
        setInvoices(response.data.map((inv: any) => ({
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
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    { key: 'id' as const, label: 'Invoice #' },
    { key: 'customerName' as const, label: 'Customer' },
    {
      key: 'totalAmount' as const,
      label: 'Total',
      render: (inv: Invoice) => (
        <span className="font-semibold">{formatCurrency(inv.totalAmount)}</span>
      )
    },
    {
      key: 'paidAmount' as const,
      label: 'Paid',
      render: (inv: Invoice) => formatCurrency(inv.paidAmount)
    },
    {
      key: 'customerId' as const,
      label: 'Balance',
      render: (inv: Invoice) => {
        const balance = inv.totalAmount - inv.paidAmount;
        return (
          <span className={balance > 0 ? 'text-warning font-medium' : 'text-success'}>
            {formatCurrency(balance)}
          </span>
        );
      }
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (inv: Invoice) => (
        <span className={
          inv.status === 'paid' ? 'badge-success' :
          inv.status === 'partial' ? 'badge-warning' : 'badge-destructive'
        }>
          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
        </span>
      )
    },
    {
      key: 'createdAt' as const,
      label: 'Date',
      render: (inv: Invoice) => formatDate(inv.createdAt)
    },
    {
      key: 'dueDate' as const,
      label: '',
      render: (inv: Invoice) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedInvoice(inv);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Invoices" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Invoices" subtitle="View and search all invoices" showSearch>
      <div className="space-y-6 animate-fade-in">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice # or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredInvoices}
          onRowClick={(invoice) => setSelectedInvoice(invoice)}
          emptyMessage="No invoices found"
        />

        {/* Invoice Detail Dialog */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice?.id}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={
                      selectedInvoice.status === 'paid' ? 'badge-success' :
                      selectedInvoice.status === 'partial' ? 'badge-warning' : 'badge-destructive'
                    }>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Product</th>
                          <th className="text-right p-3 text-sm font-medium text-muted-foreground">Qty</th>
                          <th className="text-right p-3 text-sm font-medium text-muted-foreground">Price</th>
                          <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-3">{item.productName}</td>
                            <td className="p-3 text-right">{item.quantity}</td>
                            <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold">{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Paid Amount</span>
                    <span className="text-success">{formatCurrency(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium">Balance Due</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
