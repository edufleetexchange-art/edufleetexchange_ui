import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { api } from '@/api';
import { useAds } from '@/context/AdContext';
import { Car, Building2, Megaphone, TrendingUp, CreditCard, Users } from 'lucide-react';
import { DashboardSuggestion } from '@/components/DashboardSuggestion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMyListings, useMyJobs } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from 'recharts';
import { metricsService, SignupRow, FunnelRow, DauRow } from '@/api/services/metricsService';

// ---------------------------------------------------------------------------
// Role colours for signup lines
// ---------------------------------------------------------------------------
const ROLE_COLOURS: Record<string, string> = {
  institute: '#6366f1',
  teacher: '#22c55e',
  vendor: '#f59e0b',
  admin: '#ef4444',
  marketing: '#06b6d4',
  sales: '#a855f7',
};

// ---------------------------------------------------------------------------
// Chart skeleton
// ---------------------------------------------------------------------------
function ChartSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-[260px] w-full" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-chart error placeholder
// ---------------------------------------------------------------------------
function ChartError({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Format "2026-05-01" → "May 1"
// ---------------------------------------------------------------------------
function fmtDate(d: string) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Signups line chart
// ---------------------------------------------------------------------------
function SignupsChart() {
  const [data, setData] = useState<SignupRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    metricsService
      .signups(30)
      .then((res) => setData(res.items))
      .catch(() => setError('Failed to load signup trends.'));
  }, []);

  if (!data && !error) return <ChartSkeleton />;
  if (error) return <ChartError message={error} />;

  const formatted = (data ?? []).map((r) => ({ ...r, date: fmtDate(r.date) }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {Object.entries(ROLE_COLOURS).map(([role, colour]) => (
          <Line
            key={role}
            type="monotone"
            dataKey={role}
            stroke={colour}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Approval funnel bar chart
// ---------------------------------------------------------------------------
function ApprovalFunnelChart() {
  const [data, setData] = useState<FunnelRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    metricsService
      .approvalFunnel(30)
      .then((res) => setData(res.items))
      .catch(() => setError('Failed to load approval funnel.'));
  }, []);

  if (!data && !error) return <ChartSkeleton />;
  if (error) return <ChartError message={error} />;

  const formatted = (data ?? []).map((r) => ({ ...r, date: fmtDate(r.date) }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="vehicleSubmitted" name="Vehicle Submitted" fill="#6366f1" stackId="v" />
        <Bar dataKey="vehicleApproved" name="Vehicle Approved" fill="#22c55e" stackId="v" />
        <Bar dataKey="vehicleRejected" name="Vehicle Rejected" fill="#ef4444" stackId="v" />
        <Bar dataKey="supplierSubmitted" name="Supplier Submitted" fill="#a855f7" stackId="s" />
        <Bar dataKey="supplierApproved" name="Supplier Approved" fill="#06b6d4" stackId="s" />
        <Bar dataKey="supplierRejected" name="Supplier Rejected" fill="#f59e0b" stackId="s" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// DAU line chart
// ---------------------------------------------------------------------------
function DauChart() {
  const [data, setData] = useState<DauRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    metricsService
      .activeUsers(7)
      .then((res) => setData(res.items))
      .catch(() => setError('Failed to load active user data.'));
  }, []);

  if (!data && !error) return <ChartSkeleton />;
  if (error) return <ChartError message={error} />;

  const formatted = (data ?? []).map((r) => ({ ...r, date: fmtDate(r.date) }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="activeUsers"
          name="Active Users"
          stroke="#6366f1"
          dot={{ r: 4 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function AdminOverview() {
  const navigate = useNavigate();
  const { account: user, subscription } = useAuth();
  const { ads } = useAds();
  const [supplierStats, setSupplierStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 });
  const [vehicleStats, setVehicleStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, priorityListings: 0 });
  const [subscriptionStats, setSubscriptionStats] = useState<any>(null);

  const isInternalAccount = user?.role === 'admin' || user?.role === 'sales' || user?.role === 'marketing';

  // Data for subscribed users
  const { listings: myListings } = useMyListings(user?.role === 'admin' ? undefined : user?.id);
  const { jobs: myJobs } = useMyJobs();

  useEffect(() => {
    if (isInternalAccount) {
      loadStats();
    }
  }, [isInternalAccount]);

  const loadStats = async () => {
    try {
      const [supplierResponse, vehicleResponse, subscriptionResponse] = await Promise.all([
        api.suppliers.getSupplierStats(),
        api.admin.getStats(),
        api.subscriptions.getGlobalSubscriptionStats()
      ]);
      setSupplierStats(supplierResponse.data);
      const vd = vehicleResponse.data;
      setVehicleStats({
        total: vd.vehicles?.total ?? 0,
        pending: vd.vehicles?.pending ?? 0,
        approved: vd.vehicles?.approved ?? 0,
        rejected: vd.vehicles?.rejected ?? 0,
        priorityListings: vd.vehicles?.priority ?? 0,
      });
      if (subscriptionResponse.success) {
        setSubscriptionStats(subscriptionResponse.data);
      }
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const activeAds = ads.filter(a => a.status === 'active').length;
  const pendingAds = ads.filter(a => a.status === 'pending').length;

  const getSuggestedAction = () => {
    if (supplierStats.pending > 0) {
      return {
        title: "Review Pending Suppliers",
        description: `There are ${supplierStats.pending} new supplier(s) waiting for your approval.`,
        action: "Review Suppliers",
        onClick: () => navigate('/admin/suppliers/pending'),
        variant: 'default' as const
      };
    }
    if (vehicleStats.pending > 0) {
      return {
        title: "Review Pending Vehicle Listings",
        description: `There are ${vehicleStats.pending} new listings waiting for your approval.`,
        action: "Review Now",
        onClick: () => navigate('/admin/vehicles/pending'),
        variant: 'default' as const
      };
    }
    if (pendingAds > 0) {
      return {
        title: "Review Pending Ads",
        description: `There are ${pendingAds} ads waiting for approval.`,
        action: "Review Ads",
        onClick: () => navigate('/admin/ads/approvals'),
        variant: 'default' as const
      };
    }
    return {
      title: "Platform Performance",
      description: "All pending approvals are up to date. Monitor platform activity and manage content.",
      action: "View Analytics",
      onClick: () => navigate('/admin/ads/analytics'),
      variant: 'outline' as const
    };
  };

  const suggestion = getSuggestedAction();

  if (!isInternalAccount) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Partner Overview</h1>
          <p className="text-muted-foreground">Welcome to your management portal, {user?.name}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">My Vehicles</h3>
            </div>
            <p className="text-3xl font-bold">{myListings.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total listings posted</p>
            <Button variant="link" className="px-0 mt-4 h-auto" onClick={() => navigate('/dashboard?tab=listings')}>
              Manage Listings →
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg">My Jobs</h3>
            </div>
            <p className="text-3xl font-bold">{myJobs.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Active job openings</p>
            <Button variant="link" className="px-0 mt-4 h-auto" onClick={() => navigate('/dashboard?tab=jobs')}>
              Manage Jobs →
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Subscription</h3>
            </div>
            <p className="text-xl font-bold capitalize">{subscription?.planId || 'Basic'}</p>
            <p className="text-sm text-muted-foreground mt-1">Current active plan</p>
            <Button variant="link" className="px-0 mt-4 h-auto" onClick={() => navigate('/dashboard?tab=subscription')}>
              View Details →
            </Button>
          </Card>
        </div>

        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-full mt-1">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Quick Tip: Reach more institutes</h3>
              <p className="text-muted-foreground mb-4">
                Did you know that priority listings get 3x more views? Upgrade your plan or boost your listings to appear at the top of search results.
              </p>
              <Button onClick={() => navigate('/advertise')}>Explore Ad Options</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening on your platform.</p>
      </div>

      {/* Suggested Action */}
      {suggestion && <DashboardSuggestion {...suggestion} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Vehicle Listings</p>
          <div className="text-3xl font-bold text-primary mb-2">{vehicleStats.total}</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-600">✓ {vehicleStats.approved} Approved</span>
            <span className="text-amber-600">⏳ {vehicleStats.pending} Pending</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-secondary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Suppliers</p>
          <div className="text-3xl font-bold text-secondary mb-2">{supplierStats.total}</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-600">✓ {supplierStats.approved} Approved</span>
            <span className="text-amber-600">⏳ {supplierStats.pending} Pending</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Megaphone className="w-6 h-6 text-accent" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Active Ads</p>
          <div className="text-3xl font-bold text-accent mb-2">{activeAds}</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-blue-600">📊 {ads.length} Total</span>
            <span className="text-amber-600">⏳ {pendingAds} Pending</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {(vehicleStats as any).users || 0}
          </div>
          <div className="text-xs text-muted-foreground">Registered accounts</div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {subscriptionStats?.subscriptions?.active || 0}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-blue-600">Total: {subscriptionStats?.subscriptions?.total || 0}</span>
            <span className="text-amber-600">⏳ {subscriptionStats?.subscriptions?.expiringSoon || 0} Expiring</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-green-600 font-medium">
              ₹{(subscriptionStats?.revenue?.total || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
          <div className="text-3xl font-bold mb-2">
            ₹{(subscriptionStats?.revenue?.total || 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Platform revenue this month</div>
        </Card>
      </div>

      {/* Trends — tabbed to keep scroll manageable */}
      {user?.role === 'admin' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signups">
              <TabsList className="mb-4">
                <TabsTrigger value="signups">Signups (30d)</TabsTrigger>
                <TabsTrigger value="funnel">Approval Funnel (30d)</TabsTrigger>
                <TabsTrigger value="dau">Active Users (7d)</TabsTrigger>
              </TabsList>

              <TabsContent value="signups">
                <p className="text-sm text-muted-foreground mb-3">
                  New account registrations per day, broken down by role.
                </p>
                <SignupsChart />
              </TabsContent>

              <TabsContent value="funnel">
                <p className="text-sm text-muted-foreground mb-3">
                  Vehicle and supplier submissions vs approvals/rejections per day.
                </p>
                <ApprovalFunnelChart />
              </TabsContent>

              <TabsContent value="dau">
                <p className="text-sm text-muted-foreground mb-3">
                  Distinct accounts that performed at least one audited action per day.
                </p>
                <DauChart />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/vehicles/pending')}
            className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <Car className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Review Vehicles</h3>
            <p className="text-sm text-muted-foreground">{vehicleStats.pending} pending approval</p>
          </button>

          <button
            onClick={() => navigate('/admin/suppliers/pending')}
            className="p-4 border border-border rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all text-left"
          >
            <Building2 className="w-8 h-8 text-secondary mb-2" />
            <h3 className="font-semibold mb-1">Review Suppliers</h3>
            <p className="text-sm text-muted-foreground">{supplierStats.pending} pending approval</p>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 border border-border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Manage Users</h3>
            <p className="text-sm text-muted-foreground">View and manage all accounts</p>
          </button>

          <button
            onClick={() => navigate('/admin/ads')}
            className="p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left"
          >
            <Megaphone className="w-8 h-8 text-accent mb-2" />
            <h3 className="font-semibold mb-1">Manage Ads</h3>
            <p className="text-sm text-muted-foreground">View analytics & approvals</p>
          </button>

          <button
            onClick={() => navigate('/admin/users?action=create-internal')}
            className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <Users className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Create Internal</h3>
            <p className="text-sm text-muted-foreground">Add Admin, Sales, or Marketing</p>
          </button>

          <button
            onClick={() => navigate('/admin/users?action=create-subscriber')}
            className="p-4 border border-border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
          >
            <Users className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold mb-1">Create Subscriber</h3>
            <p className="text-sm text-muted-foreground">Add Institute, Teacher, or Vendor</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
