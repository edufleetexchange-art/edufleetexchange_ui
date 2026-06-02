import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  getCookiePreferences,
  setCookiePreferences,
  DEFAULT_PREFERENCES,
  type CookiePreferences,
} from '@/lib/cookieConsent';

const CookiePolicy = () => {
  const [cookiePreferences, setLocalPrefs] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  // Hydrate from localStorage on mount so a returning user sees their saved choices.
  useEffect(() => {
    setLocalPrefs(getCookiePreferences());
  }, []);

  const handleSavePreferences = () => {
    setCookiePreferences(cookiePreferences);
    toast.success('Cookie preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-slate">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Cookie Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: June 2026</p>

          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. What are Cookies?</h2>
              <p>
                Cookies are small pieces of text stored on your device when you visit websites. They help
                websites remember information about your visit, like your preferences or login details. Cookies
                can be session cookies (deleted when you close your browser) or persistent cookies (stored for a
                set period).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Essential Cookies (always on):</h3>
              <p>
                These cookies are required for the website to function properly. They enable basic functions
                like page navigation and access to authenticated areas. We currently set the following essential
                cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <strong>token</strong> — HttpOnly session cookie set after login, used to keep you signed in.
                  Expires after 7 days or on logout.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Analytics Cookies (opt-in):</h3>
              <p>
                These cookies help us understand how visitors use our website by collecting and reporting
                information in aggregate. They are NOT enabled by default; we set them only after you opt in
                using the preferences manager below.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Marketing Cookies (opt-in):</h3>
              <p>
                These cookies track your activity to help us deliver more relevant content. They are NOT
                enabled by default; we set them only after you opt in below.
              </p>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Current state:</strong> at present we do not yet load any analytics or marketing
                  cookies. Your preferences below will be respected as soon as such services are integrated.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Cookies</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication — to identify you and keep you logged in</li>
                <li>Preferences — to remember your settings and choices (including this consent record)</li>
                <li>Security — to detect and prevent fraud</li>
                <li>
                  Analytics — only if you have opted in. Will track aggregated, non-identifying usage to help us
                  improve the site.
                </li>
                <li>
                  Advertising / Marketing — only if you have opted in. Will support targeted advertising and
                  campaign measurement.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Managing Your Cookie Preferences</h2>
              <p>
                Use the <strong>Manage Your Cookie Preferences</strong> panel below to opt in or out of
                non-essential cookie categories. Your choices are saved in your browser and respected across all
                your visits to this site on this device.
              </p>
              <p className="mt-2">
                You may also block cookies entirely via your browser settings. Note that blocking essential
                cookies (the session token) will prevent you from staying logged in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Third-Party Cookies</h2>
              <p>
                When analytics or marketing services are added, this section will list each third party by name
                with a link to their cookie policy. We commit to disclosing any new third-party cookie in this
                section before activating it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p>
                If you have questions about our Cookie Policy, please contact us at:{' '}
                <strong>cookies@edufleetexchange.com</strong>
              </p>
            </section>
          </div>
        </div>

        {/* Cookie Preferences Manager */}
        <div className="mt-12 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Your Cookie Preferences</h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Checkbox checked={cookiePreferences.essential} disabled />
              <div>
                <h3 className="font-semibold text-slate-900">Essential Cookies (Always Active)</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Required for the website to function. These cannot be disabled.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Checkbox
                checked={cookiePreferences.analytics}
                onCheckedChange={(checked) =>
                  setLocalPrefs((prev) => ({ ...prev, analytics: checked as boolean }))
                }
              />
              <div>
                <h3 className="font-semibold text-slate-900">Analytics Cookies</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Help us understand how you use our site to improve functionality.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Checkbox
                checked={cookiePreferences.marketing}
                onCheckedChange={(checked) =>
                  setLocalPrefs((prev) => ({ ...prev, marketing: checked as boolean }))
                }
              />
              <div>
                <h3 className="font-semibold text-slate-900">Marketing Cookies</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Used to deliver personalized content and advertisements.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSavePreferences}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Save Preferences
          </Button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Your preferences are saved in this browser and read by any future analytics or marketing
            integration via <code>hasConsent()</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
