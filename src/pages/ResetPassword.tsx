import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '@/api/services/authService';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is missing. Please request a new reset link.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'token_not_found';
      if (
        message === 'token_not_found' ||
        message === 'token_already_used' ||
        message === 'token_expired'
      ) {
        setError('This reset link is invalid or has expired.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 bg-gradient-subtle">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-display font-bold tracking-tight">Reset Password</h2>
          <p className="text-muted-foreground">Enter your new password below.</p>
        </div>

        <Card className="p-8 glass-card border-none shadow-elegant animate-in-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="reset-new-password" className="text-sm font-semibold text-foreground/80 ml-1">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock className="w-full h-full" />
                </div>
                <Input
                  id="reset-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all"
                  disabled={loading}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reset-confirm-password" className="text-sm font-semibold text-foreground/80 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock className="w-full h-full" />
                </div>
                <Input
                  id="reset-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm space-y-1"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse flex-shrink-0" />
                  {error}
                </div>
                {(error.includes('invalid') || error.includes('expired')) && (
                  <div className="ml-3.5">
                    <Link to="/forgot-password" className="text-primary hover:underline text-xs">
                      Request a new reset link
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 gap-2 bg-primary hover:bg-primary-light text-white shadow-primary hover-lift text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
