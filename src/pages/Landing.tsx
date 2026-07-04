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
    <div className="min-h-screen bg-background font-sans noise-bg relative">

      {/* Hero Section - Professional Premium Design */}
      <section className="relative pt-24 pb-28 md:pt-36 md:pb-40 overflow-hidden">
        {/* Professional Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://v3b.fal.media/files/b/0a8b3c54/2hCADZMTxkHVX4wRB75ZE.png"
            alt="Educational Marketplace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.97] via-primary/90 to-secondary/85"></div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/60 to-transparent"></div>
        </div>

        {/* Premium Background Elements */}
        <div className="absolute inset-0 opacity-[0.07] z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0.5px,transparent_0.5px)] [background-size:28px_28px]"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[1]" aria-hidden="true">
          <div className="absolute top-10 -left-20 w-[500px] h-[500px] bg-secondary/25 rounded-full blur-[130px] animate-float"></div>
          <div className="absolute bottom-10 -right-20 w-[600px] h-[600px] bg-accent/[0.12] rounded-full blur-[150px] animate-float delay-1000"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-6 text-center">
          {/* Premium Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-full pl-3.5 pr-4 py-1.5 mb-8 md:mb-10 animate-in-fade shadow-lg shadow-black/10">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.9)]"></div>
            <span className="text-white/90 text-xs md:text-sm font-medium tracking-wide">Built for India&apos;s educational institutes</span>
          </div>

          {/* Professional Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 md:mb-8 tracking-tight leading-[1.06] animate-in-slide-up [text-wrap:balance]">
            India's Leading
            <br className="md:hidden" />
            <span className="text-accent-light italic"> Education </span>
            <br />
            <span className="relative inline-block">
              Marketplace
              <span className="absolute -bottom-2.5 md:-bottom-3 left-0 w-full h-[3px] md:h-1 bg-gradient-to-r from-accent via-accent-light to-transparent rounded-full opacity-90" aria-hidden="true"></span>
            </span>
          </h1>

          <p className="text-white/80 mb-10 md:mb-14 text-base md:text-lg lg:text-xl max-w-3xl mx-auto font-normal leading-relaxed animate-in-slide-up delay-100">
            Connect with <span className="font-semibold text-white border-b border-accent/60 pb-px">Vehicles</span>, <span className="font-semibold text-white border-b border-accent/60 pb-px">Jobs</span>, <span className="font-semibold text-white border-b border-accent/60 pb-px">Suppliers</span> & <span className="font-semibold text-white border-b border-accent/60 pb-px">Teachers</span>
            <br className="hidden md:block" />
            <span className="text-white/65 mt-3 block text-sm md:text-base tracking-wide">The Definitive Resource for Modern Educational Infrastructure</span>
          </p>

          {/* Professional Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.45)] p-2 sm:p-2.5 flex flex-col md:flex-row gap-1.5 animate-in-scale delay-200 ring-1 ring-black/[0.06]">
            {/* Location Input */}
            <div className="relative md:w-[28%]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <MapPin className="w-[18px] h-[18px]" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 outline-none text-foreground text-[15px] font-medium bg-transparent placeholder:text-muted-foreground/70 placeholder:font-normal rounded-xl hover:bg-muted/40 focus:bg-muted/50 transition-colors"
                placeholder="Bengaluru, India"
              />
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px bg-border self-stretch my-2.5"></div>

            {/* Main Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-[18px] h-[18px]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-3.5 outline-none text-foreground text-[15px] font-medium bg-transparent placeholder:text-muted-foreground/70 placeholder:font-normal rounded-xl hover:bg-muted/40 focus:bg-muted/50 transition-colors"
                placeholder="Try: School Bus, Math Teacher, Lab Equipment..."
              />
            </div>

            {/* Search Button */}
            <div className="md:w-40 flex items-center">
              <Button
                onClick={handleSearch}
                variant="default"
                size="lg"
                className="w-full font-semibold text-[15px] rounded-xl flex items-center justify-center gap-2 min-h-[52px] shadow-md shadow-accent/25 hover:shadow-lg hover:shadow-accent/30 transition-all active:scale-[0.98] bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Professional Popular Searches */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 animate-in-fade delay-300">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Popular:</span>
            {['School Buses', 'Teaching Jobs', 'Lab Suppliers', 'Textbooks'].map((term, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(term);
                  handleSearch();
                }}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/35 rounded-full text-white/90 hover:text-white text-[13px] font-medium transition-colors duration-200"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Professional Quick Links Card */}
          <div className="max-w-5xl mx-auto mt-20 md:mt-24 animate-in-slide-up delay-400">
            <div className="bg-white rounded-3xl shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.05] px-4 pt-10 pb-7 md:px-10 md:pt-12 md:pb-10 relative">
              <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-light px-7 py-2.5 rounded-full shadow-lg shadow-primary/25 ring-1 ring-white/10 whitespace-nowrap">
                <span className="text-[11px] md:text-xs font-semibold text-white tracking-[0.16em] uppercase">Explore Everything</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-y-7 gap-x-2 md:gap-x-4">
                {quickLinks.map((link, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => navigate(link.path)}
                    aria-label={link.label}
                    className="flex flex-col items-center gap-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl p-1"
                  >
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${link.bg} flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lg group-hover:shadow-black/[0.08] ring-1 ring-black/[0.03]`}>
                      <link.icon className={`w-[22px] h-[22px] md:w-7 md:h-7 ${link.color} transition-transform duration-300 group-hover:scale-110`} />
                    </div>
                    <span className="text-[11px] md:text-[13px] font-medium text-gray-600 text-center group-hover:text-primary transition-colors line-clamp-2 leading-tight">
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
      <div className="container mx-auto px-4 py-10 md:py-12">
        <AdSlot placement="LP_TOP_BANNER" variant="banner" />
      </div>

          {/* Feature Section 1: Vehicles - Hidden for Teachers + hidden when no listings */}
          {!isTeacher && (priorityLoading || priorityListings.length > 0) && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="container mx-auto px-4 py-14 md:py-20"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl md:text-[28px] font-display font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    <span className="inline-flex w-10 h-10 md:w-11 md:h-11 rounded-xl bg-primary/[0.07] ring-1 ring-primary/10 items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 md:w-[22px] md:h-[22px] text-primary" />
                    </span>
                    Premium Vehicles
                  </h2>
                  <p className="text-muted-foreground text-sm md:pl-[52px] lg:pl-14">Verified transport options for your institute</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/browse')}
                  className="rounded-full border-primary/20 text-primary hover:bg-primary/[0.04] hover:border-primary/40 px-6 font-semibold shadow-xs transition-colors self-start sm:self-auto"
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
                  <p className="text-muted-foreground text-sm text-center col-span-full py-14 bg-muted/25 rounded-2xl border border-dashed border-border">No featured listings available</p>
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
            className="bg-slate-50/90 border-y border-slate-200/60 py-14 md:py-20"
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl md:text-[28px] font-display font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    <span className="inline-flex w-10 h-10 md:w-11 md:h-11 rounded-xl bg-orange-500/[0.08] ring-1 ring-orange-500/10 items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 md:w-[22px] md:h-[22px] text-orange-600" />
                    </span>
                    Hot Jobs
                  </h2>
                  <p className="text-muted-foreground text-sm md:pl-[52px] lg:pl-14">Exciting career opportunities in top institutes</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/jobs')}
                  className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 px-6 font-semibold shadow-xs transition-colors self-start sm:self-auto"
                >
                  Explore Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(192px,1fr))] gap-5 md:gap-6">
                {jobsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-[192px] rounded-xl" />
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
                        className="bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                      />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center col-span-full py-14 bg-white/60 rounded-2xl border border-dashed border-slate-200">No jobs available</p>
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
              className="container mx-auto px-4 py-14 md:py-20"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl md:text-[28px] font-display font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    <span className="inline-flex w-10 h-10 md:w-11 md:h-11 rounded-xl bg-green-600/[0.08] ring-1 ring-green-600/10 items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 md:w-[22px] md:h-[22px] text-green-600" />
                    </span>
                    Top Suppliers
                  </h2>
                  <p className="text-muted-foreground text-sm md:pl-[52px] lg:pl-14">Reliable vendors for all your institute needs</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/suppliers')}
                  className="rounded-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 px-6 font-semibold shadow-xs transition-colors self-start sm:self-auto"
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
                  <p className="text-muted-foreground text-sm text-center col-span-full py-14 bg-muted/25 rounded-2xl border border-dashed border-border">No suppliers available</p>
                )}
              </div>
            </motion.section>
          )}

      {/* Inline Ad */}
      <div className="container mx-auto px-4 pb-14 md:pb-16">
        <AdSlot placement="LP_INLINE_1" variant="banner" />
      </div>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light" aria-hidden="true"></div>
        <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0.5px,transparent_0.5px)] [background-size:28px_28px]"></div>
        </div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[320px] bg-secondary/20 rounded-full blur-[130px]" aria-hidden="true"></div>
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white mb-4 md:mb-5 [text-wrap:balance]">List your Business on EduFleet</h2>
          <p className="text-primary-foreground/75 mb-8 md:mb-10 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Reach thousands of educational institutes and students. Join India's fastest growing education marketplace.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="font-semibold px-10 h-12 rounded-full shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/25 hover:-translate-y-0.5 transition-all"
            onClick={() => navigate('/signup')}
          >
            Start Selling Today
          </Button>
        </div>
      </section>
    </div>
  );
}
