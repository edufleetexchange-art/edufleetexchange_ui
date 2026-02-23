import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, LogIn, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

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
      if (user.role === 'admin') {
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
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Side - Image & Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1547744260-32aeb249977b?q=80&w=1920")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
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
              <h1 className="text-5xl font-display font-bold leading-tight">
                Empowering Campus <br />
                <span className="text-accent">Mobility Solutions</span>
              </h1>
              <p className="text-xl text-white/80 mt-4 max-w-lg">
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
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="text-sm text-white/60">
            © 2026 EduFleet Exchange. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-gradient-subtle">
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
            <h2 className="text-3xl font-display font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground">Please enter your details to sign in</p>
          </div>

          <Card className="p-8 glass-card border-none shadow-elegant animate-in-slide-up">
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail className="w-full h-full" />
                  </div>
                  <Input
                    type="email"
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-foreground/80">Password</label>
                  <Link to="/forgot-password" title="Feature coming soon" className="text-xs font-medium text-primary hover:text-primary-light transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock className="w-full h-full" />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all"
                    disabled={loading}
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
                className="w-full h-12 gap-2 bg-primary hover:bg-primary-light text-white shadow-primary hover-lift text-base font-semibold"
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
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="text-center text-sm text-muted-foreground mb-4">
                Don't have an account yet?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/signup" 
                  className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-primary/5 hover:border-primary/20 transition-all group"
                >
                  <span className="text-xs font-bold text-primary group-hover:scale-110 transition-transform">INSTITUTE</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Register School</span>
                </Link>
                <Link 
                  to="/teacher/signup" 
                  className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-secondary/5 hover:border-secondary/20 transition-all group"
                >
                  <span className="text-xs font-bold text-secondary group-hover:scale-110 transition-transform">STAFF</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Individual Account</span>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
