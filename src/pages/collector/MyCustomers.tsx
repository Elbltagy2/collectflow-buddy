import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Phone, 
  MapPin,
  Receipt,
  ChevronRight,
  Users
} from 'lucide-react';
import { mockCustomers, formatCurrency } from '@/data/mockData';
import { Customer } from '@/types';

export default function MyCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const myCustomers = mockCustomers.filter(c => c.collectorId === '2');
  const filteredCustomers = myCustomers.filter(c => 
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

  return (
    <MainLayout title="My Customers" subtitle={`${myCustomers.length} assigned customers`}>
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
                  <Button className="w-full gap-2">
                    <Receipt className="h-4 w-4" />
                    View Invoices
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Call Customer
                  </Button>
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
      </div>
    </MainLayout>
  );
}
