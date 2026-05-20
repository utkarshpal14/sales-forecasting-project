import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import supabase from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { getAuthErrorMessage } from '../../utils/authErrors';

export const LoginForm = () => {
  const { register, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) throw error;
      navigate('/');
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = document.querySelector('input[name="email"]')?.value;
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      toast.success('Reset link sent to your email.');
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/',
        },
      });
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  };

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-surface/50 p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <ShieldCheck className="text-primary" size={32} />
        </div>
        <h2 className="font-syne text-3xl font-bold text-white">Welcome Back</h2>
        <p className="mt-2 text-sm text-muted">Sign in to your SalesAI account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="text-muted transition-colors group-focus-within:text-primary" size={18} />
          </div>
          <input
            {...register('email', { required: 'Email is required' })}
            type="email"
            placeholder=" "
            className="peer w-full rounded-xl border border-border bg-black/20 pb-2.5 pt-6 pl-10 pr-4 text-sm text-white placeholder-transparent transition-all focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <label className="pointer-events-none absolute left-10 top-4 -translate-y-3 text-xs text-muted transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-3 peer-focus:text-xs peer-focus:text-primary">
            Email Address
          </label>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="text-muted transition-colors group-focus-within:text-primary" size={18} />
            </div>
            <input
              {...register('password', { required: 'Password is required' })}
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              className="peer w-full rounded-xl border border-border bg-black/20 pb-2.5 pt-6 pl-10 pr-10 text-sm text-white placeholder-transparent transition-all focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <label className="pointer-events-none absolute left-10 top-4 -translate-y-3 text-xs text-muted transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-3 peer-focus:text-xs peer-focus:text-primary">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-end">
            <button onClick={handleForgotPassword} className="text-xs text-primary hover:underline">
              Forgot password?
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={isLoading}
          type="submit"
          className="relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            'Sign In'
          )}
        </motion.button>
      </form>

      <div className="relative mt-8 flex items-center justify-center">
        <div className="absolute w-full border-t border-border"></div>
        <span className="relative bg-surface/50 px-3 text-xs text-muted">or continue with</span>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-black/20 text-sm font-medium text-white transition-all hover:bg-white/5"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>

      {/* Error Display */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-20 left-0 right-0 flex items-center gap-3 rounded-xl border-l-4 border-red-500 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur-md"
          >
            <span>{authError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginForm;
