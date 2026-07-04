import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ConfigProvider } from '@/context/ConfigContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { lazy, Suspense } from 'react';
import { Landing } from '@/pages/Landing';
// Heavy authed/admin surfaces are lazy-loaded so anonymous visitors don't
// download dashboards + charting libs (recharts) on first paint.
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ConsultantDashboard = lazy(() => import('@/pages/ConsultantDashboard').then(m => ({ default: m.ConsultantDashboard })));
const ConsultantRoster = lazy(() => import('@/pages/ConsultantRoster').then(m => ({ default: m.ConsultantRoster })));
const ConsultantPlacements = lazy(() => import('@/pages/ConsultantPlacements').then(m => ({ default: m.ConsultantPlacements })));
const ConsultantInterviews = lazy(() => import('@/pages/ConsultantInterviews').then(m => ({ default: m.ConsultantInterviews })));
const ConsultantJobSearch = lazy(() => import('@/pages/ConsultantJobSearch').then(m => ({ default: m.ConsultantJobSearch })));
const ConsultantTeacherSearch = lazy(() => import('@/pages/ConsultantTeacherSearch').then(m => ({ default: m.ConsultantTeacherSearch })));
const TeacherDashboard = lazy(() => import('@/pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const InstituteTeacherSearch = lazy(() => import('@/pages/InstituteTeacherSearch').then(m => ({ default: m.InstituteTeacherSearch })));
const MyAlerts = lazy(() => import('@/pages/MyAlerts').then(m => ({ default: m.MyAlerts })));
const InstituteJobApplications = lazy(() => import('@/pages/InstituteJobApplications').then(m => ({ default: m.InstituteJobApplications })));
const JobEdit = lazy(() => import('@/pages/JobEdit').then(m => ({ default: m.JobEdit })));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview').then(m => ({ default: m.AdminOverview })));
const VehicleManagement = lazy(() => import('@/pages/admin/VehicleManagement').then(m => ({ default: m.VehicleManagement })));
const JobManagement = lazy(() => import('@/pages/admin/JobManagement').then(m => ({ default: m.JobManagement })));
const SupplierManagement = lazy(() => import('@/pages/admin/SupplierManagement').then(m => ({ default: m.SupplierManagement })));
const SubscriptionManagement = lazy(() => import('@/pages/admin/SubscriptionManagement').then(m => ({ default: m.SubscriptionManagement })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminAdLayout = lazy(() => import('@/pages/admin/ads/AdminAdLayout').then(m => ({ default: m.AdminAdLayout })));
const MarketingDashboard = lazy(() => import('@/pages/MarketingDashboard'));
const SalesDashboard = lazy(() => import('@/pages/SalesDashboard'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const AuditLogManagement = lazy(() => import('@/pages/admin/AuditLogManagement'));
const ReportModeration = lazy(() => import('@/pages/admin/ReportModeration'));
const ConsultantManagement = lazy(() => import('@/pages/admin/ConsultantManagement'));
const SalesManagement = lazy(() => import('./pages/admin/SalesManagement'));
const PlacementManagement = lazy(() => import('@/pages/admin/PlacementManagement'));
const VerificationModeration = lazy(() => import('@/pages/admin/VerificationModeration'));
import { Browse } from '@/pages/Browse';
import { ListingDetails } from '@/pages/ListingDetails';
import { JobBrowse } from '@/pages/JobBrowse';
import { JobDetails } from '@/pages/JobDetails';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { TeacherSignup } from '@/pages/TeacherSignup';
import { VendorSignup } from '@/pages/VendorSignup';
import { ConsultantSignup } from '@/pages/ConsultantSignup';
import { SupplierBrowse } from '@/pages/SupplierBrowse';
import { Advertise } from '@/pages/Advertise';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';

// Admin imports
import { AdminLogin } from '@/pages/AdminLogin';

// Ad Management imports
import { AdProvider } from '@/context/AdContext';
import AdDashboard from '@/pages/admin/ads/AdDashboard';
import CreateAd from '@/pages/admin/ads/CreateAd';
import AdManagement from '@/pages/admin/ads/AdManagement';
import AdApprovals from '@/pages/admin/ads/AdApprovals';
import AdAnalytics from '@/pages/admin/ads/AdAnalytics';
import AdRequests from '@/pages/admin/ads/AdRequests';

// Support pages imports
import HelpCenter from '@/pages/support/HelpCenter';
import ContactUs from '@/pages/support/ContactUs';
import FAQ from '@/pages/support/FAQ';

// Legal pages imports
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsOfService from '@/pages/legal/TermsOfService';
import CookiePolicy from '@/pages/legal/CookiePolicy';

function RedirectTeacherJobDetails() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/job/${id ?? ''}`} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ConfigProvider>
            <NotificationProvider>
              <AdProvider>
                <Toaster position="top-right" />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading…</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/vehicle/:id" element={<ListingDetails />} />
                <Route path="/jobs" element={<JobBrowse />} />
                <Route path="/job/:id" element={<JobDetails />} />
                <Route path="/suppliers" element={<SupplierBrowse />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/teacher/signup" element={<TeacherSignup />} />
                <Route path="/vendor/signup" element={<VendorSignup />} />
                <Route path="/consultant/signup" element={<ConsultantSignup />} />
                {/* Legacy teacher job routes — preserved as redirects so bookmarks/links keep working. */}
                <Route path="/teacher/jobs" element={<Navigate to="/jobs" replace />} />
                <Route path="/teacher/job/:id" element={<RedirectTeacherJobDetails />} />
                <Route path="/advertise" element={<Advertise />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Support Routes */}
                <Route path="/support/help" element={<HelpCenter />} />
                <Route path="/support/contact" element={<ContactUs />} />
                <Route path="/support/faq" element={<FAQ />} />

                {/* Legal Routes */}
                <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                <Route path="/legal/terms" element={<TermsOfService />} />
                <Route path="/legal/cookies" element={<CookiePolicy />} />

                {/* Protected Routes - Consultant */}
                <Route
                  path="/consultant/dashboard"
                  element={
                    <ProtectedRoute requiredRole="consultant">
                      <ConsultantDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultant/roster"
                  element={
                    <ProtectedRoute requiredRole="consultant">
                      <ConsultantRoster />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultant/placements"
                  element={
                    <ProtectedRoute requiredRole="consultant">
                      <ConsultantPlacements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultant/interviews"
                  element={
                    <ProtectedRoute requiredRole="consultant">
                      <ConsultantInterviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultant/jobs"
                  element={
                    <ProtectedRoute requiredRole="consultant">
                      <ConsultantJobSearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultant/teachers"
                  element={
                    <ProtectedRoute requiredRole="consultant">
                      <ConsultantTeacherSearch />
                    </ProtectedRoute>
                  }
                />

                {/* Demand alerts — buyer-side (institute / consultant / admin) */}
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute requiredRole={['institute', 'consultant', 'admin']}>
                      <MyAlerts />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes - Institute Only */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="institute">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/create-listing"
                  element={
                    <ProtectedRoute requiredRole="institute">
                      <Dashboard initialTab="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/edit-job/:jobId"
                  element={
                    <ProtectedRoute requiredRole="institute">
                      <JobEdit />
                    </ProtectedRoute>
                  }
                />

                {/* Marketing Dashboard */}
                <Route
                  path="/marketing/dashboard"
                  element={
                    <ProtectedRoute requiredRole={['marketing', 'admin']}>
                      <MarketingDashboard />
                    </ProtectedRoute>
                  }
                />
                 {/* Sales Dashboard */}
                <Route
                  path="/sales/dashboard"
                  element={
                    <ProtectedRoute requiredRole={['sales', 'admin']}>
                      <SalesDashboard />
                    </ProtectedRoute>
                  }
                />


                {/* Teacher Routes - Teacher Only */}
                <Route
                  path="/teacher/dashboard"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Institute Routes - Institute Only */}
                <Route
                  path="/institute/teachers"
                  element={
                    <ProtectedRoute requiredRole="institute">
                      <InstituteTeacherSearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/job/:jobId/applications"
                  element={
                    <ProtectedRoute requiredRole="institute">
                      <InstituteJobApplications />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes - Admin Only with Side Navigation */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminOverview />} />
                  <Route path="vehicles/:type" element={<VehicleManagement />} />
                  <Route path="suppliers/:type" element={<SupplierManagement />} />
                  <Route path="jobs" element={<JobManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="audit-logs" element={<AuditLogManagement />} />
                  <Route path="reports" element={<ReportModeration />} />
                  <Route path="verifications" element={<VerificationModeration />} />
                  <Route path="subscriptions" element={<SubscriptionManagement />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="consultants" element={<ConsultantManagement />} />
                  <Route path="sales" element={<SalesManagement />} />
                  <Route path="placements" element={<PlacementManagement />} />
                </Route>

                {/* Admin Ad Management Routes - Separate Layout */}
                <Route path="/admin/ads" element={<ProtectedRoute requiredRole="admin"><AdminAdLayout /></ProtectedRoute>}>
                  <Route index element={<AdDashboard />} />
                  <Route path="create" element={<CreateAd />} />
                  <Route path="edit/:id" element={<CreateAd />} />
                  <Route path="manage" element={<AdManagement />} />
                  <Route path="requests" element={<AdRequests />} />
                  <Route path="approvals" element={<AdApprovals />} />
                  <Route path="analytics" element={<AdAnalytics />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
          </AdProvider>
        </NotificationProvider>
      </ConfigProvider>
    </AuthProvider>
  </BrowserRouter>
</ErrorBoundary>
  );
}

export default App;
