import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/api/services/adminService';
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
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import { ListingForm } from '@/components/ListingForm';
import { JobListingForm } from '@/components/JobListingForm';
import { UserPlus } from 'lucide-react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';

export default function MarketingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'institute' as any,
    instituteName: '',
    contactPerson: '',
    phone: '',
    employeeId: user?.employeeId || ''
  });

  useEffect(() => {
    if (user?.role !== 'marketing' && user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Reuse admin stats for overview
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createUser(onboardingData);
      toast.success(`${onboardingData.role} onboarded successfully`);
      setIsOnboardingOpen(false);
      resetOnboardingForm();
      loadStats();
    } catch (error: any) {
      toast.error(error.error || 'Failed to onboard user');
    }
  };

  const resetOnboardingForm = () => {
    setOnboardingData({
      name: '',
      email: '',
      password: '',
      role: 'institute',
      instituteName: '',
      contactPerson: '',
      phone: '',
      employeeId: user?.employeeId || ''
    });
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
          <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Logged in as <span className="font-semibold">{user?.name}</span> (ID: {user?.employeeId})
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsOnboardingOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Onboard New Entity
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Institutes</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform institutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vehicle Listings</CardTitle>
            <Truck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.vehicles?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.vehicles?.pending || 0} pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Openings</CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.jobs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active job posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suppliers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Onboarded suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border flex gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Recent Actions
        </button>
        <button
          onClick={() => setActiveTab('assist-vehicle')}
          className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
            activeTab === 'assist-vehicle' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Assist Vehicle Listing
        </button>
        <button
          onClick={() => setActiveTab('assist-job')}
          className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
            activeTab === 'assist-job' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Assist Job Posting
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Your Recent Audit Trail
              </CardTitle>
              <CardDescription>Actions you've performed are tracked for accounting and auditing purposes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-8 rounded-lg border border-dashed text-center">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">Action History</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                  All your onboarding and listing assistance actions are logged with your Employee ID: <strong>{user?.employeeId}</strong>.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => navigate('/admin/audit-logs')}>
                  View Global Audit Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'assist-vehicle' && (
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <ListingForm onSuccess={() => setActiveTab('overview')} />
          </div>
        )}

        {activeTab === 'assist-job' && (
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <JobListingForm onSuccess={() => setActiveTab('overview')} />
          </div>
        )}
      </div>

      {/* Onboarding Dialog */}
      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Onboard New Entity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOnboardUser} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Type</Label>
                <Select 
                  value={onboardingData.role} 
                  onValueChange={(value) => setOnboardingData({...onboardingData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institute">Institute (School/College)</SelectItem>
                    <SelectItem value="vendor">Vendor (Supplier)</SelectItem>
                    <SelectItem value="teacher">Teacher (Individual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Contact Person Name</Label>
                <Input 
                  id="name" 
                  value={onboardingData.name}
                  onChange={(e) => setOnboardingData({...onboardingData, name: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={onboardingData.email}
                onChange={(e) => setOnboardingData({...onboardingData, email: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={onboardingData.password}
                onChange={(e) => setOnboardingData({...onboardingData, password: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={onboardingData.phone}
                onChange={(e) => setOnboardingData({...onboardingData, phone: e.target.value})}
              />
            </div>

            {onboardingData.role === 'institute' && (
              <div className="space-y-2">
                <Label htmlFor="instituteName">Institute Name</Label>
                <Input 
                  id="instituteName" 
                  value={onboardingData.instituteName}
                  onChange={(e) => setOnboardingData({...onboardingData, instituteName: e.target.value})}
                  required
                />
              </div>
            )}

            <div className="bg-primary/5 p-3 rounded border border-primary/10 text-xs text-primary flex items-start gap-2">
              <ClipboardList className="w-4 h-4 shrink-0 mt-0.5" />
              <p>This action will be logged under your Employee ID: <strong>{user?.employeeId}</strong> for auditing.</p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOnboardingOpen(false)}>Cancel</Button>
              <Button type="submit">Onboard Entity</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
