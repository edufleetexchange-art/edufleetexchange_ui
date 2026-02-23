import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/api/services/adminService';
import { marketingService } from '@/api/services/marketingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Plus, 
  Building2, 
  Truck, 
  Briefcase, 
  Store,
  History,
  Activity,
  ClipboardList,
  Target,
  UserPlus,
  Send,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LeadCRMDialog } from '@/components/LeadCRMDialog';

export default function MarketingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'leads';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isCRMDialogOpen, setIsCRMDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    instituteName: '',
    type: 'institute' as any,
    notes: '',
    isMarketingOnly: false
  });

  useEffect(() => {
    if (user?.role !== 'marketing' && user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadStats();
    loadLeads();
    loadAuditLogs();
  }, [user]);

  // Sync activeTab with URL search params
  useEffect(() => {
    const tab = searchParams.get('tab') || 'leads';
    setActiveTab(tab);
  }, [location.search]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await marketingService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('Failed to load marketing statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await marketingService.getLeads();
      setLeads(response.data.items);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await marketingService.getAuditLogs();
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketingService.createLead(leadData);
      toast.success(`Lead generated successfully`);
      setIsLeadDialogOpen(false);
      resetLeadForm();
      loadStats();
      loadLeads();
      loadAuditLogs();
    } catch (error: any) {
      toast.error(error.error || 'Failed to create lead');
    }
  };

  const resetLeadForm = () => {
    setLeadData({
      name: '',
      email: '',
      phone: '',
      instituteName: '',
      type: 'institute',
      notes: '',
      isMarketingOnly: false
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/marketing/dashboard?tab=${tab}`, { replace: true });
  };

  const openCRM = (lead: any) => {
    setSelectedLead(lead);
    setIsCRMDialogOpen(true);
  };

  if (loading && !stats) {
    return (
      <div className="p-8">
        <Skeleton className="w-64 h-10 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Target className="w-8 h-8" />
            Marketing Operations
          </h1>
          <p className="text-muted-foreground mt-1">
            Focus: Lead Generation & Acquisition. All other operations moved to Sales.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsLeadDialogOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Generate New Lead
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Generated by you</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Activity className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newLeads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting Sales action</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.contactedLeads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In Sales pipeline</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.closedLeads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Closed by Sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border flex gap-4 overflow-x-auto">
        <button
          onClick={() => handleTabChange('leads')}
          className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
            activeTab === 'leads' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Leads
        </button>
        <button
          onClick={() => handleTabChange('audit')}
          className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
            activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Activity Trail
        </button>
        <button
          onClick={() => handleTabChange('profile')}
          className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
            activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'leads' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Generated Leads</CardTitle>
                <CardDescription>All potential customers you've identified. Sales team will pick these up to close deals.</CardDescription>
              </div>
              <Badge variant="outline" className="h-fit">Total: {leads.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Target Information</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Generated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.length > 0 ? (
                      leads.map((lead) => (
                        <TableRow key={lead._id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="font-semibold text-foreground">{lead.name}</div>
                            {lead.instituteName && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                {lead.instituteName}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize text-[10px] font-bold tracking-tight">
                              {lead.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{lead.email}</div>
                            <div className="text-xs text-muted-foreground">{lead.phone}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              lead.status === 'closed' ? 'success' : 
                              lead.status === 'lost' ? 'destructive' : 
                              lead.status === 'new' ? 'secondary' :
                              'outline'
                            }>
                              {lead.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => openCRM(lead)}
                              title="CRM History"
                            >
                              <MessageSquare className="w-4 h-4 text-primary" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Target className="w-8 h-8 opacity-20" />
                            <p>No leads generated yet. Start identifying potential customers!</p>
                            <Button variant="outline" size="sm" onClick={() => setIsLeadDialogOpen(true)} className="mt-2">
                              Generate First Lead
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'audit' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Your Recent Audit Trail
              </CardTitle>
              <CardDescription>Actions you've performed are tracked for accounting and auditing purposes.</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell className="font-medium">
                            <Badge variant="outline">{log.action.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell>{log.targetType || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate" title={log.details}>
                            {log.details}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-muted/30 p-8 rounded-lg border border-dashed text-center">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">No Actions Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                    All your lead generation actions will be logged here with your Employee ID: <strong>{user?.employeeId}</strong>.
                  </p>
                </div>
              )}
              {user?.role === 'admin' && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/audit-logs')}>
                    View Global Audit Logs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Marketing Specialist Profile</CardTitle>
              <CardDescription>Your personal and professional details within the company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10">
                  <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                    alt={user?.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-primary/5 text-primary border-primary/20">MARKETING SPECIALIST</Badge>
                    <Badge variant="outline">ID: {user?.employeeId}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Company Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-dashed">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">Marketing & Communications</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                      <span className="text-muted-foreground">Reporting Manager</span>
                      <span className="font-medium">Chief Marketing Officer</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                      <span className="text-muted-foreground">Joining Date</span>
                      <span className="font-medium">March 10, 2024</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Activities Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-dashed">
                      <span className="text-muted-foreground">Leads Generated</span>
                      <span className="font-medium">{stats?.totalLeads || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                      <span className="text-muted-foreground">Leads Contacted</span>
                      <span className="font-medium">{stats?.contactedLeads || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                      <span className="text-muted-foreground">Role Scope</span>
                      <span className="font-medium">Lead Generation</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generate Lead Dialog */}
      <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Generate New Lead
            </DialogTitle>
            <CardDescription>Identify a potential customer for the sales team to follow up.</CardDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Lead Type</Label>
                <Select 
                  value={leadData.type} 
                  onValueChange={(value) => setLeadData({...leadData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institute">Institute (School/College)</SelectItem>
                    <SelectItem value="teacher">Teacher / Academician</SelectItem>
                    <SelectItem value="vendor">Vendor / Supplier</SelectItem>
                    <SelectItem value="individual">Individual Buyer/Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={leadData.phone} 
                  onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Contact Person Name</Label>
              <Input 
                id="name" 
                value={leadData.name} 
                onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={leadData.email} 
                onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                required 
              />
            </div>

            {leadData.type === 'institute' && (
              <div className="space-y-2">
                <Label htmlFor="instituteName">Institute Name</Label>
                <Input 
                  id="instituteName" 
                  value={leadData.instituteName} 
                  onChange={(e) => setLeadData({...leadData, instituteName: e.target.value})}
                  required 
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Marketing Notes / Insight</Label>
              <Textarea 
                id="notes" 
                placeholder="Why do you think they are a good lead? (e.g. Budget discussed, Need vehicle for new route...)" 
                value={leadData.notes}
                onChange={(e) => setLeadData({...leadData, notes: e.target.value})}
                className="h-24"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-only" className="text-sm font-semibold">Marketing Cloud Exclusive</Label>
                <p className="text-xs text-muted-foreground">Keep this lead exclusively in Marketing Cloud. Sales team won't see it.</p>
              </div>
              <Switch 
                id="marketing-only" 
                checked={leadData.isMarketingOnly} 
                onCheckedChange={(checked) => setLeadData({...leadData, isMarketingOnly: checked})}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLeadDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Lead</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LeadCRMDialog 
        lead={selectedLead}
        isOpen={isCRMDialogOpen}
        onClose={() => setIsCRMDialogOpen(false)}
      />
    </div>
  );
}
