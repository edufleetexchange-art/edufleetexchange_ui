import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Building2,
  Megaphone,
  Settings,
  Clock,
  CheckCircle,
  CreditCard,
  Briefcase,
  Users,
  UserPlus,
  History,
  Handshake,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface AdminSidebarProps {
  pendingVehicles: number;
  pendingSuppliers: number;
}

export function AdminSidebar({ pendingVehicles, pendingSuppliers }: AdminSidebarProps) {
  const location = useLocation();
  const { account } = useAuth();

  const isInternalAccount = account?.role === 'admin' || account?.role === 'sales' || account?.role === 'marketing';

  const internalNavItems = [
    {
      title: 'Overview',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      title: 'Vehicles',
      icon: Car,
      children: [
        {
          title: 'Pending Approval',
          path: '/admin/vehicles/pending',
          icon: Clock,
          badge: pendingVehicles
        },
        {
          title: 'All Vehicles',
          path: '/admin/vehicles/all',
          icon: CheckCircle
        }
      ]
    },
    {
      title: 'Jobs',
      icon: Briefcase,
      path: '/admin/jobs'
    },
    {
      title: 'Users',
      icon: Users,
      children: [
        {
          title: 'All Users',
          path: '/admin/users',
          icon: Users
        },
        {
          title: 'Create Internal Account',
          path: '/admin/users?action=create-internal',
          icon: UserPlus
        },
        {
          title: 'Create Subscriber Account',
          path: '/admin/users?action=create-subscriber',
          icon: UserPlus
        }
      ]
    },
    {
      title: 'Sales Team',
      icon: Handshake,
      path: '/admin/sales'
    },
    {
      title: 'Audit Logs',
      icon: History,
      path: '/admin/audit-logs'
    },
    {
      title: 'Reports',
      icon: Flag,
      path: '/admin/reports'
    },
    {
      title: 'Suppliers',
      icon: Building2,
      children: [
        {
          title: 'Pending Approval',
          path: '/admin/suppliers/pending',
          icon: Clock,
          badge: pendingSuppliers
        },
        {
          title: 'All Suppliers',
          path: '/admin/suppliers/all',
          icon: CheckCircle
        }
      ]
    },
    {
      title: 'Ads Management',
      path: '/admin/ads',
      icon: Megaphone
    },
    {
      title: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: CreditCard
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  const subscribedNavItems = [
    {
      title: 'My Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      title: 'My Vehicles',
      path: '/dashboard?tab=listings',
      icon: Car
    },
    {
      title: 'My Jobs',
      path: '/dashboard?tab=jobs',
      icon: Briefcase
    },
    {
      title: 'Subscription',
      path: '/dashboard?tab=subscription',
      icon: CreditCard
    },
    {
      title: 'My Ads',
      path: '/advertise',
      icon: Megaphone
    },
    {
      title: 'Profile Settings',
      path: '/dashboard?tab=profile',
      icon: Settings
    }
  ];

  const navItems = isInternalAccount ? internalNavItems : subscribedNavItems;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center px-6 gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FmxwyRYTs2dcnubQCH6xSOA5OSFz2%2Fimage__9a481536.png?alt=media&token=b799bfcc-670d-46cb-9ea9-b9e521be88f2" 
            alt="EduFleet" 
            className="h-8 w-auto"
          />
          <h2 className="text-lg font-bold text-primary truncate">
            {isInternalAccount ? 'Admin' : 'Partner'}
          </h2>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {account?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{account?.name}</p>
            <p className="text-xs text-muted-foreground truncate uppercase">{account?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                          isActive(child.path)
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <child.icon className="w-4 h-4" />
                          <span>{child.title}</span>
                        </div>
                        {child.badge !== undefined && child.badge > 0 && (
                          <Badge variant={isActive(child.path) ? "secondary" : "default"} className="h-5 min-w-5 px-1.5">
                            {child.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path!}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive(item.path!, item.exact)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>© 2024 EduFleet</p>
          <p className="mt-1">Admin Dashboard</p>
        </div>
      </div>
    </aside>
  );
}
