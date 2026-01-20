import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        { id: 1, title: 'How to create an account', category: 'Getting Started' },
        { id: 2, title: 'Setting up your profile', category: 'Getting Started' },
        { id: 3, title: 'Understanding account types', category: 'Getting Started' },
      ],
    },
    {
      title: 'Vehicles & Listings',
      icon: '🚗',
      articles: [
        { id: 4, title: 'How to list a vehicle', category: 'Vehicles & Listings' },
        { id: 5, title: 'Managing your listings', category: 'Vehicles & Listings' },
        { id: 6, title: 'Pricing guidelines', category: 'Vehicles & Listings' },
      ],
    },
    {
      title: 'Payments & Billing',
      icon: '💳',
      articles: [
        { id: 7, title: 'Payment methods', category: 'Payments & Billing' },
        { id: 8, title: 'Subscription plans', category: 'Payments & Billing' },
        { id: 9, title: 'Invoices and receipts', category: 'Payments & Billing' },
      ],
    },
    {
      title: 'Safety & Security',
      icon: '🔒',
      articles: [
        { id: 10, title: 'Account security tips', category: 'Safety & Security' },
        { id: 11, title: 'Reporting suspicious activity', category: 'Safety & Security' },
        { id: 12, title: 'Verification process', category: 'Safety & Security' },
      ],
    },
  ];

  const allArticles = categories.flatMap((cat) => cat.articles);
  const filteredArticles = allArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Help Center</h1>
          <p className="text-lg text-slate-600 mb-8">
            Find answers to common questions about EduFleet
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-base py-3 pl-5"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {searchQuery ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Search Results ({filteredArticles.length})
            </h2>
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <h3 className="font-medium text-slate-900">{article.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{article.category}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600">No articles found matching your search.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div key={category.title} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 transition-all">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{category.title}</h3>
                <ul className="space-y-3">
                  {category.articles.map((article) => (
                    <li key={article.id}>
                      <button className="text-left text-blue-600 hover:text-blue-700 font-medium text-sm">
                        {article.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Didn't find what you're looking for?
          </h2>
          <p className="text-slate-600 mb-6">
            Our support team is here to help. Contact us directly for assistance.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
