import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { toast } from 'sonner';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const account = await login(email, password);
      if (account.role !== 'admin') {
        await logout();
        toast.error('Admins only');
        setLoading(false);
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError('Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FmxwyRYTs2dcnubQCH6xSOA5OSFz2%2Fimage__9a481536.png?alt=media&token=b799bfcc-670d-46cb-9ea9-b9e521be88f2" 
              alt="EduFleet Exchange" 
              className="h-12 w-auto"
            />
          </Link>
          <p className="text-muted-foreground">Admin Portal</p>
        </div>

        <Card className="p-8 border-border">
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Management Portal Access</p>
            <p className="text-xs text-blue-600 mt-1">
              Internal staff and subscribed partners can access their management dashboard here.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@edufleet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  autoComplete="current-password"
                />
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
              <LogIn className="w-4 h-4" />
              {loading ? 'Logging in...' : 'Login to Portal'}
            </Button>
          </form>

          {/* Demo Credentials — dev only */}
          {import.meta.env.DEV && (
            <div className="mt-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <p className="font-medium mb-1">Internal Admin Account (dev seed):</p>
                <div className="space-y-1 font-mono text-xs">
                  <p>Email: <span className="text-amber-900">admin@edufleet.test</span></p>
                  <p>Password: <span className="text-amber-900">password123</span></p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium mb-1">Subscribed Partner (Institute, dev seed):</p>
                <div className="space-y-1 font-mono text-xs">
                  <p>Email: <span className="text-blue-900">institute1@edufleet.test</span></p>
                  <p>Password: <span className="text-blue-900">password123</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Other Login Links */}
          <div className="text-center text-sm space-y-2">
            <p className="text-muted-foreground">
              Not an admin?
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Regular Login
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/" className="text-primary hover:underline font-medium">
                Home
              </Link>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary smooth-transition">
            ← Back to Home
          </Link>
        </div>

        {/* Bottom Ad */}
        <div className="mt-6">
          <AdSlot placement="LP_INLINE_1" variant="banner" />
        </div>
      </div>
    </div>
  );
}
