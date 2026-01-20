import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Account & Authentication',
      faqs: [
        {
          question: 'How do I create an account?',
          answer:
            'Click the "Sign Up" button on the homepage and select your account type. Fill in your information and follow the verification process.',
        },
        {
          question: 'Can I change my account type?',
          answer:
            'Account types can only be changed by contacting our support team. Each type has specific permissions and features.',
        },
        {
          question: 'How do I reset my password?',
          answer:
            'Click "Forgot Password" on the login page. Enter your email and we\'ll send you a reset link within 5 minutes.',
        },
        {
          question: 'Is two-factor authentication available?',
          answer:
            'Yes, you can enable 2FA in your account settings under Security. We support authenticator apps and SMS verification.',
        },
      ],
    },
    {
      title: 'Vehicles & Listings',
      faqs: [
        {
          question: 'How do I list a vehicle?',
          answer:
            'Go to your dashboard and click "Create New Listing". Add vehicle details, upload photos, set pricing, and submit for review.',
        },
        {
          question: 'What information is required for a listing?',
          answer:
            'You\'ll need: vehicle type, manufacturer, model, year, condition, mileage, registration number, price, and at least 3 photos.',
        },
        {
          question: 'How long does listing approval take?',
          answer:
            'Most listings are approved within 24-48 hours. You\'ll receive an email notification once approved.',
        },
        {
          question: 'Can I edit my listing after posting?',
          answer:
            'Yes, you can edit active listings anytime. For pending listings, contact support for modifications.',
        },
      ],
    },
    {
      title: 'Payments & Subscriptions',
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept all major credit cards, debit cards, bank transfers, and digital wallets like PayPal and Apple Pay.',
        },
        {
          question: 'How do subscriptions work?',
          answer:
            'Subscriptions are billed monthly or annually. You can upgrade, downgrade, or cancel anytime from your billing settings.',
        },
        {
          question: 'Is there a free trial?',
          answer:
            'Yes! We offer a 14-day free trial for new premium subscribers. No credit card required.',
        },
        {
          question: 'How do I view my invoices?',
          answer:
            'Visit your Account Settings > Billing > Invoices. You can download or email invoices directly from there.',
        },
      ],
    },
    {
      title: 'Security & Trust',
      faqs: [
        {
          question: 'Is my personal data safe?',
          answer:
            'We use industry-standard encryption (SSL/TLS) and comply with data protection regulations. Your data is never sold to third parties.',
        },
        {
          question: 'How do I report a suspicious listing?',
          answer:
            'Click the "Report" button on any listing. Provide details and we\'ll investigate within 24 hours.',
        },
        {
          question: 'What happens if I encounter fraud?',
          answer:
            'Contact support immediately with details. We have a fraud investigation team and may issue refunds for verified claims.',
        },
        {
          question: 'How is my transaction protected?',
          answer:
            'All transactions are protected by our buyer protection guarantee. If the item doesn\'t match the description, we\'ll help resolve it.',
        },
      ],
    },
    {
      title: 'Technical Issues',
      faqs: [
        {
          question: 'Why can\'t I upload photos?',
          answer:
            'Check that your images are less than 10MB and in JPG/PNG format. Try clearing your browser cache and uploading again.',
        },
        {
          question: 'The site is slow. What should I do?',
          answer:
            'Try clearing your browser cache, disabling extensions, or using a different browser. Contact support if issues persist.',
        },
        {
          question: 'I\'m having login issues. How do I fix it?',
          answer:
            'Clear cookies, try a different browser, or reset your password. If still stuck, contact support with your email address.',
        },
        {
          question: 'Is there an app for mobile devices?',
          answer:
            'Our web app is fully responsive and works great on mobile. Native iOS and Android apps are coming soon!',
        },
      ],
    },
    {
      title: 'Browsing & Search',
      faqs: [
        {
          question: 'How do I search for specific vehicles?',
          answer:
            'Use the search bar on the Browse page and apply filters for type, manufacturer, model, year, and price range.',
        },
        {
          question: 'Can I save my search preferences?',
          answer:
            'Log in to your account and you can save searches. We\'ll notify you when new listings match your saved searches.',
        },
        {
          question: 'Why do some listings show masked information?',
          answer:
            'For privacy and security, guest users see masked information. Log in to view full details like exact prices and seller info.',
        },
      ],
    },
  ];

  const allFaqs = faqCategories.flatMap((cat) =>
    cat.faqs.map((faq) => ({ ...faq, category: cat.title }))
  );

  const filteredFaqs = allFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600 mb-8">
            Find quick answers to the most common questions about EduFleet
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 text-base py-3"
            />
          </div>
        </div>

        {/* FAQs */}
        {searchQuery ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Results for "{searchQuery}" ({filteredFaqs.length})
            </h2>
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white border border-slate-200 rounded-lg px-6"
                  >
                    <AccordionTrigger className="py-4 hover:text-blue-600">
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{faq.question}</p>
                        <p className="text-xs text-slate-500 mt-1">{faq.category}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600">No FAQ found matching your search.</p>
                <p className="text-slate-500 text-sm mt-2">
                  Try different keywords or contact support
                </p>
              </div>
            )}
          </div>
        ) : (
          faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{category.title}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${catIndex}-${faqIndex}`}
                    className="bg-white border border-slate-200 rounded-lg px-6"
                  >
                    <AccordionTrigger className="py-4 hover:text-blue-600">
                      <p className="font-medium text-slate-900 text-left">{faq.question}</p>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h2>
          <p className="text-slate-600 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a href="/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
