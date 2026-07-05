import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/VehicleCard';
import { JobCard } from '@/components/JobCard';
import { SupplierCard } from '@/components/SupplierCard';
import { Skeleton } from '@/components/ui/skeleton';
import { usePriorityListings } from '@/hooks/useApi';
import {
  ArrowRight, MapPin, Search, Truck, Briefcase,
  Building2, GraduationCap, Users, Megaphone,
  BookOpen, Calculator, Calendar
} from 'lucide-react';
import { api } from '@/api';
import { AdSlot } from '@/components/ads/AdSlot';
import { PricingSection } from '@/components/PricingSection';
import { useAuth } from '@/context/AuthContext';

export function Landing() {
  const navigate = useNavigate();
  const { account } = useAuth();
  const isTeacher = account?.role === 'teacher';
  const { listings: priorityListings = [], loading: priorityLoading } = usePriorityListings();

  // Handle hash scroll
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    };
    scrollToHash(); // on mount
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  // State for jobs and suppliers from API
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [featuredSuppliers, setFeaturedSuppliers] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  // Search state
  const [location, setLocation] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured jobs and suppliers on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch top 4 jobs
        const jobsResponse = await api.jobs.getFeaturedJobs(4);
        setFeaturedJobs(jobsResponse.data ?? []);
      } catch (error) {
        console.error('Failed to load jobs:', error);
        setFeaturedJobs([]);
      } finally {
        setJobsLoading(false);
      }

      try {
        // Fetch top 4 suppliers
        const suppliersResponse = await api.suppliers.getSuppliers({ pageSize: 4, page: 1 });
        setFeaturedSuppliers(suppliersResponse.data?.items ?? []);
      } catch (error) {
        console.error('Failed to load suppliers:', error);
        setFeaturedSuppliers([]);
      } finally {
        setSuppliersLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSearch = () => {
    // Route to the right vertical AND carry the query — previously the text
    // was dropped entirely and anything that didn't literally contain "job"
    // (e.g. "Maths Teacher") landed on vehicles with an empty search box.
    const q = searchQuery.trim();
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    const lower = q.toLowerCase();
    const vehicleHit = /\b(bus|van|car|tempo|traveller|vehicle|transport|seater)\b/;
    const supplierHit = /\b(supplier|uniform|books?|stationery|lab|furniture|equipment|textbooks?|sports)\b/;
    if (vehicleHit.test(lower)) {
      navigate('/browse' + qs);
    } else if (supplierHit.test(lower)) {
      navigate('/suppliers' + qs);
    } else {
      // Teachers/jobs are the launch wedge — also the default when the query
      // doesn't clearly name a vehicle or a supply category.
      navigate('/jobs' + qs);
    }
  };

  const quickLinks = [
    { icon: Truck, label: 'School Buses', path: '/browse', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Briefcase, label: 'Teaching Jobs', path: '/jobs', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Building2, label: 'Suppliers', path: '/suppliers', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Users, label: 'Staff Hiring', path: '/jobs', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: GraduationCap, label: 'Institutes', path: '/signup', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: Megaphone, label: 'Advertise', path: '/signup', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: BookOpen, label: 'Books', path: '/suppliers', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Calendar, label: 'Events', path: '/browse', color: 'text-indigo-600', bg: 'bg-indigo-50' }, // Placeholder
  ];

  return (
    <div className="relative min-h-screen bg-[#F3F5F7] text-[#0B1626]">
      <style>{`
        .lp-serif { font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, 'Times New Roman', serif; }
        .lp-mono { font-family: 'Geist Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace; }
        @keyframes lp-drift { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(0, -22px, 0); } }
        .lp-drift { animation: lp-drift 10s ease-in-out infinite; }
        @keyframes lp-rotate { to { transform: rotate(360deg); } }
        .lp-rotate { animation: lp-rotate 150s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lp-drift, .lp-rotate, .lp-anim { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Hero Section — Meridian Exchange: asymmetric ink-navy composition */}
      <section className="relative bg-[#081120] text-white">
        {/* Layered CSS background: cartographic grid + meridian rings + teal aurora */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,180,214,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,180,214,0.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black_30%,transparent_92%)]"></div>
          <div className="lp-drift absolute -left-44 bottom-[-180px] h-[620px] w-[620px] rounded-full bg-[#16857B]/25 blur-[140px]"></div>
          <div className="absolute -top-48 right-[-10%] h-[560px] w-[560px] rounded-full bg-[#13305B]/45 blur-[120px]"></div>
          {/* Signature: meridian instrument rings */}
          <div className="lp-rotate absolute right-[-300px] top-24 h-[560px] w-[560px] md:right-[-160px] lg:right-[-40px] lg:h-[700px] lg:w-[700px]">
            <div className="absolute inset-0 rounded-full border border-white/10"></div>
            <div className="absolute inset-[13%] rounded-full border border-white/[0.13]"></div>
            <div className="absolute inset-[27%] rounded-full border border-[#2FB8AA]/40"></div>
            <div className="absolute inset-[41%] rounded-full border-2 border-[#F0A62B]/45"></div>
            <div className="absolute inset-[55%] rounded-full bg-[#16857B]/30 blur-3xl"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.12] to-transparent"></div>
            <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"></div>
            <div className="absolute left-1/2 top-[13%] h-2 w-2 -translate-x-1/2 rotate-45 bg-[#F0A62B]/80"></div>
            <div className="absolute left-[27%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45 bg-[#7BE8DB]/70"></div>
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 pt-20 md:pt-28 lg:px-6">
          {/* Registry tag */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-sm border border-white/15 bg-white/[0.04] px-4 py-2 md:mb-10">
            <div className="lp-anim h-1.5 w-1.5 rotate-45 animate-pulse bg-[#7BE8DB]"></div>
            <span className="lp-mono whitespace-nowrap text-[10px] tracking-[0.1em] text-white/80 sm:text-[11px] sm:tracking-[0.16em] md:text-xs">Built for India&apos;s educational institutes</span>
          </div>

          {/* Display headline — editorial serif, left rail */}
          <h1 className="lp-serif mb-7 max-w-4xl text-[44px] font-semibold leading-[1.04] tracking-[-0.01em] text-white sm:text-6xl md:mb-9 md:text-7xl md:leading-[0.98] lg:text-[86px]">
            India's Leading
            <br className="md:hidden" />
            <span className="italic text-[#F0A62B]"> Education </span>
            <br />
            <span className="relative inline-block">
              Marketplace
              <span className="absolute -bottom-1.5 left-0 h-1 w-full bg-gradient-to-r from-[#2FB8AA] via-[#2FB8AA]/60 to-transparent md:-bottom-2.5 md:h-1.5" aria-hidden="true"></span>
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-base leading-relaxed text-white/70 md:mb-12 md:text-lg">
            Connect with <span className="border-b border-[#7BE8DB]/50 pb-px font-medium text-white">Vehicles</span>, <span className="border-b border-[#7BE8DB]/50 pb-px font-medium text-white">Jobs</span>, <span className="border-b border-[#7BE8DB]/50 pb-px font-medium text-white">Suppliers</span> & <span className="border-b border-[#7BE8DB]/50 pb-px font-medium text-white">Teachers</span>
            <br className="hidden md:block" />
            <span className="lp-mono mt-4 block text-[11px] uppercase tracking-[0.22em] text-white/45 md:text-xs">The Definitive Resource for Modern Educational Infrastructure</span>
          </p>

          {/* Search counter — hairline-divided paper bar, left-anchored */}
          <div className="flex max-w-3xl flex-col divide-y divide-[#0B1626]/10 overflow-hidden rounded-lg bg-white text-[#0B1626] shadow-[0_36px_80px_-28px_rgba(3,9,20,0.75)] ring-1 ring-white/25 md:flex-row md:items-stretch md:divide-y-0">
            {/* Location Input */}
            <div className="relative md:w-[30%] md:border-r md:border-[#0B1626]/10">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#16857B]">
                <MapPin className="w-[18px] h-[18px]" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent py-4 pl-11 pr-4 text-[15px] font-medium text-[#0B1626] outline-none transition-colors placeholder:font-normal placeholder:text-[#0B1626]/40 focus:bg-[#16857B]/[0.06]"
                placeholder="Bengaluru, India"
              />
            </div>

            {/* Main Search Input */}
            <div className="relative flex-1 md:border-r md:border-[#0B1626]/10">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1626]/45">
                <Search className="w-[18px] h-[18px]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent py-4 pl-11 pr-4 text-[15px] font-medium text-[#0B1626] outline-none transition-colors placeholder:font-normal placeholder:text-[#0B1626]/40 focus:bg-[#16857B]/[0.06]"
                placeholder="Try: School Bus, Math Teacher, Lab Equipment..."
              />
            </div>

            {/* Search Button */}
            <div className="flex items-stretch p-1.5 md:w-40 md:p-2">
              <Button
                onClick={handleSearch}
                variant="default"
                size="lg"
                className="flex h-full min-h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#F0A62B] text-[15px] font-semibold text-[#0B1626] shadow-none transition-colors hover:bg-[#FFB63F] active:scale-[0.99]"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Popular searches — mono index links */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5">
            <span className="lp-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F0A62B]">Popular:</span>
            {['School Buses', 'Teaching Jobs', 'Lab Suppliers', 'Textbooks'].map((term, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(term);
                  handleSearch();
                }}
                className="lp-mono text-xs text-white/65 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-[#F0A62B]"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Exchange counter — hairline-grid quick links band breaking the hero edge */}
          <div className="relative -mb-16 mt-16 md:-mb-20 md:mt-24">
            <div className="overflow-hidden rounded-xl border border-[#0B1626]/15 bg-white text-[#0B1626] shadow-[0_44px_90px_-32px_rgba(3,9,20,0.55)]">
              <div className="flex items-center gap-3 border-b border-[#0B1626]/10 bg-[#F3F5F7] px-4 py-3 md:px-6">
                <span className="h-2 w-2 rotate-45 bg-[#F0A62B]" aria-hidden="true"></span>
                <span className="lp-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0B1626]/75 md:text-[11px]">Explore Everything</span>
              </div>
              <div className="grid grid-cols-4 gap-px bg-[#0B1626]/10 md:grid-cols-8">
                {quickLinks.map((link, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => navigate(link.path)}
                    aria-label={link.label}
                    className="group flex cursor-pointer flex-col items-center gap-2.5 bg-white px-1 py-5 transition-colors hover:bg-[#FDF4E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F0A62B] md:py-7"
                  >
                    <link.icon className="h-6 w-6 text-[#16857B] transition-transform duration-300 group-hover:-translate-y-1 md:h-7 md:w-7" />
                    <span className="text-center text-[11px] font-medium leading-tight text-[#0B1626]/65 transition-colors line-clamp-2 group-hover:text-[#0B1626] md:text-xs">
                      {link.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Ad (Below Hero) */}
      <div className="container mx-auto px-4 pb-8 pt-28 md:pb-10 md:pt-32">
        <AdSlot placement="LP_TOP_BANNER" variant="banner" />
      </div>

          {/* Feature Section 1: Vehicles - Hidden for Teachers + hidden when no listings */}
          {!isTeacher && (priorityLoading || priorityListings.length > 0) && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="container mx-auto px-4 py-12 md:py-16"
            >
              <div className="mb-10 flex flex-col justify-between gap-5 border-t border-[#0B1626]/15 pt-8 sm:flex-row sm:items-end md:mb-12 md:pt-10">
                <div className="flex flex-col gap-2.5">
                  <h2 className="lp-serif flex items-center gap-4 text-3xl font-semibold tracking-tight text-[#0B1626] md:text-[44px] md:leading-none">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[#0B1626]/20 bg-white md:h-12 md:w-12">
                      <Truck className="h-5 w-5 text-[#16857B]" />
                    </span>
                    Premium Vehicles
                  </h2>
                  <p className="lp-mono text-[11px] uppercase tracking-[0.22em] text-[#16857B] md:pl-16">Verified transport options for your institute</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/browse')}
                  className="self-start rounded-none border-0 border-b-2 border-[#0B1626] bg-transparent px-1 pb-2 font-semibold text-[#0B1626] shadow-none transition-colors hover:border-[#F0A62B] hover:bg-transparent hover:text-[#A66B00] sm:self-auto"
                >
                  View All Vehicles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {priorityLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-[380px] rounded-2xl" />
                  ))
                ) : priorityListings.length > 0 ? (
                  priorityListings.slice(0, 4).map((vehicle, idx) => (
                    <motion.div
                      key={vehicle.id || (vehicle as any)._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full"
                    >
                      <VehicleCard vehicle={vehicle} />
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-full border border-dashed border-[#0B1626]/20 bg-white/60 py-14 text-center text-sm text-[#0B1626]/55">No featured listings available</p>
                )}
              </div>
            </motion.section>
          )}

          {/* Feature Section 2: Jobs — hidden when no jobs */}
          {(jobsLoading || featuredJobs.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden bg-[#0B1626] py-16 text-white md:py-24"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,180,214,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,180,214,0.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_right,transparent,black_65%)]"></div>
              <div className="absolute -right-40 -top-48 h-[480px] w-[480px] rounded-full bg-[#16857B]/20 blur-[120px]"></div>
            </div>
            <div className="container relative mx-auto px-4">
              <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end md:mb-12">
                <div className="flex flex-col gap-2.5">
                  <h2 className="lp-serif flex items-center gap-4 text-3xl font-semibold tracking-tight text-white md:text-[44px] md:leading-none">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/25 bg-white/[0.04] md:h-12 md:w-12">
                      <Briefcase className="h-5 w-5 text-[#F0A62B]" />
                    </span>
                    Hot Jobs
                  </h2>
                  <p className="lp-mono text-[11px] uppercase tracking-[0.22em] text-[#7BE8DB] md:pl-16">Exciting career opportunities in top institutes</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/jobs')}
                  className="self-start rounded-none border-0 border-b-2 border-white bg-transparent px-1 pb-2 font-semibold text-white shadow-none transition-colors hover:border-[#F0A62B] hover:bg-transparent hover:text-[#F0A62B] sm:self-auto"
                >
                  Explore Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(192px,1fr))] gap-5 md:gap-6">
                {jobsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-[192px] rounded-xl bg-white/10" />
                  ))
                ) : featuredJobs.length > 0 ? (
                  featuredJobs.map((job, idx) => (
                    <motion.div
                      key={job.id || (job as any)._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                      <JobCard
                        job={job}
                        className="bg-white transition-transform duration-300 hover:-translate-y-1"
                      />
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-full border border-dashed border-white/20 bg-white/[0.04] py-14 text-center text-sm text-white/60">No jobs available</p>
                )}
              </div>
            </div>
          </motion.section>
          )}

          {/* Feature Section 3: Suppliers - Hidden for Teachers + hidden when no suppliers */}
          {!isTeacher && (suppliersLoading || featuredSuppliers.length > 0) && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative py-16 md:py-24"
            >
              <div className="absolute inset-y-0 left-0 right-0 border-y border-[#16857B]/15 bg-[#16857B]/[0.05] md:left-16 md:border-l lg:left-24" aria-hidden="true"></div>
              <div className="container relative mx-auto px-4">
                <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end md:mb-12">
                  <div className="flex flex-col gap-2.5">
                    <h2 className="lp-serif flex items-center gap-4 text-3xl font-semibold tracking-tight text-[#0B1626] md:text-[44px] md:leading-none">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[#16857B]/35 bg-white md:h-12 md:w-12">
                        <Building2 className="h-5 w-5 text-[#16857B]" />
                      </span>
                      Top Suppliers
                    </h2>
                    <p className="lp-mono text-[11px] uppercase tracking-[0.22em] text-[#16857B] md:pl-16">Reliable vendors for all your institute needs</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/suppliers')}
                    className="self-start rounded-none border-0 border-b-2 border-[#0B1626] bg-transparent px-1 pb-2 font-semibold text-[#0B1626] shadow-none transition-colors hover:border-[#F0A62B] hover:bg-transparent hover:text-[#A66B00] sm:self-auto"
                  >
                    Find Suppliers
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(192px,1fr))] gap-5 md:gap-6">
                  {suppliersLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="w-full h-[192px] rounded-xl" />
                    ))
                  ) : featuredSuppliers.length > 0 ? (
                    featuredSuppliers.map((supplier, idx) => (
                      <motion.div
                        key={supplier.id || (supplier as any)._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      >
                        <SupplierCard supplier={supplier} />
                      </motion.div>
                    ))
                  ) : (
                    <p className="col-span-full border border-dashed border-[#16857B]/30 bg-white/60 py-14 text-center text-sm text-[#0B1626]/55">No suppliers available</p>
                  )}
                </div>
              </div>
            </motion.section>
          )}

      {/* Inline Ad */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <AdSlot placement="LP_INLINE_1" variant="banner" />
      </div>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section — the bold amber moment */}
      <section className="relative overflow-hidden bg-[#F0A62B] py-16 text-[#0B1626] md:py-24">
        <div className="absolute inset-x-0 top-0 h-2.5 bg-[repeating-linear-gradient(135deg,#0B1626_0px,#0B1626_5px,transparent_5px,transparent_13px)] opacity-60" aria-hidden="true"></div>
        <div className="absolute inset-x-0 bottom-0 h-2.5 bg-[repeating-linear-gradient(135deg,#0B1626_0px,#0B1626_5px,transparent_5px,transparent_13px)] opacity-60" aria-hidden="true"></div>
        <div className="absolute -right-48 -top-64 h-[620px] w-[620px] rounded-full border-[22px] border-[#0B1626]/[0.08]" aria-hidden="true"></div>
        <div className="absolute -right-20 -top-36 h-[360px] w-[360px] rounded-full border-[14px] border-[#0B1626]/[0.08]" aria-hidden="true"></div>
        <div className="container relative mx-auto grid items-center gap-x-12 gap-y-8 px-4 md:grid-cols-[1fr_auto]">
          <h2 className="lp-serif text-3xl font-semibold tracking-tight text-[#0B1626] md:col-start-1 md:row-start-1 md:text-5xl lg:text-[54px] lg:leading-[1.05] [text-wrap:balance]">List your Business on EduFleet</h2>
          <p className="max-w-2xl text-base leading-relaxed text-[#0B1626]/75 md:col-start-1 md:row-start-2 md:text-lg">
            Reach thousands of educational institutes and students. Join India's fastest growing education marketplace.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="h-14 justify-self-start rounded-none bg-[#0B1626] px-10 font-semibold text-white shadow-[6px_6px_0_rgba(11,22,38,0.25)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#13233A] hover:text-white hover:shadow-[9px_9px_0_rgba(11,22,38,0.25)] md:col-start-2 md:row-span-2 md:row-start-1 md:justify-self-end"
            onClick={() => navigate('/signup')}
          >
            Start Selling Today
          </Button>
        </div>
      </section>
    </div>
  );
}
