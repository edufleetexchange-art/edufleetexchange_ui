import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, LogIn, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { mxPaperCard, mxBtnInk, mxInput } from '@/lib/meridian';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'sales') {
        navigate('/sales/dashboard');
      } else if (user.role === 'marketing') {
        navigate('/marketing/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#0B1626] flex flex-col lg:flex-row">
      {/* Left Side - Image & Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#081120] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1547744260-32aeb249977b?q=80&w=1920")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081120] via-[#081120]/70 to-[#081120]/30" />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 mx-grid-ink [mask-image:linear-gradient(to_bottom,black_30%,transparent_95%)]"></div>
          <div className="mx-drift absolute -left-40 bottom-[-160px] h-[480px] w-[480px] rounded-full bg-[#16857B]/25 blur-[130px]"></div>
          <div className="mx-rotate absolute -right-52 top-16 h-[480px] w-[480px]">
            <div className="absolute inset-0 rounded-full border border-white/10"></div>
            <div className="absolute inset-[14%] rounded-full border border-[#2FB8AA]/35"></div>
            <div className="absolute inset-[30%] rounded-full border-2 border-[#F0A62B]/40"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.12] to-transparent"></div>
            <div className="absolute left-1/2 top-[14%] h-2 w-2 -translate-x-1/2 rotate-45 bg-[#F0A62B]/80"></div>
          </div>
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <div className="p-2 border border-white/15 bg-white/[0.06] rounded-sm group-hover:bg-white/15 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="mx-serif text-5xl font-semibold tracking-tight text-white leading-[1.05]">
                Empowering Campus <br />
                <span className="italic text-[#F0A62B]">Mobility Solutions</span>
              </h1>
              <p className="text-xl text-white/70 mt-4 max-w-lg">
                The trusted marketplace for educational institutions to exchange and manage their fleet.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                'Verified Institutional Listings',
                'Secure Communication Portal',
                'Transparent Fleet Management',
                'Dedicated Support for Schools'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-sm border border-[#7BE8DB]/30 bg-[#16857B]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[#7BE8DB]" />
                  </div>
                  <span className="text-white/85">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="mx-mono text-xs tracking-[0.08em] text-white/45">
            © 2026 EduFleet Exchange. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-[#F3F5F7]">
        <div className="w-full max-w-md space-y-8">
          {/* Logo (Mobile) */}
          <div className="lg:hidden text-center mb-8 flex justify-center">
            <Link to="/">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FmxwyRYTs2dcnubQCH6xSOA5OSFz2%2Fimage__9a481536.png?alt=media&token=b799bfcc-670d-46cb-9ea9-b9e521be88f2" 
                alt="EduFleet Exchange" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="mx-serif text-4xl font-semibold tracking-tight">Welcome Back</h2>
            <p className="text-[#0B1626]/55">Please enter your details to sign in</p>
          </div>

          <Card className={`p-8 ${mxPaperCard} animate-in-slide-up`}>
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="login-email" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1626]/60 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B1626]/40 group-focus-within:text-[#16857B] transition-colors">
                    <Mail className="w-full h-full" />
                  </div>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-12 h-12 ${mxInput}`}
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="login-password" className="mx-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1626]/60">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-[#16857B] underline decoration-[#16857B]/30 underline-offset-4 hover:text-[#0B1626] hover:decoration-[#F0A62B] transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B1626]/40 group-focus-within:text-[#16857B] transition-colors">
                    <Lock className="w-full h-full" />
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-12 h-12 ${mxInput}`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full h-12 gap-2 text-base ${mxBtnInk}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Signup Redirects */}
            <div className="mt-8 pt-8 border-t border-[#0B1626]/10">
              <p className="text-center text-sm text-[#0B1626]/55 mb-4">
                Don&apos;t have an account yet?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  to="/signup"
                  className="flex flex-col items-center p-3 rounded-sm border border-[#0B1626]/15 bg-white hover:bg-[#FDF4E1] hover:border-[#F0A62B]/50 transition-colors group"
                >
                  <span className="mx-mono text-xs font-bold tracking-[0.08em] text-[#0B1626] group-hover:text-[#A66B00] transition-colors">INSTITUTE</span>
                  <span className="text-[10px] text-[#0B1626]/50 mt-0.5">Register school</span>
                </Link>
                <Link
                  to="/teacher/signup"
                  className="flex flex-col items-center p-3 rounded-sm border border-[#0B1626]/15 bg-white hover:bg-[#FDF4E1] hover:border-[#F0A62B]/50 transition-colors group"
                >
                  <span className="mx-mono text-xs font-bold tracking-[0.08em] text-[#16857B] group-hover:text-[#A66B00] transition-colors">TEACHER</span>
                  <span className="text-[10px] text-[#0B1626]/50 mt-0.5">Job seeker</span>
                </Link>
                <Link
                  to="/vendor/signup"
                  className="flex flex-col items-center p-3 rounded-sm border border-[#0B1626]/15 bg-white hover:bg-[#FDF4E1] hover:border-[#F0A62B]/50 transition-colors group"
                >
                  <span className="mx-mono text-xs font-bold tracking-[0.08em] text-[#A66B00] group-hover:text-[#0B1626] transition-colors">VENDOR</span>
                  <span className="text-[10px] text-[#0B1626]/50 mt-0.5">Sell or advertise</span>
                </Link>
                <Link
                  to="/consultant/signup"
                  className="flex flex-col items-center p-3 rounded-sm border border-[#0B1626]/15 bg-white hover:bg-[#FDF4E1] hover:border-[#F0A62B]/50 transition-colors group"
                >
                  <span className="mx-mono text-xs font-bold tracking-[0.08em] text-[#0B1626] group-hover:text-[#A66B00] transition-colors">CONSULTANT</span>
                  <span className="text-[10px] text-[#0B1626]/50 mt-0.5">Placement broker</span>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
