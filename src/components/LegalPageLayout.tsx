import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Section {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

/**
 * Shared shell for legal/policy pages. Provides:
 * - A clear "Last updated" line with an ISO-friendly date string
 * - A sticky-on-desktop table of contents with active-section highlight
 * - Cross-links between Privacy / Terms / Cookies so users can navigate
 *   the legal corpus without going back to the footer
 */
export function LegalPageLayout({ title, lastUpdated, sections }: LegalPageLayoutProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!headings.length || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-sm text-slate-600">Last updated: {lastUpdated}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">On this page</p>
            <ul className="space-y-1.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`block py-1 px-2 rounded-md transition-colors ${
                      activeId === s.id
                        ? 'text-primary font-semibold bg-primary/5'
                        : 'text-slate-600 hover:text-primary hover:bg-slate-100'
                    }`}
                    aria-current={activeId === s.id ? 'true' : undefined}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-slate-200 space-y-1.5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Other policies</p>
              <Link to="/legal/privacy" className="block text-slate-600 hover:text-primary">Privacy Policy</Link>
              <Link to="/legal/terms" className="block text-slate-600 hover:text-primary">Terms of Service</Link>
              <Link to="/legal/cookies" className="block text-slate-600 hover:text-primary">Cookie Policy</Link>
            </div>
          </nav>

          <article className="prose prose-slate max-w-none space-y-8 text-slate-700">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{s.title}</h2>
                {s.content}
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}

export default LegalPageLayout;
