import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, Building2, User, Send, MapPin, Store } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { mxPaperCard, mxDiamond, mxBtnInk } from '@/lib/meridian';

export function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    instituteName: '',
    contactPerson: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signupInstitute } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.instituteName || !formData.contactPerson || !formData.phone) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all address fields');
      setLoading(false);
      return;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian phone number');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await signupInstitute({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        instituteName: formData.instituteName,
        contactPerson: formData.contactPerson,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#0B1626] py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>
        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="mx-serif text-4xl font-semibold tracking-tight mb-2">
            EduFleet<span className="italic text-[#16857B]">Exchange</span>
          </h1>
          <div className="mx-auto mb-3 h-1 w-20 bg-gradient-to-r from-transparent via-[#F0A62B] to-transparent" aria-hidden="true"></div>
          <p className="text-[#0B1626]/55">
            Create your institution account
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            to="/signup"
            className="flex flex-col items-center p-3 rounded-sm border border-[#0B1626]/15 bg-white hover:bg-[#FDF4E1] hover:border-[#F0A62B]/50 transition-colors group flex-1 sm:flex-none"
          >
            <span className="mx-mono text-xs font-bold tracking-[0.08em] text-[#0B1626] group-hover:text-[#A66B00] transition-colors">INSTITUTE</span>
            <span className="text-[10px] text-[#0B1626]/50 mt-0.5">Register School</span>
          </Link>
          <Link
            to="/teacher/signup"
            className="flex flex-col items-center p-3 rounded-sm border border-[#0B1626]/15 bg-white hover:bg-[#FDF4E1] hover:border-[#F0A62B]/50 transition-colors group flex-1 sm:flex-none"
          >
            <span className="mx-mono text-xs font-bold tracking-[0.08em] text-[#16857B] group-hover:text-[#A66B00] transition-colors">TEACHER</span>
            <span className="text-[10px] text-[#0B1626]/50 mt-0.5">Individual Account</span>
          </Link>
          <Link
            to="/vendor/signup"
            className="flex flex-col items-center p-3 rounded-sm border border-[#0B1626]/15 bg-white hover:bg-[#FDF4E1] hover:border-[#F0A62B]/50 transition-colors group flex-1 sm:flex-none"
          >
            <Store className="w-3 h-3 mb-0.5 text-[#A66B00] transition-colors" />
            <span className="mx-mono text-xs font-bold tracking-[0.08em] text-[#A66B00] group-hover:text-[#0B1626] transition-colors">VENDOR</span>
            <span className="text-[10px] text-[#0B1626]/50 mt-0.5">Supplier / Business</span>
          </Link>
        </div>

        <Card className={`p-8 ${mxPaperCard}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="mx-serif flex items-center gap-3 font-semibold tracking-tight mb-4 text-xl"><span className={mxDiamond} aria-hidden="true"></span>Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Person Name */}
                <div>
                  <label htmlFor="signup-name" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">Contact Person Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0B1626]/40" />
                    <Input
                      id="signup-name"
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="signup-email" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0B1626]/40" />
                    <Input
                      id="signup-email"
                      type="email"
                      name="email"
                      placeholder="your@institute.edu.in"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Institute Information */}
            <div className="pt-4 border-t border-[#0B1626]/10">
              <h3 className="mx-serif flex items-center gap-3 font-semibold tracking-tight mb-4 text-xl"><span className={mxDiamond} aria-hidden="true"></span>Institute Information</h3>
              <div className="space-y-4">
                {/* Institute Name */}
                <div>
                  <label htmlFor="signup-institute-name" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">Institute Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0B1626]/40" />
                    <Input
                      id="signup-institute-name"
                      type="text"
                      name="instituteName"
                      placeholder="Your Institute Name"
                      value={formData.instituteName}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                      autoComplete="organization"
                    />
                  </div>
                </div>

                {/* Phone Number and Contact Person */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div>
                    <label htmlFor="signup-phone" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      name="phone"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={10}
                      autoComplete="tel-national"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      10-digit Indian mobile number
                    </p>
                  </div>

                  {/* Contact Person Title */}
                  <div>
                    <label htmlFor="signup-contact-person" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">Your Role at the Institute</label>
                    <Input
                      id="signup-contact-person"
                      type="text"
                      name="contactPerson"
                      placeholder="e.g., Transport Manager, Principal"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="pt-4 border-t border-[#0B1626]/10">
              <h3 className="mx-serif font-semibold tracking-tight mb-4 text-xl flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#16857B]" />
                Institute Address
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                eduFleet currently operates in India only — phone and pincode validation expects Indian formats.
              </p>
              <div className="space-y-4">
                {/* Street */}
                <div>
                  <label htmlFor="signup-street" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="signup-street"
                    type="text"
                    name="street"
                    placeholder="123 Main Street"
                    value={formData.street}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="street-address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label htmlFor="signup-city" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="signup-city"
                      type="text"
                      name="city"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="address-level2"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="signup-state" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="signup-state"
                      type="text"
                      name="state"
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="address-level1"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label htmlFor="signup-pincode" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="signup-pincode"
                      type="text"
                      name="pincode"
                      placeholder="400001"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={6}
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="pt-4 border-t border-[#0B1626]/10">
              <h3 className="mx-serif flex items-center gap-3 font-semibold tracking-tight mb-4 text-xl"><span className={mxDiamond} aria-hidden="true"></span>Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label htmlFor="signup-password" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0B1626]/40" />
                    <Input
                      id="signup-password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="signup-confirm-password" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1626]/60 mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0B1626]/40" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className={`w-full gap-2 h-12 ${mxBtnInk}`}
              disabled={loading}
            >
              <Send className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#0B1626]/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="mx-mono px-2 bg-white text-[10px] uppercase tracking-[0.22em] text-[#0B1626]/45">Or</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-[#0B1626]/55">
            Already have an account?{' '}
            <Link to="/login" className="text-[#16857B] font-medium underline decoration-[#16857B]/30 underline-offset-4 hover:text-[#0B1626] hover:decoration-[#F0A62B]">
              Sign in here
            </Link>
          </p>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link to="/" className="mx-mono text-xs uppercase tracking-[0.14em] text-[#0B1626]/50 hover:text-[#0B1626] underline decoration-transparent underline-offset-4 hover:decoration-[#F0A62B] smooth-transition">
            ← Back to Home
          </Link>
        </div>
        {/* Bottom Ad */}
        <div className="mt-6">
          <AdSlot placement="LP_INLINE_2" variant="banner" />
        </div>
      </div>
    </div>
  );
}
