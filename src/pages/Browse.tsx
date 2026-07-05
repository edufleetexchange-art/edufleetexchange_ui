import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { VehicleCard } from '@/components/VehicleCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Sliders, Filter, Loader2, AlertCircle } from 'lucide-react';
import { useVehicles } from '@/hooks/useApi';
import { useConfig } from '@/context/ConfigContext';
import type { Vehicle } from '@/api/types';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkBrowseLimit } from '@/api/services/subscriptionEnforcement';
import { mxPaperCard, mxEmptyPanel, mxLabel, mxBtnInk, mxBtnOutline, mxInput } from '@/lib/meridian';

const ALL_FILTER = '__all__';

export function Browse() {
  const { account: user, subscription } = useAuth();
  const { categories } = useConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  // Redirect vendors away from vehicle browse
  useEffect(() => {
    if (user?.role === 'vendor') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [browseLimitReached, setBrowseLimitReached] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Vehicle filters
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<string>(ALL_FILTER);
  const [manufacturerFilter, setManufacturerFilter] = useState<string>(ALL_FILTER);
  const [yearFilter, setYearFilter] = useState<string>(ALL_FILTER);
  const [conditionFilter, setConditionFilter] = useState<string>(ALL_FILTER);

  // Enforce browse quota on mount — only for authenticated users.
  // Guests browse the public catalogue freely; quotas apply once logged in.
  useEffect(() => {
    if (!user) return;
    checkBrowseLimit().then((result) => {
      if (result.data?.allowed === false) {
        setBrowseLimitReached(true);
      }
    });
  }, [user]);

  // Fetch vehicles
  const { vehicles: allVehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles({
    status: 'approved',
  });

  // Extract unique vehicle filter values
  const manufacturers = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.manufacturer))),
    [allVehicles]
  );
  const years = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.year))).sort((a, b) => b - a),
    [allVehicles]
  );
  const conditions = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.condition))),
    [allVehicles]
  );
  const types = useMemo(
    () => {
      const vehicleCats = categories.filter(c => c.type === 'vehicle');
      return vehicleCats.map(c => ({ slug: c.slug, name: c.name }));
    },
    [categories]
  );

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle: Vehicle) => {
      const matchesSearch =
        vehicle.title.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
        vehicle.description.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
        vehicle.manufacturer.toLowerCase().includes(vehicleSearchTerm.toLowerCase());

      const matchesType = typeFilter === ALL_FILTER || vehicle.type === typeFilter;
      const matchesManufacturer = manufacturerFilter === ALL_FILTER || vehicle.manufacturer === manufacturerFilter;
      const matchesYear = yearFilter === ALL_FILTER || vehicle.year.toString() === yearFilter;
      const matchesCondition = conditionFilter === ALL_FILTER || vehicle.condition === conditionFilter;

      return matchesSearch && matchesType && matchesManufacturer && matchesYear && matchesCondition;
    });
  }, [allVehicles, vehicleSearchTerm, typeFilter, manufacturerFilter, yearFilter, conditionFilter]);

  const vehicleHasActiveFilters =
    vehicleSearchTerm.trim().length > 0 ||
    typeFilter !== ALL_FILTER ||
    manufacturerFilter !== ALL_FILTER ||
    yearFilter !== ALL_FILTER ||
    conditionFilter !== ALL_FILTER;

  const handleClearVehicleFilters = () => {
    setVehicleSearchTerm('');
    setTypeFilter(ALL_FILTER);
    setManufacturerFilter(ALL_FILTER);
    setYearFilter(ALL_FILTER);
    setConditionFilter(ALL_FILTER);
  };

  // Subscription check — subscription is now a plain Subscription | null
  const activePlanId = subscription?.planId;
  const activePlan = activePlanId ? { price: 0 } : null; // Plans list not in bundle; assume free if planId present
  const isFreePlan = !user || activePlan?.price === 0;
  const hasDelay = isFreePlan;

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
          <h1 className="mx-serif text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3">Browse Vehicles</h1>
          <div className="mb-4 h-1 w-24 bg-gradient-to-r from-[#2FB8AA] via-[#2FB8AA]/60 to-transparent" aria-hidden="true"></div>
          <p className="text-lg text-white/65 max-w-2xl font-light">
            Discover verified used transport vehicles from educational institutions.
          </p>
        </div>
      </section>

      {/* Main Content */}
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

            {!user && allVehicles.length > 0 && (
              <div className="mb-8">
                <Alert variant="default" className="rounded-sm border-[#F0A62B]/45 bg-[#FDF4E1]">
                  <AlertCircle className="h-4 w-4 text-[#A66B00]" />
                  <div className="ml-4 text-[#7A5200]">
                    Photos and prices are free to browse — sign up free to contact sellers and view documents.
                  </div>
                </Alert>
              </div>
            )}

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
                          placeholder="Search vehicles..."
                          value={vehicleSearchTerm}
                          onChange={(e) => setVehicleSearchTerm(e.target.value)}
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
                          {vehicleHasActiveFilters && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearVehicleFilters}
                              className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className={mxLabel}>Vehicle Type</label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                              <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                                <SelectValue placeholder="All Types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ALL_FILTER}>All Types</SelectItem>
                                {types.map((type) => (
                                  <SelectItem key={type.slug} value={type.slug}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <label className={mxLabel}>Manufacturer</label>
                            <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                              <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                                <SelectValue placeholder="All Manufacturers" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ALL_FILTER}>All Manufacturers</SelectItem>
                                {manufacturers.map((mfg) => (
                                  <SelectItem key={mfg} value={mfg}>
                                    {mfg}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <label className={mxLabel}>Year</label>
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                              <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                                <SelectValue placeholder="All Years" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ALL_FILTER}>All Years</SelectItem>
                                {years.map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <label className={mxLabel}>Condition</label>
                            <Select value={conditionFilter} onValueChange={setConditionFilter}>
                              <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                                <SelectValue placeholder="All Conditions" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ALL_FILTER}>All Conditions</SelectItem>
                                {conditions.map((cond) => (
                                  <SelectItem key={cond} value={cond}>
                                    {cond.charAt(0).toUpperCase() + cond.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Vehicles Sidebar — desktop only */}
              <aside className="hidden lg:block lg:w-1/4 space-y-6">
                {/* Search */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Search className="text-[#16857B] w-4 h-4" />
                  </div>
                  <Input
                    placeholder="Search vehicles..."
                    value={vehicleSearchTerm}
                    onChange={(e) => setVehicleSearchTerm(e.target.value)}
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
                    {vehicleHasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearVehicleFilters}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={mxLabel}>Vehicle Type</label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER}>All Types</SelectItem>
                          {types.map((type) => (
                            <SelectItem key={type.slug} value={type.slug}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className={mxLabel}>Manufacturer</label>
                      <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                        <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                          <SelectValue placeholder="All Manufacturers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER}>All Manufacturers</SelectItem>
                          {manufacturers.map((mfg) => (
                            <SelectItem key={mfg} value={mfg}>
                              {mfg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className={mxLabel}>Year</label>
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER}>All Years</SelectItem>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className={mxLabel}>Condition</label>
                      <Select value={conditionFilter} onValueChange={setConditionFilter}>
                        <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
                          <SelectValue placeholder="All Conditions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER}>All Conditions</SelectItem>
                          {conditions.map((cond) => (
                            <SelectItem key={cond} value={cond}>
                              {cond.charAt(0).toUpperCase() + cond.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sidebar Ad */}
                <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
              </aside>

              {/* Vehicles Main Content */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="mb-6 flex flex-col border-b border-[#0B1626]/10 pb-3 sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="mx-serif text-lg text-[#0B1626] font-semibold tracking-tight">
                      Found <span className="text-[#16857B] font-bold">{filteredVehicles.length}</span> {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
                    </p>
                    {vehicleHasActiveFilters && (
                      <p className="mx-mono text-[11px] uppercase tracking-[0.18em] text-[#0B1626]/50">Filtered results</p>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {vehiclesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-[#16857B] animate-spin mb-4" />
                    <p className="text-lg text-[#0B1626]/55">Loading vehicles...</p>
                  </div>
                ) : vehiclesError ? (
                  <div className="text-center py-20 bg-destructive/5 rounded-md border border-destructive/20">
                    <p className="mx-serif text-xl text-destructive font-bold tracking-tight mb-2">Error Loading Vehicles</p>
                    <p className="text-[#0B1626]/60 mb-6">{vehiclesError}</p>
                    <Button className={mxBtnInk} onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                ) : filteredVehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle, index) => (
                      <div key={vehicle.id || (vehicle as any)._id} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <VehicleCard vehicle={vehicle} />
                      </div>
                    ))}
                  </div>
                ) : !vehicleHasActiveFilters ? (
                  <div className={`text-center py-16 ${mxEmptyPanel}`}>
                    <Search className="w-16 h-16 text-[#16857B]/45 mx-auto mb-4" />
                    <p className="mx-serif text-2xl text-[#0B1626] font-semibold tracking-tight mb-2">Be the first to list a vehicle</p>
                    <p className="text-[#0B1626]/60 mb-6 max-w-sm mx-auto">
                      We're onboarding schools in Mysuru — buses, vans and staff cars
                      listed here reach every institute on the platform. Listing is free.
                    </p>
                    <Button asChild className={mxBtnInk}>
                      <Link to="/signup">List your vehicle — free</Link>
                    </Button>
                  </div>
                ) : (
                  <div className={`text-center py-16 ${mxEmptyPanel}`}>
                    <Search className="w-16 h-16 text-[#0B1626]/25 mx-auto mb-4" />
                    <p className="mx-serif text-2xl text-[#0B1626] font-semibold tracking-tight mb-2">No vehicles found</p>
                    <p className="text-[#0B1626]/60 mb-6 max-w-sm mx-auto">
                      Try adjusting your filters or search terms
                    </p>
                    <Button variant="outline" className={mxBtnOutline} onClick={handleClearVehicleFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
      </div>
    </div>
  );
}
