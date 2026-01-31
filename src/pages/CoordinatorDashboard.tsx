import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileCheck, 
  ArrowLeft,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { STATUS_LABELS, type ValidationStatus } from '@/types/petition';

// Mock data for demo
const mockBatches = [
  {
    id: '1',
    name: 'Downtown Collection - Jan 15',
    circulator: 'John Smith',
    sheets: 12,
    totalSignatures: 145,
    valid: 128,
    invalid: 10,
    manual: 7,
    status: 'pending' as const,
    submittedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Riverside District - Jan 14',
    circulator: 'Jane Doe',
    sheets: 8,
    totalSignatures: 96,
    valid: 92,
    invalid: 2,
    manual: 2,
    status: 'approved' as const,
    submittedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    name: 'Hilltown Area - Jan 13',
    circulator: 'Bob Wilson',
    sheets: 15,
    totalSignatures: 180,
    valid: 165,
    invalid: 12,
    manual: 3,
    status: 'mailed' as const,
    submittedAt: '2024-01-13T09:15:00Z',
  },
];

const mockCirculators = [
  { id: '1', name: 'John Smith', email: 'john@example.com', verified: true, sheets: 45, validRate: 88 },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', verified: true, sheets: 32, validRate: 95 },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', verified: true, sheets: 67, validRate: 91 },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', verified: false, sheets: 0, validRate: 0 },
];

const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'mailed' | 'rejected' }) => {
  const config = {
    pending: { label: 'Pending Review', className: 'bg-status-pending text-white' },
    approved: { label: 'Approved', className: 'bg-status-valid text-white' },
    mailed: { label: 'Mailed', className: 'bg-primary text-primary-foreground' },
    rejected: { label: 'Rejected', className: 'bg-status-invalid text-white' },
  };
  
  return (
    <Badge className={config[status].className}>
      {config[status].label}
    </Badge>
  );
};

const CoordinatorDashboard = () => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  // Calculate totals
  const totalSheets = mockBatches.reduce((sum, b) => sum + b.sheets, 0);
  const totalSignatures = mockBatches.reduce((sum, b) => sum + b.totalSignatures, 0);
  const totalValid = mockBatches.reduce((sum, b) => sum + b.valid, 0);
  const totalInvalid = mockBatches.reduce((sum, b) => sum + b.invalid, 0);
  const validationRate = Math.round((totalValid / totalSignatures) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-accent" />
              <span className="font-semibold">Coordinator Dashboard</span>
            </div>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            Web
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSheets}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Signatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSignatures}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-valid" />
                Valid Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-valid">{validationRate}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Pending Batches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {mockBatches.filter(b => b.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Validation Summary</CardTitle>
            <CardDescription>Overall signature validation breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-status-valid font-medium">Valid ({totalValid})</span>
                  <span>{Math.round((totalValid / totalSignatures) * 100)}%</span>
                </div>
                <Progress value={(totalValid / totalSignatures) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-status-invalid font-medium">Invalid ({totalInvalid})</span>
                  <span>{Math.round((totalInvalid / totalSignatures) * 100)}%</span>
                </div>
                <Progress 
                  value={(totalInvalid / totalSignatures) * 100} 
                  className="h-2 [&>div]:bg-status-invalid" 
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-status-manual font-medium">
                    Manual Review ({totalSignatures - totalValid - totalInvalid})
                  </span>
                  <span>
                    {Math.round(((totalSignatures - totalValid - totalInvalid) / totalSignatures) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={((totalSignatures - totalValid - totalInvalid) / totalSignatures) * 100} 
                  className="h-2 [&>div]:bg-status-manual" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="batches" className="space-y-6">
          <TabsList>
            <TabsTrigger value="batches" className="gap-2">
              <FileText className="w-4 h-4" />
              Batches
            </TabsTrigger>
            <TabsTrigger value="circulators" className="gap-2">
              <Users className="w-4 h-4" />
              Circulators
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Batches Tab */}
          <TabsContent value="batches">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Petition Batches</CardTitle>
                    <CardDescription>Review and approve batches for mailing</CardDescription>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Circulator</TableHead>
                      <TableHead className="text-center">Sheets</TableHead>
                      <TableHead className="text-center">Signatures</TableHead>
                      <TableHead className="text-center">Valid</TableHead>
                      <TableHead className="text-center">Invalid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.name}</TableCell>
                        <TableCell>{batch.circulator}</TableCell>
                        <TableCell className="text-center">{batch.sheets}</TableCell>
                        <TableCell className="text-center">{batch.totalSignatures}</TableCell>
                        <TableCell className="text-center text-status-valid font-medium">
                          {batch.valid}
                        </TableCell>
                        <TableCell className="text-center text-status-invalid font-medium">
                          {batch.invalid}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={batch.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {batch.status === 'pending' && (
                              <>
                                <Button size="sm" variant="default">
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-destructive">
                                  Reject
                                </Button>
                              </>
                            )}
                            {batch.status === 'approved' && (
                              <Button size="sm" className="gap-1">
                                <Mail className="w-3 h-3" />
                                Mark Mailed
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Circulators Tab */}
          <TabsContent value="circulators">
            <Card>
              <CardHeader>
                <CardTitle>Circulators</CardTitle>
                <CardDescription>Manage and monitor circulator performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Verified</TableHead>
                      <TableHead className="text-center">Sheets Submitted</TableHead>
                      <TableHead className="text-center">Valid Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCirculators.map((circulator) => (
                      <TableRow key={circulator.id}>
                        <TableCell className="font-medium">{circulator.name}</TableCell>
                        <TableCell>{circulator.email}</TableCell>
                        <TableCell className="text-center">
                          {circulator.verified ? (
                            <CheckCircle2 className="w-5 h-5 text-status-valid mx-auto" />
                          ) : (
                            <Clock className="w-5 h-5 text-status-pending mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">{circulator.sheets}</TableCell>
                        <TableCell className="text-center">
                          {circulator.sheets > 0 ? (
                            <span className={circulator.validRate >= 90 ? 'text-status-valid' : 'text-status-duplicate'}>
                              {circulator.validRate}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Authorization</CardTitle>
                <CardDescription>Authorize payments for mailed batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Payment processing will be available once batches are mailed.</p>
                  <p className="text-sm mt-2">
                    {mockBatches.filter(b => b.status === 'mailed').length} batches ready for payment
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoordinatorDashboard;
