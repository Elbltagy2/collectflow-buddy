import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Calendar,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
} from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { toast } from 'sonner';

type ReportType = 'collections' | 'outstanding' | 'performance';

const reportTypes = [
  {
    id: 'collections' as ReportType,
    name: 'Collections Report',
    description: 'Daily/weekly collection summary by collector',
    icon: DollarSign,
  },
  {
    id: 'outstanding' as ReportType,
    name: 'Outstanding Report',
    description: 'Unpaid and overdue invoices by customer',
    icon: FileText,
  },
  {
    id: 'performance' as ReportType,
    name: 'Performance Report',
    description: 'Collector performance and visit statistics',
    icon: TrendingUp,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-EG');
};

export default function ExportReports() {
  const [selectedReport, setSelectedReport] = useState<ReportType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const exportCollectionsReport = async () => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await reportsApi.getCollections(params);
    if (!response.data) throw new Error('No data received');

    const { summary, byCollector } = response.data;

    let csv = 'Collections Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    if (startDate || endDate) {
      csv += `Period: ${startDate || 'All'} to ${endDate || 'All'}\n`;
    }
    csv += '\n';

    // Summary
    csv += 'SUMMARY\n';
    csv += 'Total Collected,Total Cash,Total Fawry,Total Payments\n';
    csv += `${formatCurrency(summary.totalCollected)},${formatCurrency(summary.totalCash)},${formatCurrency(summary.totalFawry)},${summary.totalPayments}\n`;
    csv += '\n';

    // By Collector
    csv += 'BY COLLECTOR\n';
    csv += 'Collector Name,Total Collected,Cash Amount,Fawry Amount,Payment Count\n';
    for (const collector of byCollector) {
      csv += `${collector.collectorName},${formatCurrency(collector.totalCollected)},${formatCurrency(collector.cashAmount)},${formatCurrency(collector.fawryAmount)},${collector.paymentCount}\n`;
    }

    const dateStr = startDate ? `_${startDate}` : '';
    downloadCSV(`collections_report${dateStr}.csv`, csv);
  };

  const exportOutstandingReport = async () => {
    const response = await reportsApi.getOutstanding();
    if (!response.data) throw new Error('No data received');

    const { summary, byCustomer } = response.data;

    let csv = 'Outstanding Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += '\n';

    // Summary
    csv += 'SUMMARY\n';
    csv += 'Total Outstanding,Overdue Amount,Total Invoices,Overdue Invoices\n';
    csv += `${formatCurrency(summary.totalOutstanding)},${formatCurrency(summary.overdueAmount)},${summary.totalInvoices},${summary.overdueInvoices}\n`;
    csv += '\n';

    // By Customer
    csv += 'BY CUSTOMER\n';
    csv += 'Customer Name,Phone,Collector,Outstanding Amount,Invoice Count,Oldest Due Date\n';
    for (const customer of byCustomer) {
      csv += `"${customer.customerName}","${customer.customerPhone || ''}","${customer.collectorName}",${formatCurrency(customer.totalOutstanding)},${customer.invoiceCount},${formatDate(customer.oldestDueDate)}\n`;
    }

    downloadCSV(`outstanding_report_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const exportPerformanceReport = async () => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await reportsApi.getPerformance(params);
    if (!response.data) throw new Error('No data received');

    const { summary, collectors } = response.data;

    let csv = 'Performance Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    if (startDate || endDate) {
      csv += `Period: ${startDate || 'All'} to ${endDate || 'All'}\n`;
    }
    csv += '\n';

    // Summary
    csv += 'SUMMARY\n';
    csv += 'Total Collectors,Total Collected,Average Visit Rate\n';
    csv += `${summary.totalCollectors},${formatCurrency(summary.totalCollected)},${summary.averageVisitRate}%\n`;
    csv += '\n';

    // By Collector
    csv += 'BY COLLECTOR\n';
    csv += 'Rank,Collector Name,Total Collected,Payment Count,Customer Count,Total Visits,Completed Visits,Visit Rate\n';
    for (const collector of collectors) {
      csv += `${collector.rank},"${collector.collectorName}",${formatCurrency(collector.totalCollected)},${collector.paymentCount},${collector.customerCount},${collector.totalVisits},${collector.completedVisits},${collector.visitRate}%\n`;
    }

    const dateStr = startDate ? `_${startDate}` : '';
    downloadCSV(`performance_report${dateStr}.csv`, csv);
  };

  const handleExport = async () => {
    if (!selectedReport) {
      toast.error('Please select a report type');
      return;
    }

    setIsExporting(true);
    try {
      switch (selectedReport) {
        case 'collections':
          await exportCollectionsReport();
          break;
        case 'outstanding':
          await exportOutstandingReport();
          break;
        case 'performance':
          await exportPerformanceReport();
          break;
      }
      toast.success('Report exported successfully');
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedReportInfo = reportTypes.find((r) => r.id === selectedReport);

  return (
    <MainLayout title="Export Reports" subtitle="Download reports in CSV format">
      <div className="space-y-6 animate-fade-in">
        {/* Report Type Selection */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Select Report Type
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            {reportTypes.map((report) => (
              <Card
                key={report.id}
                className={`p-4 cursor-pointer transition-all hover:border-primary ${
                  selectedReport === report.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      selectedReport === report.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Date Range (for applicable reports) */}
        {(selectedReport === 'collections' || selectedReport === 'performance') && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Range (Optional)
            </h3>

            <div className="grid gap-4 md:grid-cols-2 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              Leave empty to include all data
            </p>
          </Card>
        )}

        {/* Export Button */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ready to Export</h3>
              {selectedReportInfo ? (
                <p className="text-sm text-muted-foreground">
                  {selectedReportInfo.name} will be downloaded as CSV
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a report type above to continue
                </p>
              )}
            </div>

            <Button
              size="lg"
              onClick={handleExport}
              disabled={!selectedReport || isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Help Card */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Report Descriptions
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Collections Report</p>
              <p className="text-muted-foreground">
                Shows total amounts collected, broken down by payment method (Cash/Fawry) and by collector.
                Use date filters to view specific periods.
              </p>
            </div>
            <div>
              <p className="font-medium">Outstanding Report</p>
              <p className="text-muted-foreground">
                Lists all customers with unpaid invoices, showing total outstanding amount, number of invoices,
                and oldest due date. Helps identify overdue accounts.
              </p>
            </div>
            <div>
              <p className="font-medium">Performance Report</p>
              <p className="text-muted-foreground">
                Ranks collectors by total collected amount. Includes visit statistics and customer counts
                to evaluate collector productivity.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
