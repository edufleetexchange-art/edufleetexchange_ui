import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // No backend endpoint yet — open the user's mail client so the message actually goes somewhere.
    const subjectLabel =
      formData.subject === 'general' ? 'General Inquiry'
        : formData.subject === 'support' ? 'Technical Support'
        : formData.subject === 'billing' ? 'Billing Issue'
        : formData.subject === 'partnership' ? 'Partnership'
        : 'Feedback';
    const mailto = `mailto:edufleetexchange@gmail.com?subject=${encodeURIComponent(`[${subjectLabel}] ${formData.name || 'Inquiry'}`)}&body=${encodeURIComponent(`${formData.message}\n\n— ${formData.name} <${formData.email}>`)}`;
    window.location.href = mailto;
    setTimeout(() => {
      setIsSubmitting(false);
      toast.info('Opening your mail client. If nothing happens, email edufleetexchange@gmail.com directly.');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-lg text-slate-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg mt-1">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email</h3>
                    <p className="text-slate-600 mt-1">edufleetexchange@gmail.com</p>
                    <p className="text-slate-500 text-sm mt-1">We'll reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg mt-1">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Phone</h3>
                    <p className="text-slate-600 mt-1"> 7892841785</p>
                    <p className="text-slate-500 text-sm mt-1">Monday to Friday, 9am-6pm EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg mt-1">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Address</h3>
                    <p className="text-slate-600 mt-1">Anikethana Rd</p>
                    <p className="text-slate-600">Kuvempu Nagara, Mysuru, Karnataka</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    → Help Center
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    → FAQ
                  </a>
                </li>
                <li>
                  <a href="/legal/status" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    → System Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Subject
                </label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subject: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing Issue</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Message
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
