import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#081120] text-white mt-20">
      {/* Amber hazard rule + cartographic grid (Meridian Exchange motifs) */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#F0A62B] via-[#F0A62B]/40 to-transparent" aria-hidden="true"></div>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 mx-grid-ink [mask-image:linear-gradient(to_top,black_20%,transparent_90%)]"></div>
        <div className="absolute -bottom-48 -right-40 h-[420px] w-[420px] rounded-full bg-[#16857B]/15 blur-[110px]"></div>
      </div>
      <div className="container relative mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
<Link to="/" className="flex items-center shrink-0 group">
  <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full overflow-hidden ring-1 ring-white/20">
    <img
      src="/logo.jpeg"

      alt="EduFleet Exchange"
      className="h-full w-full object-contain transition-transform group-hover:scale-105"
    />
  </div>
</Link>
            <p className="text-sm text-white/60 leading-relaxed mt-4">
              The complete marketplace for educational institutions. Connect for vehicles, jobs, and supplies.
            </p>
          </div>
          <div>
            <h4 className="mx-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7BE8DB] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTES.HOME} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">Home</Link></li>
              <li><Link to={ROUTES.BROWSE} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">Browse Vehicles</Link></li>
              <li><Link to={ROUTES.LOGIN} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mx-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7BE8DB] mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTES.SUPPORT.HELP_CENTER} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">Help Center</Link></li>
              <li><Link to={ROUTES.SUPPORT.CONTACT_US} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">Contact Us</Link></li>
              <li><Link to={ROUTES.SUPPORT.FAQ} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mx-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7BE8DB] mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTES.LEGAL.PRIVACY_POLICY} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">Privacy Policy</Link></li>
              <li><Link to={ROUTES.LEGAL.TERMS_OF_SERVICE} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">Terms of Service</Link></li>
              <li><Link to={ROUTES.LEGAL.COOKIE_POLICY} className="text-white/60 hover:text-white transition-colors font-medium underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B]">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="mx-mono text-xs text-white/45 mb-4 md:mb-0">
            &copy; {currentYear} EduFleet. All rights reserved. | Trusted Marketplace for Educational Institutions
          </p>
          <div className="flex gap-6">
            <Link to="#" className="mx-mono text-white/60 hover:text-white transition-colors font-semibold text-xs uppercase tracking-[0.14em] underline decoration-white/25 underline-offset-4 hover:decoration-[#F0A62B]">Twitter</Link>
            <Link to="#" className="mx-mono text-white/60 hover:text-white transition-colors font-semibold text-xs uppercase tracking-[0.14em] underline decoration-white/25 underline-offset-4 hover:decoration-[#F0A62B]">LinkedIn</Link>
            <Link to="#" className="mx-mono text-white/60 hover:text-white transition-colors font-semibold text-xs uppercase tracking-[0.14em] underline decoration-white/25 underline-offset-4 hover:decoration-[#F0A62B]">Facebook</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
