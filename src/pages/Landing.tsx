import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/JobCard';
import {
  ArrowRight, MapPin, Search, Truck, Building2, Bell,
} from 'lucide-react';
import { api } from '@/api';
import { AdSlot } from '@/components/ads/AdSlot';
import { PricingSection } from '@/components/PricingSection';
import { useAuth } from '@/context/AuthContext';

// Chalkboard identity (matches /schools.html pitch page)
const BOARD = '#1e3a34';
const BOARD_DEEP = '#162b26';
const CHALK = '#faf7ef';
const MARIGOLD = '#e8a020';

export function Landing() {
  const navigate = useNavigate();
  const { account } = useAuth();
  const isTeacher = account?.role === 'teacher';

  // Handle hash scroll (e.g. /#pricing from the header)
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

  // Featured jobs — social proof under the hero, hidden when empty
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    api.jobs
      .getFeaturedJobs(4)
      .then((res) => {
        if (!cancelled) setFeaturedJobs(res.data ?? []);
      })
      .catch((error) => {
        console.error('Failed to load jobs:', error);
        if (!cancelled) setFeaturedJobs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Search state
  const [location, setLocation] = useState('Mysuru');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (queryOverride?: string) => {
    // Route to the right vertical AND carry the query — previously the text
    // was dropped entirely and anything that didn't literally contain "job"
    // (e.g. "Maths Teacher") landed on vehicles with an empty search box.
    const q = (queryOverride ?? searchQuery).trim();
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

  const steps = [
    {
      title: 'Post your vacancy — free',
      body: 'Subject, experience, salary range. Three minutes on your phone, no fees during our Mysuru launch.',
    },
    {
      title: 'Teachers in Mysuru apply',
      body: "See each applicant's subjects, qualifications and experience in one place.",
    },
    {
      title: 'Interview and hire — directly',
      body: 'Applications come with contact details. No middleman, no commission, no placement fee.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7ef] font-sans overflow-x-clip">

      {/* ── Chalkboard hero ─────────────────────────────────────────── */}
      <section
        className="relative text-[#faf7ef]"
        style={{ background: `linear-gradient(168deg, ${BOARD} 0%, ${BOARD_DEEP} 100%)` }}
      >
        {/* faint chalk-dust texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,#faf7ef_0.5px,transparent_0.5px)] [background-size:22px_22px]"
        />

        <div className="container relative mx-auto px-4 pt-14 pb-16 md:pt-24 md:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="animate-in-fade text-[#e8a020] font-semibold text-xs md:text-sm tracking-[0.16em] uppercase mb-5">
              ನಮಸ್ಕಾರ Mysuru&ensp;·&ensp;Teacher hiring, simplified
            </p>

            <h1 className="animate-in-slide-up font-chalk-serif font-bold tracking-normal text-[#faf7ef] text-4xl leading-[1.15] md:text-6xl md:leading-[1.12] mb-6 [text-wrap:balance]">
              Your next teacher is{' '}
              <span className="whitespace-nowrap border-b-[3px] border-[#e8a020] pb-0.5">already looking</span>{' '}
              for you.
            </h1>

            <p className="animate-in-slide-up delay-100 text-[#faf7ef]/85 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-9">
              eduFleet Exchange is a free hiring platform for Mysuru&apos;s schools, coaching
              centres and preschools. Post a vacancy in three minutes — qualified local
              teachers apply directly to you.
            </p>

            {/* CTAs */}
            <div className="animate-in-slide-up delay-150 flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              {isTeacher ? (
                <Button
                  size="lg"
                  onClick={() => navigate('/jobs')}
                  className="w-full sm:w-auto min-h-[52px] px-8 rounded-xl font-bold text-base bg-[#e8a020] hover:bg-[#d4911a] text-[#162b26] shadow-lg"
                >
                  Browse jobs in Mysuru
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/signup')}
                    className="w-full sm:w-auto min-h-[52px] px-8 rounded-xl font-bold text-base bg-[#e8a020] hover:bg-[#d4911a] text-[#162b26] shadow-lg"
                  >
                    Post a job — free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/teacher/signup')}
                    className="w-full sm:w-auto min-h-[52px] px-8 rounded-xl font-semibold text-base bg-transparent border-[#faf7ef]/40 text-[#faf7ef] hover:bg-[#faf7ef]/10 hover:text-[#faf7ef]"
                  >
                    I&apos;m a teacher
                  </Button>
                </>
              )}
            </div>

            {/* Search card */}
            <div className="animate-in-scale delay-200 max-w-2xl mx-auto bg-[#faf7ef] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-2 flex flex-col md:flex-row gap-1.5 text-left">
              <div className="relative md:w-[34%]">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5f7a6e]" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-3 py-3.5 outline-none text-[#22302c] font-medium bg-transparent placeholder:text-[#5f7a6e]/70 rounded-xl focus:bg-[#1e3a34]/5 transition-colors"
                  placeholder="Mysuru"
                  aria-label="City"
                />
              </div>
              <div className="hidden md:block w-px bg-[#dcd6c6] self-stretch my-2" />
              <div className="relative flex-1 border-t border-[#dcd6c6] md:border-t-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5f7a6e]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-3 py-3.5 outline-none text-[#22302c] font-medium bg-transparent placeholder:text-[#5f7a6e]/70 rounded-xl focus:bg-[#1e3a34]/5 transition-colors"
                  placeholder="Try: Maths teacher, school bus, lab supplies…"
                  aria-label="What are you looking for?"
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                className="md:w-36 min-h-[48px] rounded-xl font-bold text-base bg-[#1e3a34] hover:bg-[#162b26] text-[#faf7ef]"
              >
                Search
              </Button>
            </div>

            {/* Popular searches */}
            <div className="animate-in-fade delay-300 mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[#faf7ef]/60 text-xs font-semibold uppercase tracking-wider mr-1">Popular</span>
              {['Maths Teacher', 'Kannada Teacher', 'Preschool Teacher', 'School Bus'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(term);
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-[#faf7ef]/25 text-[#faf7ef]/85 text-sm hover:bg-[#faf7ef]/10 hover:border-[#faf7ef]/45 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* chalk tray */}
          <div aria-hidden="true" className="mt-14 border-b border-dashed border-[#faf7ef]/25 max-w-4xl mx-auto" />
        </div>
      </section>

      {/* ── Featured jobs (social proof — hidden when empty) ───────── */}
      {featuredJobs.length > 0 && (
        <section className="container mx-auto px-4 pt-14">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[#5f7a6e] font-bold text-xs tracking-[0.14em] uppercase mb-1.5">On the board now</p>
                <h2 className="font-chalk-serif font-bold text-[#22302c] text-2xl md:text-3xl tracking-normal">
                  Schools hiring in Mysuru
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/jobs')}
                className="rounded-full border-[#1e3a34]/25 text-[#1e3a34] hover:bg-[#1e3a34]/5 shrink-0"
              >
                All jobs
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredJobs.map((job) => (
                <JobCard
                  key={job.id || (job as any)._id}
                  job={job}
                  className="bg-white"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works for schools ────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#5f7a6e] font-bold text-xs tracking-[0.14em] uppercase mb-1.5">How it works for schools</p>
          <h2 className="font-chalk-serif font-bold text-[#22302c] text-2xl md:text-3xl tracking-normal mb-8">
            Post free. Teachers apply. You hire directly.
          </h2>
          <ol className="bg-white border border-[#dcd6c6] rounded-2xl px-6 md:px-8 py-2 shadow-sm">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={`flex gap-5 py-5 ${i > 0 ? 'border-t border-[#dcd6c6]' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className="font-chalk-serif font-bold text-[#e8a020] text-3xl md:text-4xl leading-none w-9 text-center shrink-0 [font-variant-numeric:tabular-nums] mt-0.5"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-sans font-bold text-[#22302c] text-base md:text-lg tracking-normal mb-1">{step.title}</h3>
                  <p className="text-[#5f7a6e] text-sm md:text-[15px] leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Demand alerts hook ──────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div
          className="max-w-3xl mx-auto rounded-2xl text-[#faf7ef] px-6 py-8 md:px-10 md:py-10 relative overflow-hidden"
          style={{ background: `linear-gradient(168deg, ${BOARD} 0%, ${BOARD_DEEP} 100%)` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,#faf7ef_0.5px,transparent_0.5px)] [background-size:22px_22px]"
          />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-9 h-9 rounded-full bg-[#e8a020]/15 grid place-items-center shrink-0">
                  <Bell className="w-[18px] h-[18px] text-[#e8a020]" />
                </span>
                <p className="text-[#e8a020] font-semibold text-xs tracking-[0.14em] uppercase">Demand alerts — we look for you</p>
              </div>
              <h2 className="font-chalk-serif font-bold text-[#faf7ef] text-xl md:text-2xl tracking-normal mb-2 [text-wrap:balance]">
                Tell us the subject you need.
              </h2>
              <p className="text-[#faf7ef]/80 text-sm md:text-[15px] leading-relaxed max-w-xl">
                The moment a matching teacher registers on eduFleet, you&apos;re notified.
                No more re-asking around every week.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="shrink-0 min-h-[48px] px-6 rounded-xl font-bold bg-[#e8a020] hover:bg-[#d4911a] text-[#162b26]"
            >
              Set up an alert
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Secondary verticals ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#5f7a6e] font-bold text-xs tracking-[0.14em] uppercase mb-4">Also on eduFleet</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/browse"
              className="group bg-white border border-[#dcd6c6] rounded-2xl p-5 flex items-start gap-4 hover:border-[#1e3a34]/40 hover:shadow-md transition-all"
            >
              <span className="w-11 h-11 rounded-xl bg-[#1e3a34]/[0.07] grid place-items-center shrink-0">
                <Truck className="w-5 h-5 text-[#1e3a34]" />
              </span>
              <span>
                <span className="block font-bold text-[#22302c] group-hover:text-[#1e3a34] mb-0.5">School vehicles</span>
                <span className="block text-sm text-[#5f7a6e] leading-relaxed">Buses, vans and transport operators for your institute.</span>
              </span>
              <ArrowRight className="w-4 h-4 text-[#5f7a6e] ml-auto mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/suppliers"
              className="group bg-white border border-[#dcd6c6] rounded-2xl p-5 flex items-start gap-4 hover:border-[#1e3a34]/40 hover:shadow-md transition-all"
            >
              <span className="w-11 h-11 rounded-xl bg-[#1e3a34]/[0.07] grid place-items-center shrink-0">
                <Building2 className="w-5 h-5 text-[#1e3a34]" />
              </span>
              <span>
                <span className="block font-bold text-[#22302c] group-hover:text-[#1e3a34] mb-0.5">Suppliers</span>
                <span className="block text-sm text-[#5f7a6e] leading-relaxed">Books, uniforms, lab equipment and more — from local vendors.</span>
              </span>
              <ArrowRight className="w-4 h-4 text-[#5f7a6e] ml-auto mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Honest launch note ──────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto border-[1.5px] border-dashed border-[#e8a020] bg-[#fdf4e0] rounded-2xl px-6 py-6 md:px-8">
          <h2 className="font-chalk-serif font-bold text-[#22302c] text-lg md:text-xl tracking-normal mb-1.5">
            We&apos;re new, and we&apos;re starting here.
          </h2>
          <p className="text-[#6b5a33] text-sm md:text-[15px] leading-relaxed">
            eduFleet is launching in Mysuru first. The first schools on board get
            founder-level support and shape how the platform grows. If something
            doesn&apos;t work for you, you tell us and we fix it — that&apos;s the deal.
          </p>
        </div>
      </section>

      {/* Banner ad (renders nothing when no campaigns) */}
      <div className="container mx-auto px-4 pb-4">
        <AdSlot placement="LP_TOP_BANNER" variant="banner" />
      </div>

      {/* Pricing — kept for the /#pricing anchor used across the app */}
      <PricingSection />

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section
        className="relative text-[#faf7ef]"
        style={{ background: `linear-gradient(168deg, ${BOARD} 0%, ${BOARD_DEEP} 100%)` }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,#faf7ef_0.5px,transparent_0.5px)] [background-size:22px_22px]"
        />
        <div className="container relative mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-chalk-serif font-bold text-[#faf7ef] text-2xl md:text-4xl tracking-normal mb-3 [text-wrap:balance]">
            Put your vacancy on the board.
          </h2>
          <p className="text-[#faf7ef]/80 mb-8 max-w-xl mx-auto text-sm md:text-base">
            Free for Mysuru&apos;s schools, coaching centres and preschools during launch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto min-h-[52px] px-8 rounded-xl font-bold text-base bg-[#e8a020] hover:bg-[#d4911a] text-[#162b26]"
            >
              Post a job — free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/teacher/signup')}
              className="w-full sm:w-auto min-h-[52px] px-8 rounded-xl font-semibold text-base bg-transparent border-[#faf7ef]/40 text-[#faf7ef] hover:bg-[#faf7ef]/10 hover:text-[#faf7ef]"
            >
              I&apos;m a teacher
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
