import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, Building2, User, Send, MapPin, Store } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';

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
    <div className="min-h-screen bg-gradient-to-b from-background to-background py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>
        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-2">
            EduFleet<span className="text-primary">Exchange</span>
          </h1>
          <p className="text-muted-foreground">
            Create your institution account
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            to="/signup"
            className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-primary/5 hover:border-primary/20 transition-all group flex-1 sm:flex-none"
          >
            <span className="text-xs font-bold text-primary group-hover:scale-110 transition-transform">INSTITUTE</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Register School</span>
          </Link>
          <Link
            to="/teacher/signup"
            className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-secondary/5 hover:border-secondary/20 transition-all group flex-1 sm:flex-none"
          >
            <span className="text-xs font-bold text-secondary group-hover:scale-110 transition-transform">TEACHER</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Individual Account</span>
          </Link>
          <Link
            to="/vendor/signup"
            className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all group flex-1 sm:flex-none"
          >
            <Store className="w-3 h-3 mb-0.5 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-orange-500 group-hover:scale-110 transition-transform">VENDOR</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Supplier / Business</span>
          </Link>
        </div>

        <Card className="p-8 border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Person Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Person Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@institute.edu.in"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Institute Information */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4 text-lg">Institute Information</h3>
              <div className="space-y-4">
                {/* Institute Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Institute Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="instituteName"
                      placeholder="Your Institute Name"
                      value={formData.instituteName}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone Number and Contact Person */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      10-digit Indian mobile number
                    </p>
                  </div>

                  {/* Contact Person Title */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Title/Position</label>
                    <Input
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
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Institute Address
              </h3>
              <div className="space-y-4">
                {/* Street */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="street"
                    placeholder="123 Main Street"
                    value={formData.street}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="city"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="state"
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="pincode"
                      placeholder="400001"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4 text-lg">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loading}
            >
              <Send className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary smooth-transition">
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
