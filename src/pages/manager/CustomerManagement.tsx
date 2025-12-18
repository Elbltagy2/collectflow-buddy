import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  UserPlus,
  Users,
  MapPin,
  Phone,
  Loader2,
  ArrowLeftRight,
  Filter,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { customersApi, usersApi } from '@/lib/api';
import { toast } from 'sonner';
import { MapPicker } from '@/components/ui/MapPicker';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  collectorId: string | null;
  collectorName?: string;
  totalOutstanding: number;
  latitude?: number | null;
  longitude?: number | null;
}

interface Collector {
  id: string;
  name: string;
  email: string;
  customerCount?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollector, setFilterCollector] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Create/Edit/Delete states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    collectorId: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersResponse, collectorsResponse] = await Promise.all([
        customersApi.getAll(),
        usersApi.getCollectors(),
      ]);

      if (customersResponse.data) {
        setCustomers(customersResponse.data.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          name: c.name as string,
          phone: c.phone as string,
          address: c.address as string,
          collectorId: c.collectorId as string | null,
          collectorName: (c.collector as Record<string, unknown>)?.name as string || null,
          totalOutstanding: c.totalOutstanding as number,
          latitude: c.latitude as number | null,
          longitude: c.longitude as number | null,
        })));
      }

      if (collectorsResponse.data) {
        setCollectors(collectorsResponse.data.map((u: Record<string, unknown>) => ({
          id: u.id as string,
          name: u.name as string,
          email: u.email as string,
        })));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedCollectorId(customer.collectorId || '');
    setIsAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedCustomer || !selectedCollectorId) {
      toast.error('Please select a collector');
      return;
    }

    setIsAssigning(true);
    try {
      await customersApi.assignCollector(selectedCustomer.id, selectedCollectorId);

      // Update local state
      const collector = collectors.find(c => c.id === selectedCollectorId);
      setCustomers(customers.map(c =>
        c.id === selectedCustomer.id
          ? { ...c, collectorId: selectedCollectorId, collectorName: collector?.name }
          : c
      ));

      toast.success(`${selectedCustomer.name} assigned to ${collector?.name}`);
      setIsAssignDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign collector';
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({ name: '', phone: '', address: '', collectorId: '', latitude: null, longitude: null });
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      collectorId: customer.collectorId || '',
      latitude: customer.latitude || null,
      longitude: customer.longitude || null,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await customersApi.create({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        collectorId: formData.collectorId || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      if (response.data) {
        const collector = collectors.find(c => c.id === formData.collectorId);
        setCustomers([...customers, {
          id: response.data.id,
          name: response.data.name,
          phone: response.data.phone,
          address: response.data.address,
          collectorId: response.data.collectorId,
          collectorName: collector?.name,
          totalOutstanding: 0,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        }]);
        toast.success(`Customer ${formData.name} created successfully`);
        setIsCreateDialogOpen(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer || !formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await customersApi.update(selectedCustomer.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        collectorId: formData.collectorId || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      if (response.data) {
        const collector = collectors.find(c => c.id === formData.collectorId);
        setCustomers(customers.map(c =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                collectorId: formData.collectorId || null,
                collectorName: collector?.name,
                latitude: formData.latitude,
                longitude: formData.longitude,
              }
            : c
        ));
        toast.success(`Customer ${formData.name} updated successfully`);
        setIsEditDialogOpen(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update customer';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      await customersApi.delete(selectedCustomer.id);
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      toast.success(`Customer ${selectedCustomer.name} deleted successfully`);
      setIsDeleteDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete customer';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesCollector =
      filterCollector === 'all' ||
      (filterCollector === 'unassigned' && !c.collectorId) ||
      c.collectorId === filterCollector;

    return matchesSearch && matchesCollector;
  });

  // Count customers per collector
  const collectorCustomerCounts = customers.reduce((acc, c) => {
    if (c.collectorId) {
      acc[c.collectorId] = (acc[c.collectorId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const unassignedCount = customers.filter(c => !c.collectorId).length;

  const columns = [
    {
      key: 'name' as const,
      label: 'Customer',
      render: (c: Customer) => (
        <div>
          <p className="font-medium text-foreground">{c.name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {c.phone}
          </p>
        </div>
      )
    },
    {
      key: 'address' as const,
      label: 'Address',
      render: (c: Customer) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{c.address}</span>
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
      key: 'collectorName' as const,
      label: 'Assigned Collector',
      render: (c: Customer) => (
        c.collectorName ? (
          <span className="badge-primary">{c.collectorName}</span>
        ) : (
          <span className="badge-warning">Unassigned</span>
        )
      )
    },
    {
      key: 'id' as const,
      label: '',
      render: (c: Customer) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAssignClick(c);
            }}
            className="gap-1"
          >
            <ArrowLeftRight className="h-4 w-4" />
            {c.collectorId ? 'Reassign' : 'Assign'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(c);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(c);
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Customer Management" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Customer Management" subtitle="Assign customers to collectors">
      <div className="space-y-6 animate-fade-in">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <UserPlus className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold text-warning">{unassignedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collectors</p>
                <p className="text-2xl font-bold">{collectors.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg per Collector</p>
                <p className="text-2xl font-bold">
                  {collectors.length > 0 ? Math.round((customers.length - unassignedCount) / collectors.length) : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCollector} onValueChange={setFilterCollector}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by collector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="unassigned">Unassigned ({unassignedCount})</SelectItem>
                {collectors.map(collector => (
                  <SelectItem key={collector.id} value={collector.id}>
                    {collector.name} ({collectorCustomerCounts[collector.id] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </Card>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredCustomers}
          emptyMessage="No customers found"
        />

        {/* Assign Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer?.collectorId ? 'Reassign' : 'Assign'} Customer
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-semibold">{selectedCustomer?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer?.address}</p>
              </div>

              {selectedCustomer?.collectorName && (
                <div>
                  <p className="text-sm text-muted-foreground">Currently Assigned To</p>
                  <p className="font-medium">{selectedCustomer.collectorName}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Select Collector</Label>
                <Select value={selectedCollectorId} onValueChange={setSelectedCollectorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a collector..." />
                  </SelectTrigger>
                  <SelectContent>
                    {collectors.map(collector => (
                      <SelectItem key={collector.id} value={collector.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{collector.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({collectorCustomerCounts[collector.id] || 0} customers)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAssign}
                  disabled={isAssigning || !selectedCollectorId}
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Collector'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Customer Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Location (for route optimization)</Label>
                <MapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                  height="250px"
                />
              </div>

              <div className="space-y-2">
                <Label>Assign to Collector (optional)</Label>
                <Select value={formData.collectorId || "none"} onValueChange={(v) => setFormData({ ...formData, collectorId: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collector..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No collector</SelectItem>
                    {collectors.map(collector => (
                      <SelectItem key={collector.id} value={collector.id}>
                        {collector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Customer'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Location (for route optimization)</Label>
                <MapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                  height="250px"
                />
              </div>

              <div className="space-y-2">
                <Label>Assign to Collector</Label>
                <Select value={formData.collectorId || "none"} onValueChange={(v) => setFormData({ ...formData, collectorId: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collector..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No collector</SelectItem>
                    {collectors.map(collector => (
                      <SelectItem key={collector.id} value={collector.id}>
                        {collector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.
              </p>

              {selectedCustomer && selectedCustomer.totalOutstanding > 0 && (
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <p className="text-sm text-warning font-medium">
                    Warning: This customer has {formatCurrency(selectedCustomer.totalOutstanding)} outstanding balance.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Customer'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
