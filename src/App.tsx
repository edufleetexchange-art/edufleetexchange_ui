import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ConfigProvider } from '@/context/ConfigContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Landing } from '@/pages/Landing';
import { Browse } from '@/pages/Browse';
import { ListingDetails } from '@/pages/ListingDetails';
import { JobBrowse } from '@/pages/JobBrowse';
import { JobDetails } from '@/pages/JobDetails';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';
import { TeacherSignup } from '@/pages/TeacherSignup';
import { VendorSignup } from '@/pages/VendorSignup';
import { TeacherDashboard } from '@/pages/TeacherDashboard';
import { TeacherJobBrowse } from '@/pages/TeacherJobBrowse';
import { TeacherJobDetails } from '@/pages/TeacherJobDetails';
import { TeacherSearch } from '@/pages/TeacherSearch';
import { InstituteTeacherSearch } from '@/pages/InstituteTeacherSearch';
import { InstituteJobApplications } from '@/pages/InstituteJobApplications';
import { SupplierBrowse } from '@/pages/SupplierBrowse';
import { Advertise } from '@/pages/Advertise';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import MarketingDashboard from '@/pages/MarketingDashboard';
import SalesDashboard from '@/pages/SalesDashboard';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';

// Admin imports
import { AdminLogin } from '@/pages/AdminLogin';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminOverview } from '@/pages/admin/AdminOverview';
import { VehicleManagement } from '@/pages/admin/VehicleManagement';
import { JobManagement } from '@/pages/admin/JobManagement';
import { SupplierManagement } from '@/pages/admin/SupplierManagement';
import { SubscriptionManagement } from '@/pages/admin/SubscriptionManagement';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import UserManagement from '@/pages/admin/UserManagement';
import AuditLogManagement from '@/pages/admin/AuditLogManagement';

// Ad Management imports
import { AdProvider } from '@/context/AdContext';
import { AdminAdLayout } from '@/pages/admin/ads/AdminAdLayout';
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
                <Route path="/teacher/jobs" element={<TeacherJobBrowse />} />
                <Route path="/teacher/job/:id" element={<TeacherJobDetails />} />
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
                  <Route path="subscriptions" element={<SubscriptionManagement />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
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
