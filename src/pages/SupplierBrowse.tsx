import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierCard } from '@/components/SupplierCard';
import { Card } from '@/components/ui/card';
import { Search, Building2, Filter, Sliders, CheckCircle, Calendar, Users, Award, Mail, Phone, Globe, MapPin, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSuppliers } from '@/api/services/supplierService';
import { Supplier, SupplierFilters } from '@/api/types';
import { useConfig } from '@/context/ConfigContext';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAuth } from '@/context/AuthContext';
import { checkBrowseLimit } from '@/api/services/subscriptionEnforcement';
import { ReviewList } from '@/components/ReviewList';
import { mxPaperCard, mxEmptyPanel, mxLabel, mxBtnInk, mxBtnOutline, mxInput } from '@/lib/meridian';

export function SupplierBrowse() {
  const { account } = useAuth();
  const { categoryLabels } = useConfig();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SupplierFilters>({
    searchTerm: initialQuery,
    category: '',
    isVerified: undefined
  });
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [browseLimitReached, setBrowseLimitReached] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Enforce browse quota on mount — authenticated users only
  useEffect(() => {
    if (!account) return;
    checkBrowseLimit().then((result) => {
      if (result.data?.allowed === false) setBrowseLimitReached(true);
    });
  }, [account]);

  useEffect(() => {
    // Clear previous timer if exists
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer for debounced search
    const timer = setTimeout(() => {
      loadSuppliers();
    }, 300);
    
    setDebounceTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [filters]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await getSuppliers({ ...filters, status: 'approved' });
      // Handle both paginated and array responses
      if (response.data && Array.isArray(response.data.items)) {
        setSuppliers(response.data.items);
      } else if (Array.isArray(response.data)) {
        setSuppliers(response.data);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      toast.error('Failed to load suppliers');
      console.error(error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }));
  };

  const handleVerifiedFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      isVerified: value === 'all' ? undefined : value === 'verified'
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      isVerified: undefined
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.category || filters.isVerified !== undefined;

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#0B1626]">
      {/* Hero Section — ink-navy ledger band (Meridian Exchange) */}
      <section className="relative overflow-hidden bg-[#081120] py-12 text-white md:py-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 mx-grid-ink [mask-image:linear-gradient(to_right,transparent,black_45%)]"></div>
          <div className="absolute -right-28 -top-48 h-[420px] w-[420px] rounded-full bg-[#16857B]/20 blur-[110px]"></div>
          <div className="mx-rotate absolute -right-28 -top-44 h-[380px] w-[380px]">
            <div className="absolute inset-0 rounded-full border border-white/10"></div>
            <div className="absolute inset-[16%] rounded-full border border-[#2FB8AA]/35"></div>
            <div className="absolute inset-[34%] rounded-full border-2 border-[#F0A62B]/40"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.12] to-transparent"></div>
          </div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="mx-serif text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3 flex items-center gap-3">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-white/25 bg-white/[0.04] md:h-16 md:w-16" aria-hidden="true">
              <Building2 className="w-8 h-8 md:w-9 md:h-9 text-[#F0A62B]" />
            </span>
            Suppliers Directory
          </h1>
          <div className="mb-4 h-1 w-24 bg-gradient-to-r from-[#2FB8AA] via-[#2FB8AA]/60 to-transparent" aria-hidden="true"></div>
          <p className="text-lg text-white/65 max-w-2xl font-light">
            Connect with verified education-related suppliers and service providers for your institution.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {browseLimitReached && (
          <div className="mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Monthly browse limit reached</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                <span>You've reached your monthly browse limit. Upgrade your plan to see more listings.</span>
                <a
                  href="/#pricing"
                  className="inline-flex items-center justify-center rounded-md bg-destructive-foreground text-destructive px-4 py-1.5 text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Upgrade Plan
                </a>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Top Ad */}
        <div className="mb-8">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter trigger */}
          <div className="lg:hidden mb-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 rounded-sm border-[#0B1626]/20 bg-white text-[#0B1626] shadow-none hover:bg-[#FDF4E1] hover:text-[#0B1626]">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Search className="text-[#16857B] w-4 h-4" />
                    </div>
                    <Input
                      placeholder="Search suppliers..."
                      value={filters.searchTerm}
                      onChange={e => handleSearch(e.target.value)}
                      className={`pl-9 ${mxInput}`}
                    />
                  </div>
                  {/* Filters Card */}
                  <div className={`p-6 ${mxPaperCard}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#16857B]" />
                        <h3 className="mx-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B1626]/70">Filters</h3>
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className={mxLabel}>Category</label>
                        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
                          <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={mxLabel}>Verification</label>
                        <Select
                          value={
                            filters.isVerified === undefined
                              ? 'all'
                              : filters.isVerified
                              ? 'verified'
                              : 'unverified'
                          }
                          onValueChange={handleVerifiedFilter}
                        >
                          <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                            <SelectValue placeholder="All Suppliers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Suppliers</SelectItem>
                            <SelectItem value="verified">Verified Only</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block lg:w-1/4 space-y-6">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Search className="text-[#16857B] w-4 h-4" />
              </div>
              <Input
                placeholder="Search suppliers..."
                value={filters.searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className={`pl-9 ${mxInput}`}
              />
            </div>

            {/* Filters Card */}
            <div className={`p-6 ${mxPaperCard}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#16857B]" />
                  <h3 className="mx-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B1626]/70">Filters</h3>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={mxLabel}>Category</label>
                  <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className={mxLabel}>Verification</label>
                  <Select
                    value={
                      filters.isVerified === undefined
                        ? 'all'
                        : filters.isVerified
                        ? 'verified'
                        : 'unverified'
                    }
                    onValueChange={handleVerifiedFilter}
                  >
                    <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                      <SelectValue placeholder="All Suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sidebar Ad */}
            <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex flex-col border-b border-[#0B1626]/10 pb-3 sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="mx-serif text-lg text-[#0B1626] font-semibold tracking-tight">
                  Found <span className="text-[#16857B] font-bold">{suppliers.length}</span> {suppliers.length === 1 ? 'supplier' : 'suppliers'}
                </p>
                {hasActiveFilters && (
                  <p className="mx-mono text-[11px] uppercase tracking-[0.18em] text-[#0B1626]/50">Filtered results</p>
                )}
              </div>
              <div className="mx-mono text-[10px] uppercase tracking-[0.14em] text-[#16857B] bg-[#16857B]/[0.07] border border-[#16857B]/25 px-3 py-1 rounded-none">
                Showing verified and trusted suppliers
              </div>
            </div>

            {/* Loading & Results */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spinner className="size-8" />
              </div>
            ) : suppliers.length === 0 && !hasActiveFilters ? (
              <div className={`text-center py-16 ${mxEmptyPanel}`}>
                <Filter className="w-12 h-12 text-[#16857B]/45 mx-auto mb-4" />
                <h3 className="mx-serif text-2xl font-semibold tracking-tight mb-2">Be the first supplier here</h3>
                <p className="text-[#0B1626]/60 mb-6 max-w-sm mx-auto">
                  Schools in Mysuru will find uniforms, books, lab equipment and more
                  on this page. Early suppliers get seen first — listing is free.
                </p>
                <Button asChild className={mxBtnInk}>
                  <Link to="/vendor/signup">List your business — free</Link>
                </Button>
              </div>
            ) : suppliers.length === 0 ? (
              <div className={`text-center py-16 ${mxEmptyPanel}`}>
                <Filter className="w-12 h-12 text-[#0B1626]/25 mx-auto mb-4" />
                <h3 className="mx-serif text-2xl font-semibold tracking-tight mb-2">No suppliers found</h3>
                <p className="text-[#0B1626]/60 mb-6">Try adjusting your filters</p>
                <Button variant="outline" className={mxBtnOutline} onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(192px,1fr))] gap-6">
                  {suppliers.map((supplier, index) => (
                    <div key={supplier.id || (supplier as any)._id} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <SupplierCard
                        supplier={supplier}
                        onViewDetails={() => setSelectedSupplier(supplier)}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Inline Ad after results */}
                <div className="mt-8">
                   <AdSlot placement="LP_INLINE_1" variant="banner" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Details Dialog */}
      <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSupplier && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedSupplier.logo ? (
                    <img
                      src={selectedSupplier.logo}
                      alt={selectedSupplier.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {selectedSupplier.name}
                      {selectedSupplier.isVerified && (
                        <span title="Verified"><CheckCircle className="w-5 h-5 text-green-500" /></span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {categoryLabels[selectedSupplier.category] || selectedSupplier.category}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  {selectedSupplier.yearsInBusiness && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedSupplier.yearsInBusiness} years in business</span>
                    </div>
                  )}
                  {selectedSupplier.clientCount && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedSupplier.clientCount}+ clients</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="mx-serif text-lg font-semibold tracking-tight mb-2">About</h4>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.description}</p>
                </div>

                {/* Services */}
                {selectedSupplier.services && selectedSupplier.services.length > 0 && (
                  <div>
                    <h4 className="mx-serif text-lg font-semibold tracking-tight mb-2">Services Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.services.map((service, idx) => (
                        <Badge key={idx} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {selectedSupplier.certifications && selectedSupplier.certifications.length > 0 && (
                  <div>
                    <h4 className="mx-serif text-lg font-semibold tracking-tight mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#F0A62B]" />
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h4 className="mx-serif text-lg font-semibold tracking-tight mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                      <p className="text-sm font-medium">{selectedSupplier.contactPerson}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={`mailto:${selectedSupplier.email}`}
                        className="hover:text-primary smooth-transition"
                      >
                        {selectedSupplier.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={`tel:${selectedSupplier.phone}`}
                        className="hover:text-primary smooth-transition"
                      >
                        {selectedSupplier.phone}
                      </a>
                    </div>
                    {selectedSupplier.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={selectedSupplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary smooth-transition"
                        >
                          {selectedSupplier.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="mx-serif text-lg font-semibold tracking-tight mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#16857B]" />
                    Address
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedSupplier.address.street}
                    <br />
                    {selectedSupplier.address.city}, {selectedSupplier.address.state}{' '}
                    {selectedSupplier.address.pincode}
                    <br />
                    {selectedSupplier.address.country}
                  </p>
                </div>

                {/* Contact Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button className="flex-1" asChild>
                    <a href={`mailto:${selectedSupplier.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`tel:${selectedSupplier.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                </div>

                {/* Reviews */}
                <div className="pt-4 border-t border-border">
                  <h4 className="mx-serif text-lg font-semibold tracking-tight mb-3">Reviews</h4>
                  <ReviewList targetType="supplier" targetId={selectedSupplier.id} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
