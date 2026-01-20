import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const CookiePolicy = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    toast.success('Cookie preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-slate">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Cookie Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: January 2026</p>

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

              <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Essential Cookies:</h3>
              <p>
                These cookies are necessary for the website to function properly. They enable basic functions
                like page navigation and access to secure areas. The website cannot function properly without
                these cookies.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Analytics Cookies:</h3>
              <p>
                These cookies help us understand how visitors use our website by collecting and reporting
                information anonymously. This helps us improve our service and user experience.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Marketing Cookies:</h3>
              <p>
                These cookies track your online activity to help advertisers deliver more relevant advertising
                or to limit how many times you see an ad. They may be set by our advertising partners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Cookies</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication - to identify you and keep you logged in</li>
                <li>Preferences - to remember your settings and choices</li>
                <li>Analytics - to track site usage and performance</li>
                <li>Security - to detect and prevent fraud</li>
                <li>Advertising - to deliver personalized content and ads</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Managing Your Cookie Preferences</h2>
              <p>
                You can control which cookies we use through your browser settings. Most browsers allow you to
                refuse cookies or alert you when cookies are being sent. However, blocking essential cookies may
                affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Third-Party Cookies</h2>
              <p>
                Some cookies are set by third-party services we use, such as analytics providers and advertising
                networks. These third parties have their own cookie policies and we recommend reviewing them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p>
                If you have questions about our Cookie Policy, please contact us at: <strong>cookies@edufleet.com</strong>
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
                  setCookiePreferences((prev) => ({ ...prev, analytics: checked as boolean }))
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
                  setCookiePreferences((prev) => ({ ...prev, marketing: checked as boolean }))
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
            Your preferences will be saved in your browser and respected across all your visits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
