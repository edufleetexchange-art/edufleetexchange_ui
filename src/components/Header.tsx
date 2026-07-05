import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, LayoutDashboard, Megaphone, Bell, Search, UserCircle, Crown } from 'lucide-react';
import { useState } from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function Header() {
  const { account: user, subscription, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboard = (tab?: string) => {
    if (user?.role === 'admin') {
      if (tab === 'profile') {
        navigate('/admin/settings');
      } else {
        navigate('/admin');
      }
    } else if (user?.role === 'marketing') {
      if (tab === 'profile') {
        navigate('/marketing/dashboard?tab=profile');
      } else {
        navigate('/marketing/dashboard');
      }
    } else if (user?.role === 'sales') {
      if (tab === 'profile') {
        navigate('/sales/dashboard?tab=profile');
      } else {
        navigate('/sales/dashboard');
      }
    } else if (user?.role === 'teacher') {
      if (tab === 'profile') {
        navigate('/teacher/dashboard?tab=profile');
      } else {
        navigate('/teacher/dashboard');
      }
    } else if (user?.role === 'consultant') {
      if (tab === 'profile') {
        navigate('/consultant/dashboard?tab=profile');
      } else {
        navigate('/consultant/dashboard');
      }
    } else {
      // Default to institute dashboard for any other role
      if (tab === 'profile') {
        navigate('/dashboard?tab=profile');
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Determine which menu items to show based on user role
  const shouldShowTeacherNav = user?.role === 'teacher';
  const isMarketing = user?.role === 'marketing';
  const isSales = user?.role === 'sales';
  const isCompanyUser = user?.role === 'admin' || isSales || isMarketing;
  // Check if user is vendor to hide specific links
  const isVendor = user?.role === 'vendor';
  const shouldShowInstituteNav = user?.role === 'institute';
  const shouldShowConsultantNav = user?.role === 'consultant';
  const showPromoLinks = !(user?.role === 'institute' || user?.role === 'teacher' || user?.role === 'consultant' || isCompanyUser);

  const handleHeaderSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const performSearch = () => {
    const q = headerSearch.trim();
    if (!q) return;
    const encoded = encodeURIComponent(q);
    const lower = q.toLowerCase();
    // Broader intent classification than just "the word job is in the query".
    const jobKeywords = ['job', 'teacher', 'teaching', 'principal', 'professor', 'tutor', 'lecturer', 'instructor'];
    const supplierKeywords = ['supplier', 'vendor', 'book', 'uniform', 'stationery', 'lab', 'equipment'];
    const vehicleKeywords = ['vehicle', 'bus', 'van', 'transport', 'cab', 'driver'];
    let target = '/browse';
    if (jobKeywords.some((k) => lower.includes(k))) target = '/jobs';
    else if (supplierKeywords.some((k) => lower.includes(k))) target = '/suppliers';
    else if (vehicleKeywords.some((k) => lower.includes(k))) target = '/browse';
    else {
      // No vertical signal — keep the user on whatever section they're already in.
      if (location.pathname.startsWith('/jobs')) target = '/jobs';
      else if (location.pathname.startsWith('/suppliers')) target = '/suppliers';
    }
    navigate(`${target}?q=${encoded}`);
    setHeaderSearch('');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#0B1626]/12 bg-[#F7F8FA]/95 text-[#0B1626] backdrop-blur-xl">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center gap-4">
<Link to="/" className="flex items-center shrink-0 group">
  <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full overflow-hidden">
    <img

      src="/logo.jpeg"

      alt="EduFleet Exchange"
      className="h-full w-full object-cover transition-transform group-hover:scale-105"
    />
  </div>
</Link>

          {/* Marketing Role Badge */}
          {isMarketing && (
            <Badge variant="outline" className="mx-mono hidden sm:flex rounded-none bg-[#16857B]/[0.07] text-[#16857B] border-[#16857B]/30 px-2 py-1 gap-1.5 text-[10px] tracking-[0.12em]">
              <div className="w-1.5 h-1.5 rotate-45 bg-[#16857B] animate-pulse" />
              MARKETING TEAM
            </Badge>
          )}

          {/* Sales Role Badge */}
          {isSales && (
            <Badge variant="outline" className="mx-mono hidden sm:flex rounded-none bg-[#FDF4E1] text-[#A66B00] border-[#F0A62B]/40 px-2 py-1 gap-1.5 text-[10px] tracking-[0.12em]">
              <div className="w-1.5 h-1.5 rotate-45 bg-[#F0A62B] animate-pulse" />
              SALES TEAM
            </Badge>
          )}


          {/* Search Bar - Visible on desktop inner pages */}
          {location.pathname !== '/' && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <input 
                type="text" 
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={handleHeaderSearch}
                placeholder="Search vehicles, jobs, suppliers..." 
                className="w-full pl-11 pr-4 py-2.5 rounded-sm border border-[#0B1626]/20 bg-white focus:border-[#16857B] focus:ring-2 focus:ring-[#16857B]/20 outline-none transition-all placeholder:text-[#0B1626]/40 text-sm"
              />
              <button onClick={performSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16857B] hover:text-[#0B1626] transition-colors">
                <Search className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-7 text-sm font-medium">
              {!shouldShowTeacherNav && !isVendor && !shouldShowConsultantNav && !isCompanyUser && (
                <>
                  <Link to="/browse" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                    <span>Vehicles</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/jobs" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                    <span>Jobs</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/suppliers" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                    <span>Suppliers</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                  </Link>
                  {user?.role === 'institute' && (
                    <Link to="/institute/teachers" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                      <span>Find Teacher</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                    </Link>
                  )}
                  {!isCompanyUser && (
                    <Link to="/#pricing" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                      <span>Pricing</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                    </Link>
                  )}
                  <div className="h-5 w-px bg-[#0B1626]/15"></div>
                </>
              )}
              {isVendor && (
                <>
                  <Link to="/jobs" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                    <span>Jobs</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/suppliers" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                    <span>Suppliers</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                  </Link>
                   {!isCompanyUser && (
                    <Link to="/#pricing" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                      <span>Pricing</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                    </Link>
                  )}
                  <div className="h-5 w-px bg-[#0B1626]/15"></div>
                </>
              )}
              {shouldShowTeacherNav && (
                <Link to="/jobs" className="text-[#0B1626]/70 hover:text-[#0B1626] transition-all relative group">
                  <span>Browse Jobs</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0A62B] transition-all group-hover:w-full"></span>
                </Link>
              )}
              {shouldShowConsultantNav && (
                <>
                  <Link to="/consultant/dashboard" className="text-[#0B1626]/70 hover:text-[#16857B] transition-all">Dashboard</Link>
                  <Link to="/consultant/roster" className="text-[#0B1626]/70 hover:text-[#16857B] transition-all">Roster</Link>
                  <Link to="/consultant/jobs" className="text-[#0B1626]/70 hover:text-[#16857B] transition-all">Jobs</Link>
                  <Link to="/consultant/teachers" className="text-[#0B1626]/70 hover:text-[#16857B] transition-all">Teachers</Link>
                  <Link to="/consultant/placements" className="text-[#0B1626]/70 hover:text-[#16857B] transition-all">Pipeline</Link>
                  <Link to="/consultant/interviews" className="text-[#0B1626]/70 hover:text-[#16857B] transition-all">Interviews</Link>
                </>
              )}
              {showPromoLinks && (
                <>
                  <Link to="/advertise" className="flex items-center gap-1.5 text-[#0B1626]/70 hover:text-[#16857B] transition-all">
                    <Megaphone className="w-4 h-4" />
                    <span>Advertise</span>
                  </Link>
                  <Link to="/signup" className="flex items-center gap-1.5 bg-[#FDF4E1] text-[#A66B00] hover:bg-[#F0A62B] hover:text-[#0B1626] transition-colors font-semibold px-4 py-2 border border-[#F0A62B]/50 hover:border-[#F0A62B] rounded-none">
                    <span className="mx-mono uppercase text-xs tracking-[0.14em]">Free Listing</span>
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <NotificationBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2.5 hover:bg-muted/50 px-2 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 group">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-border/60 group-hover:border-primary/40 transition-all group-hover:scale-105">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium max-w-[100px] truncate text-foreground group-hover:text-primary transition-colors">{user.name}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 shadow-xl border-beam">
                      <div className="px-3 py-2.5 border-b border-border">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-semibold text-foreground truncate max-w-[140px]">{user.name}</div>
                          {subscription?.planId && (
                            <Badge variant="outline" className="text-[10px] h-5 bg-primary/5 text-primary border-primary/20 px-1.5 flex items-center gap-1 border-beam">
                              <Crown className="w-2.5 h-2.5" />
                              {/* TODO: show plan display name once /plans/:id is wired in UI */}
                              {subscription?.status === 'active' ? 'Active' : 'Free'}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                      <DropdownMenuItem onClick={() => handleDashboard()} className="cursor-pointer py-2.5 px-3 hover:bg-primary/5 hover:text-primary transition-colors">
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDashboard('profile')} className="cursor-pointer py-2.5 px-3 hover:bg-primary/5 hover:text-primary transition-colors">
                        <UserCircle className="w-4 h-4 mr-3" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive py-2.5 px-3 hover:bg-destructive/5 transition-colors border-t border-border mt-1">
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-[#0B1626]/70 hover:text-[#0B1626] transition-colors px-3 py-2 underline decoration-transparent decoration-2 underline-offset-8 hover:decoration-[#F0A62B]">Login</Link>
                  <Button
                    onClick={() => navigate('/signup')}
                    size="sm"
                    className="mx-btn-hard rounded-none bg-[#0B1626] text-white hover:bg-[#13233A] font-semibold px-6 py-2.5"
                  >
                    Sign Up Free
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-muted rounded-md transition-colors text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
            {location.pathname !== '/' && (
              <div className="relative mb-4">
                <Input
                  placeholder="Search vehicles, jobs, suppliers..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                  className="pl-10 pr-4"
                />
                <button
                  onClick={performSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {!shouldShowTeacherNav && !isVendor && !shouldShowConsultantNav && !isCompanyUser ? (
                <>
                  <Link to={user?.role === 'institute' ? "/dashboard?tab=listings" : "/browse"} className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                    <span className="font-medium">Vehicles</span>
                  </Link>
                  <Link to="/jobs" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                    <span className="font-medium">Jobs</span>
                  </Link>
                  <Link to="/suppliers" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                    <span className="font-medium">Suppliers</span>
                  </Link>
                  {user?.role === 'institute' && (
                    <Link to="/institute/teachers" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                      <span className="font-medium">Find Teacher</span>
                    </Link>
                  )}
                  {!isCompanyUser && (
                    <Link to="/#pricing" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                      <span className="font-medium">Pricing</span>
                    </Link>
                  )}
                </>
              ) : isVendor ? (
                <>
                   <Link to="/jobs" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                    <span className="font-medium">Jobs</span>
                  </Link>
                  <Link to="/suppliers" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                    <span className="font-medium">Suppliers</span>
                  </Link>
                  {!isCompanyUser && (
                    <Link to="/#pricing" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                      <span className="font-medium">Pricing</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link to="/jobs" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors col-span-2">
                  <span className="font-medium">Browse Jobs</span>
                </Link>
              )}
              {showPromoLinks && (
                <Link to="/advertise" className="flex flex-col items-center justify-center p-4 rounded-sm border border-[#0B1626]/12 bg-white hover:bg-[#FDF4E1] transition-colors">
                  <span className="font-medium">Advertise</span>
                </Link>
              )}
            </div>
            
            <div className="border-t border-border pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                      <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => { handleDashboard(); setMobileMenuOpen(false); }}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  >
                    Login
                  </Button>
                  <Button 
                    className="w-full bg-primary text-primary-foreground" 
                    onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}