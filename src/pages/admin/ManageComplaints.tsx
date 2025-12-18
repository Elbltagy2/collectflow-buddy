import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { complaintsApi } from '@/lib/api';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  response?: string;
  resolvedAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  rejected: number;
}

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  IN_REVIEW: { label: 'In Review', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const priorityConfig = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: 'Medium', color: 'bg-orange-100 text-orange-800' },
  HIGH: { label: 'High', color: 'bg-red-100 text-red-800' },
};

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [responseData, setResponseData] = useState({ status: '', response: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        complaintsApi.getAll(filterStatus !== 'all' ? { status: filterStatus } : {}),
        complaintsApi.getStats(),
      ]);
      setComplaints(complaintsRes.complaints || []);
      setStats(statsRes);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponseData({
      status: complaint.status,
      response: complaint.response || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedComplaint) return;

    if (!responseData.status) {
      toast.error('Please select a status');
      return;
    }

    setIsSubmitting(true);
    try {
      await complaintsApi.update(selectedComplaint.id, {
        status: responseData.status,
        response: responseData.response || undefined,
      });
      toast.success('Complaint updated successfully');
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Manage Complaints">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Complaints</h1>
          <p className="text-muted-foreground">Review and respond to user complaints</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{stats.inReview}</div>
                <p className="text-xs text-muted-foreground">In Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Label>Filter by Status:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Complaints List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No complaints found</h3>
              <p className="text-muted-foreground text-center">
                {filterStatus !== 'all' ? 'No complaints with this status' : 'No complaints submitted yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => {
              const status = statusConfig[complaint.status];
              const priority = priorityConfig[complaint.priority];
              const StatusIcon = status.icon;

              return (
                <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          {complaint.user.name} ({complaint.user.role}) -
                          {format(new Date(complaint.createdAt), ' MMM d, yyyy h:mm a')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={priority.color}>{priority.label}</Badge>
                        <Badge className={`${status.color} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{complaint.description}</p>

                    {complaint.response && (
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-sm mb-1">Your Response</h4>
                        <p className="text-sm">{complaint.response}</p>
                      </div>
                    )}

                    <Button onClick={() => handleOpenDialog(complaint)} variant="outline" size="sm">
                      {complaint.status === 'PENDING' ? 'Respond' : 'Update'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Response Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Respond to Complaint</DialogTitle>
              <DialogDescription>
                Update the status and provide a response to the user.
              </DialogDescription>
            </DialogHeader>

            {selectedComplaint && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium text-sm">{selectedComplaint.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedComplaint.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    From: {selectedComplaint.user.name} ({selectedComplaint.user.email})
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={responseData.status}
                    onValueChange={(value) => setResponseData({ ...responseData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_REVIEW">In Review</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Response (Optional)</Label>
                  <Textarea
                    placeholder="Write your response to the user..."
                    value={responseData.response}
                    onChange={(e) => setResponseData({ ...responseData, response: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitResponse} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
