import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { complaintsApi } from '@/lib/api';
import { MessageSquare, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintsApi.getMine();
      setComplaints(response.complaints || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout title="My Complaints">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Complaints</h1>
            <p className="text-muted-foreground">View and track your submitted complaints</p>
          </div>
          <Button onClick={() => navigate('/submit-complaint')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Complaint
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No complaints yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't submitted any complaints. Click below to submit one.
              </p>
              <Button onClick={() => navigate('/submit-complaint')}>Submit a Complaint</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => {
              const status = statusConfig[complaint.status];
              const priority = priorityConfig[complaint.priority];
              const StatusIcon = status.icon;

              return (
                <Card
                  key={complaint.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedComplaint(selectedComplaint?.id === complaint.id ? null : complaint)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Submitted on {format(new Date(complaint.createdAt), 'MMM d, yyyy h:mm a')}
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
                    <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>

                    {selectedComplaint?.id === complaint.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Full Description</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{complaint.description}</p>
                        </div>

                        {complaint.response && (
                          <div className="bg-muted p-3 rounded-lg">
                            <h4 className="font-medium text-sm mb-1">Admin Response</h4>
                            <p className="text-sm whitespace-pre-wrap">{complaint.response}</p>
                            {complaint.resolvedAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Responded on {format(new Date(complaint.resolvedAt), 'MMM d, yyyy h:mm a')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
