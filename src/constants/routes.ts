/**
 * Routes Configuration for EduFleet
 * Centralized routing configuration with clear naming and path organization
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  BROWSE: '/browse',
  VEHICLE_DETAILS: (id: string) => `/vehicle/${id}`,
  ADVERTISE: '/advertise',

  // Support Section Routes
  SUPPORT: {
    HELP_CENTER: '/support/help',
    CONTACT_US: '/support/contact',
    FAQ: '/support/faq',
  },

  // Legal Section Routes
  LEGAL: {
    PRIVACY_POLICY: '/legal/privacy',
    TERMS_OF_SERVICE: '/legal/terms',
    COOKIE_POLICY: '/legal/cookies',
  },

  // Admin Routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VEHICLES: '/admin/vehicles',
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_PENDING: '/admin/pending',
  ADMIN_SUPPLIERS: '/admin/suppliers',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_PLANS: '/admin/plans',
  ADMIN_ADS: '/admin/ads',
  ADMIN_JOBS: '/admin/jobs',

  // Institute Dashboard Routes
  DASHBOARD: '/dashboard',
  DASHBOARD_MY_LISTINGS: '/dashboard/my-listings',
  DASHBOARD_CREATE_LISTING: '/dashboard/create-listing',
  DASHBOARD_EDIT_LISTING: (id: string) => `/dashboard/edit-listing/${id}`,
  DASHBOARD_MANAGE: '/dashboard/manage',
  DASHBOARD_PROFILE: '/dashboard/profile',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  DASHBOARD_SUBSCRIPTIONS: '/dashboard/subscriptions',

  // Teacher Routes
  TEACHER_SIGNUP: '/teacher/signup',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  // The teacher-specific job browse/details were consolidated into the public surfaces.
  // These constants now point at the shared routes; legacy URLs still redirect for back-compat.
  TEACHER_JOB_BROWSE: '/jobs',
  TEACHER_JOB_DETAILS: (id: string) => `/job/${id}`,
  TEACHER_MY_APPLICATIONS: '/teacher/applications',
  TEACHER_PROFILE: '/teacher/profile',
  TEACHER_SEARCH: '/teacher/search',

  // Job Routes
  JOBS: '/jobs',
  JOB_DETAILS: (id: string) => `/job/${id}`,
  JOB_APPLICATIONS: '/job-applications',
  INSTITUTE_JOB_APPLICATIONS: '/institute/job-applications',
  INSTITUTE_TEACHER_SEARCH: '/institute/teacher-search',

  // Supplier Routes
  SUPPLIERS: '/suppliers',
  SUPPLIER_DETAILS: (id: string) => `/supplier/${id}`,

  // Other Routes
  ADMIN_LOGIN_PAGE: '/admin-login',
  NOTIFICATIONS: '/notifications',
} as const;

/**
 * Route Categories for Navigation
 * Organized by feature/section for easier menu generation
 */
export const ROUTE_CATEGORIES = {
  PUBLIC_BROWSE: [
    { label: 'Browse Vehicles', path: ROUTES.BROWSE },
    { label: 'Browse Jobs', path: ROUTES.JOBS },
    { label: 'Browse Suppliers', path: ROUTES.SUPPLIERS },
  ],

  SUPPORT: [
    { label: 'Help Center', path: ROUTES.SUPPORT.HELP_CENTER },
    { label: 'Contact Us', path: ROUTES.SUPPORT.CONTACT_US },
    { label: 'FAQ', path: ROUTES.SUPPORT.FAQ },
  ],

  LEGAL: [
    { label: 'Privacy Policy', path: ROUTES.LEGAL.PRIVACY_POLICY },
    { label: 'Terms of Service', path: ROUTES.LEGAL.TERMS_OF_SERVICE },
    { label: 'Cookie Policy', path: ROUTES.LEGAL.COOKIE_POLICY },
  ],

  INSTITUTE_DASHBOARD: [
    { label: 'My Listings', path: ROUTES.DASHBOARD_MY_LISTINGS },
    { label: 'Create Listing', path: ROUTES.DASHBOARD_CREATE_LISTING },
    { label: 'Manage Listings', path: ROUTES.DASHBOARD_MANAGE },
    { label: 'Profile', path: ROUTES.DASHBOARD_PROFILE },
    { label: 'Settings', path: ROUTES.DASHBOARD_SETTINGS },
  ],

  ADMIN: [
    { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD },
    { label: 'Vehicles', path: ROUTES.ADMIN_VEHICLES },
    { label: 'Subscriptions', path: ROUTES.ADMIN_SUBSCRIPTIONS },
    { label: 'Plans', path: ROUTES.ADMIN_PLANS },
    { label: 'Ads', path: ROUTES.ADMIN_ADS },
    { label: 'Jobs', path: ROUTES.ADMIN_JOBS },
  ],
} as const;

/**
 * Export helper function to get footer links
 */
export const FOOTER_LINKS = {
  support: ROUTE_CATEGORIES.SUPPORT,
  legal: ROUTE_CATEGORIES.LEGAL,
};

export default ROUTES;
