import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { StaffProfile } from '@/api/types';
import { salesService, SalesStats, SubscriptionRequest } from '@/api/services/salesService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Users, 
  ArrowUpRight,
  MessageSquare,
  FileText,
  Search,
  Filter,
  Plus,
  UserPlus,
  Building2,
  Briefcase,
  Target,
  Truck,
  Calendar,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ListingForm } from '@/components/ListingForm';
import { JobListingForm } from '@/components/JobListingForm';
import { LeadCRMDialog } from '@/components/LeadCRMDialog';
import { crmService, CRMTask } from '@/api/services/crmService';
import { SupplierForm } from '@/components/SupplierForm';
import { TableWrapper } from '@/components/ui/table-wrapper';

export default function SalesDashboard() {
  const { account: user, profile } = useAuth();
  const staffProfile = profile as StaffProfile | null;
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'pipeline';
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isLeadProcessDialogOpen, setIsLeadProcessDialogOpen] = useState(false);
  const [isCRMDialogOpen, setIsCRMDialogOpen] = useState(false);
  const [isOnboardingDialogOpen, setIsOnboardingDialogOpen] = useState(false);
  const [isListingDialogOpen, setIsListingDialogOpen] = useState(false);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [selectedTargetInstitute, setSelectedTargetInstitute] = useState<any | null>(null);
  const [processNotes, setProcessNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');

  const [onboardingData, setOnboardingData] = useState({
    name: '',
    email: '',
    password: 'EduFleetUser123!',
    role: 'institute' as any,
    instituteName: '',
    companyName: '',
    phone: '',
    planId: ''
  });

  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [institutes, setInstitutes] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role !== 'sales' && user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
    loadLeads();
    loadTasks();
    loadPlans();
    loadInstitutes();
  }, [user]);

  // Sync activeTab with URL search params
  useEffect(() => {
    const tab = searchParams.get('tab') || 'all';
    setActiveTab(tab);
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await salesService.getStats();
      setStats(response.data);
      
      const requestsRes = await salesService.getRequests({ status: activeTab === 'all' ? 'all' : activeTab });
      setRequests(requestsRes.data.items);
    } catch (error) {
      console.error('Failed to load sales data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await salesService.getLeads();
      setLeads(response.data.items);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await crmService.getMyTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const { getActiveSubscriptionPlans } = await import('@/api/services/subscriptionService');
      const response = await getActiveSubscriptionPlans();
      setActivePlans(response.data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const loadInstitutes = async () => {
    try {
      const { adminService } = await import('@/api/services/adminService');
      const response = await adminService.getAllUsers();
      // Filter for institutes only
      const instituteUsers = (response.data || []).filter((u: any) => u.role === 'institute');
      setInstitutes(instituteUsers);
    } catch (error) {
      console.error('Failed to load institutes:', error);
    }
  };

  const handleProcessRequest = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setProcessNotes(request.adminNotes || '');
    setIsProcessDialogOpen(true);
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    try {
      setIsSubmitting(true);
      await salesService.updateRequestStatus(selectedRequest._id, {
        status,
        adminNotes: processNotes
      });
      
      toast.success(`Deal ${status === 'approved' ? 'closed' : 'rejected'} successfully`);
      setIsProcessDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLeadStatus = async (status: string) => {
    if (!selectedLead) return;
    try {
      setIsSubmitting(true);
      await salesService.updateLeadStatus(selectedLead._id, { status, notes: processNotes });
      toast.success('Lead updated successfully');
      setIsLeadProcessDialogOpen(false);
      loadLeads();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await crmService.updateTaskStatus(taskId, status);
      toast.success(`Task marked as ${status}`);
      loadTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleOnboardUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      if (onboardingData.role === 'vendor') {
        // Special handling for vendor if needed, but salesService.createUser handles roles
        // We might want to use salesService.createVendor instead if we want to create both user and supplier profile at once
        await salesService.createVendor({
          name: onboardingData.name,
          email: onboardingData.email,
          companyName: onboardingData.companyName,
          phone: onboardingData.phone,
          planId: onboardingData.planId
        });
      } else {
        await salesService.createUser(onboardingData);
      }
      
      toast.success(`${onboardingData.role.charAt(0).toUpperCase() + onboardingData.role.slice(1)} onboarded successfully`);
      setIsOnboardingDialogOpen(false);
      loadData();
      loadInstitutes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to onboard user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateVendorListing = async (vendorData: any) => {
    try {
      setIsSubmitting(true);
      await salesService.createVendor(vendorData);
      toast.success('Vendor profile created and listed successfully');
      setIsVendorDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create vendor listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/sales/dashboard?tab=${tab}`, { replace: true });
  };

  if (loading && !stats) {
    return (
      <div className="p-8 space-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Sales & Growth Center
          </h1>
          <p className="text-muted-foreground mt-1">Closing deals, onboarding entities, and assisting in listing creation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsOnboardingDialogOpen(true)} variant="outline" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Onboard Entity
          </Button>
          <Button onClick={() => setIsVendorDialogOpen(true)} variant="outline" className="gap-2">
            <Building2 className="w-4 h-4" />
            List Vendor
          </Button>
          <Button onClick={() => setIsListingDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Assisted Listing
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <IndianRupee className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalRevenue.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">From closed deals</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRequests || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Sub requests pending</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Marketing Leads</CardTitle>
            <Target className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.newLeads || 0} are new leads
              <span className="block mt-0.5 opacity-60">(Excludes Marketing Cloud Exclusive leads)</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My CRM Tasks</CardTitle>
            <ClipboardList className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(tasks || []).filter(t => t.status !== 'completed').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending actions</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRequests ? Math.round((stats.approvedRequests / stats.totalRequests) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Request approval rate</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approvedRequests || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total closed deals</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex border-b border-border mb-6 overflow-x-auto">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'all' || activeTab === 'pending' || activeTab === 'approved' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Subscription Pipeline
        </button>
        <button
          onClick={() => handleTabChange('leads')}
          className={`px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'leads' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Marketing Leads
        </button>
        <button
          onClick={() => handleTabChange('tasks')}
          className={`px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'tasks' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          CRM Tasks
        </button>
        <button
          onClick={() => handleTabChange('profile')}
          className={`px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'profile' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Profile
        </button>
      </div>

      {activeTab === 'profile' ? (
        <Card>
          <CardHeader>
            <CardTitle>Sales Professional Profile</CardTitle>
            <CardDescription>Your personal and professional details within the company.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '')}&background=random`}
                  alt={user?.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{user?.name}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">SALES SPECIALIST</Badge>
                  <Badge variant="outline">ID: {staffProfile?.employeeId}</Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Company Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-dashed">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">Direct Sales & Growth</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed">
                    <span className="text-muted-foreground">Reporting Manager</span>
                    <span className="font-medium">Zonal Sales Manager</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed">
                    <span className="text-muted-foreground">Joining Date</span>
                    <span className="font-medium">January 15, 2024</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Performance Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-dashed">
                    <span className="text-muted-foreground">Target Achievement</span>
                    <span className="font-medium text-emerald-600">92% (Quarterly)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed">
                    <span className="text-muted-foreground">Customer Satisfaction</span>
                    <span className="font-medium">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed">
                    <span className="text-muted-foreground">Incentive Tier</span>
                    <span className="font-medium">Gold Member</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : activeTab === 'tasks' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Tasks */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My CRM Tasks</CardTitle>
                    <CardDescription>Tasks assigned to you for lead nurturing.</CardDescription>
                  </div>
                  <Badge variant="outline">{(tasks || []).filter(t => t.status !== 'completed').length} Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(tasks || []).filter(t => t.status !== 'completed').length > 0 ? (
                    (tasks || []).filter(t => t.status !== 'completed').map(task => (
                      <div key={task._id} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/10">
                        <div className={`mt-1 p-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-50 text-red-600' :
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-semibold">{task.title}</h4>
                            <Badge
                              variant={task.priority === 'high' ? 'destructive' : 'outline'}
                              className={`text-[10px] h-5${task.priority === 'medium' ? ' bg-amber-100 text-amber-800' : ''}`}
                            >
                              {task.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          {task.leadId && (
                            <div className="flex items-center gap-2 mt-3 p-2 bg-background rounded border text-xs">
                              <Target className="w-3 h-3 text-primary" />
                              <span className="font-medium">Lead:</span> {task.leadId.name} ({task.leadId.email})
                              <Button 
                                variant="link" 
                                className="h-auto p-0 text-xs text-primary"
                                onClick={() => {
                                  setSelectedLead(task.leadId);
                                  setIsCRMDialogOpen(true);
                                }}
                              >
                                View CRM
                              </Button>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-auto h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>All caught up! No pending tasks.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Stats/Filter */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">Completed Tasks</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    {(tasks || []).filter(t => t.status === 'completed').length > 0 ? (
                      (tasks || []).filter(t => t.status === 'completed').map(task => (
                        <div key={task._id} className="p-4 border-b last:border-0 opacity-60">
                          <h5 className="text-sm font-medium line-through">{task.title}</h5>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Completed {new Date(task.completedAt!).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-6 text-center text-xs text-muted-foreground italic">No completed tasks yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : activeTab === 'leads' ? (
        <Card>
          <CardHeader>
            <CardTitle>Incoming Marketing Leads</CardTitle>
            <CardDescription>Generated by the marketing team. Contact them to close the deal.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                type="search"
                placeholder="Search leads by name, email, phone, institute, type, or status…"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
              />
            </div>
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target Information</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const q = leadSearch.trim().toLowerCase();
                    const filteredLeads = q
                      ? leads.filter((lead) =>
                          [lead.name, lead.email, lead.phone, lead.instituteName, lead.type, lead.status]
                            .filter(Boolean)
                            .some((v: any) => String(v).toLowerCase().includes(q))
                        )
                      : leads;
                    return filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead._id}>
                        <TableCell>
                          <div className="font-semibold">{lead.name}</div>
                          {lead.instituteName && <div className="text-xs text-muted-foreground">{lead.instituteName}</div>}
                          <Badge variant="secondary" className="mt-1 text-[10px] uppercase">{lead.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">{lead.generatedBy?.name}</div>
                          <div className="text-[10px] text-muted-foreground">ID: {lead.generatedBy?.employeeId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{lead.email}</div>
                          <div className="text-xs text-muted-foreground">{lead.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={lead.status === 'lost' ? 'destructive' : 'outline'}
                            className={lead.status === 'closed' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {lead.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsCRMDialogOpen(true);
                              }}
                            >
                              <MessageSquare className="w-3 h-3" />
                              CRM
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setProcessNotes(lead.notes || '');
                                setIsLeadProcessDialogOpen(true);
                              }}
                            >
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No leads from marketing yet.
                      </TableCell>
                    </TableRow>
                  );
                  })()}
                </TableBody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Pipeline</CardTitle>
            <CardDescription>Review and manage incoming subscription requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan Upgrade</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>
                          <div className="font-medium">{request.userId?.instituteName || request.userId?.name}</div>
                          <div className="text-xs text-muted-foreground">{request.userId?.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-[10px] line-through text-muted-foreground">
                            {request.currentPlanId?.displayName}
                          </div>
                          <div className="font-medium text-primary">
                            {request.requestedPlanId?.displayName}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-sm">
                          ₹{request.requestedPlanId?.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={request.status === 'rejected' ? 'destructive' : 'secondary'}
                            className={request.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {request.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === 'pending' && (
                            <Button variant="secondary" size="sm" onClick={() => handleProcessRequest(request)}>
                              Close Deal
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No active requests.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>
      )}

      {/* Process Deal Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'pending' ? 'Close Deal' : 'Deal Details'}
            </DialogTitle>
            <DialogDescription>
              Review the financial request and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Customer</p>
                  <p className="font-semibold">{selectedRequest.userId?.instituteName || selectedRequest.userId?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Contact</p>
                  <p className="font-semibold">{selectedRequest.userId?.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Current Plan</p>
                  <p className="font-medium">{selectedRequest.currentPlanId?.displayName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Requested Plan</p>
                  <p className="font-bold text-primary">{selectedRequest.requestedPlanId?.displayName}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg flex justify-between items-center">
                <span className="font-medium">Total Deal Value:</span>
                <span className="text-2xl font-bold">₹{selectedRequest.requestedPlanId?.price.toLocaleString()}</span>
              </div>

              {selectedRequest.userNotes && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase">Customer Notes</p>
                  <div className="p-3 bg-muted/50 rounded text-sm italic">
                    "{selectedRequest.userNotes}"
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Sales Notes / Internal Comments</Label>
                {selectedRequest.status === 'pending' ? (
                  <Textarea 
                    id="notes"
                    placeholder="Add notes about payment verification or customer communication..."
                    value={processNotes}
                    onChange={(e) => setProcessNotes(e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded text-sm">
                    {selectedRequest.adminNotes || 'No notes added.'}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedRequest?.status === 'pending' ? (
              <>
                <Button 
                  variant="outline" 
                  className="text-rose-500 hover:text-rose-600"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isSubmitting}
                >
                  Reject Request
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Close Deal & Activate'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Process Dialog */}
      <Dialog open={isLeadProcessDialogOpen} onOpenChange={setIsLeadProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
            <DialogDescription>Track communication and progress with this potential customer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Customer</Label>
                <p className="font-medium">{selectedLead?.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-medium">{selectedLead?.phone}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lead Status</Label>
              <Select defaultValue={selectedLead?.status} onValueChange={(val) => handleUpdateLeadStatus(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New / Unassigned</SelectItem>
                  <SelectItem value="contacted">Contacted / Call Done</SelectItem>
                  <SelectItem value="negotiating">Negotiation Started</SelectItem>
                  <SelectItem value="closed">Closed / Deal Won</SelectItem>
                  <SelectItem value="lost">Lost / Deal Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea 
                value={processNotes} 
                onChange={(e) => setProcessNotes(e.target.value)}
                placeholder="Details of the conversation, objections, or next steps..."
                className="h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeadProcessDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => handleUpdateLeadStatus(selectedLead?.status)}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LeadCRMDialog 
        lead={selectedLead}
        isOpen={isCRMDialogOpen}
        onClose={() => setIsCRMDialogOpen(false)}
      />

      {/* Onboarding Dialog */}
      <Dialog open={isOnboardingDialogOpen} onOpenChange={setIsOnboardingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Onboard New Entity
            </DialogTitle>
            <DialogDescription>Create a verified account for a new institute, teacher, or vendor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOnboardUser} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select value={onboardingData.role} onValueChange={(val) => setOnboardingData({...onboardingData, role: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institute">Institute</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="vendor">Vendor / Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planId">Initial Plan</Label>
                <Select value={onboardingData.planId} onValueChange={(val) => setOnboardingData({...onboardingData, planId: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                  <SelectContent>
                    {activePlans.filter(p => p.planType === onboardingData.role).map(plan => (
                      <SelectItem key={plan._id} value={plan._id}>{plan.displayName} (₹{plan.price})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="on-name">Full Name / Contact Person</Label>
              <Input id="on-name" value={onboardingData.name} onChange={(e) => setOnboardingData({...onboardingData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="on-email">Email Address</Label>
              <Input id="on-email" type="email" value={onboardingData.email} onChange={(e) => setOnboardingData({...onboardingData, email: e.target.value})} required />
            </div>
            {onboardingData.role === 'institute' && (
              <div className="space-y-2">
                <Label htmlFor="on-inst">Institute Name</Label>
                <Input id="on-inst" value={onboardingData.instituteName} onChange={(e) => setOnboardingData({...onboardingData, instituteName: e.target.value})} required />
              </div>
            )}
            {onboardingData.role === 'vendor' && (
              <div className="space-y-2">
                <Label htmlFor="on-company">Company Name</Label>
                <Input id="on-company" value={onboardingData.companyName} onChange={(e) => setOnboardingData({...onboardingData, companyName: e.target.value})} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="on-phone">Phone Number</Label>
              <Input id="on-phone" value={onboardingData.phone} onChange={(e) => setOnboardingData({...onboardingData, phone: e.target.value})} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOnboardingDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Onboarding...' : 'Onboard & Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vendor Setup Dialog */}
      <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Vendor Setup & Listing
            </DialogTitle>
            <DialogDescription>Create a vendor profile and list them in the marketplace directory.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Professional Vendor Onboarding</p>
                <p>Use this form to list high-quality verified vendors. This will create their marketplace profile and optionally assign a subscription plan.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign Initial Plan</Label>
                  <Select onValueChange={(val) => setOnboardingData({...onboardingData, planId: val})}>
                    <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                    <SelectContent>
                      {activePlans.filter(p => p.planType === 'vendor').map(plan => (
                        <SelectItem key={plan._id} value={plan._id}>{plan.displayName} (₹{plan.price})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold mb-4">Vendor Details</h3>
                <SupplierForm 
                  onSubmit={(data) => handleCreateVendorListing({...data, planId: onboardingData.planId})}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assisted Listing Dialog */}
      <Dialog open={isListingDialogOpen} onOpenChange={setIsListingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create Assisted Listing
            </DialogTitle>
            <DialogDescription>Help an existing institute list their assets on the platform.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Select Target Institute</Label>
              <Select onValueChange={(val) => {
                const inst = institutes.find(i => i._id === val);
                setSelectedTargetInstitute(inst);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an institute account..." />
                </SelectTrigger>
                <SelectContent>
                  {institutes.map(inst => (
                    <SelectItem key={inst._id} value={inst._id}>
                      {inst.instituteName || inst.name} ({inst.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTargetInstitute && (
              <div className="space-y-8">
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    List Vehicle for {selectedTargetInstitute.instituteName || selectedTargetInstitute.name}
                  </h3>
                  <ListingForm 
                    initialSellerId={selectedTargetInstitute._id} 
                    onSuccess={() => {
                      toast.success('Assisted vehicle listing created');
                      setIsListingDialogOpen(false);
                    }} 
                  />
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Post Job for {selectedTargetInstitute.instituteName || selectedTargetInstitute.name}
                  </h3>
                  <JobListingForm 
                    initialInstituteId={selectedTargetInstitute._id}
                    onSuccess={() => {
                      toast.success('Assisted job posting created');
                      setIsListingDialogOpen(false);
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
