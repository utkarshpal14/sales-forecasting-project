import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, User, CheckCircle2, XCircle } from 'lucide-react';
import supabase from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { getAuthErrorMessage } from '../../utils/authErrors';
import {
  canAttemptAuth,
  recordAuthAttempt,
  recordAuthRateLimited,
} from '../../utils/authRateLimit';

export const SignupForm = () => {
  const { register, handleSubmit, watch } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const passwordValue = watch('password', '');
  const confirmPasswordValue = watch('confirmPassword', '');

  // Calculate password strength
  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(passwordValue);
  
  const getStrengthColors = () => {
    if (passwordValue.length === 0) return ['bg-surface', 'bg-surface', 'bg-surface', 'bg-surface'];
    if (strength === 1) return ['bg-red-500', 'bg-surface', 'bg-surface', 'bg-surface'];
    if (strength === 2) return ['bg-orange-500', 'bg-orange-500', 'bg-surface', 'bg-surface'];
    if (strength === 3) return ['bg-yellow-500', 'bg-yellow-500', 'bg-yellow-500', 'bg-surface'];
    return ['bg-green-500', 'bg-green-500', 'bg-green-500', 'bg-green-500'];
  };
  
  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const currentStrengthLabel = passwordValue.length > 0 ? strengthLabels[strength] : '';

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setAuthError("Passwords don't match.");
      return;
    }
    if (!data.terms) {
      setAuthError("You must agree to the Terms of Service.");
      return;
    }

    const cooldown = canAttemptAuth('signup');
    if (cooldown.blocked) {
      setAuthError(`Please wait ${cooldown.waitSec} seconds before trying again.`);
      return;
    }

    setIsLoading(true);
    setAuthError('');
    recordAuthAttempt('signup');
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) throw error;
      setIsSuccess(true);
    } catch (error) {
      if (error?.status === 429) recordAuthRateLimited('signup');
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
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

  if (isSuccess) {
    return (
      <div className="relative rounded-2xl border border-primary/20 bg-surface/50 p-12 text-center shadow-2xl backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
        >
          <CheckCircle2 className="text-green-500" size={40} />
        </motion.div>
        <h2 className="mb-4 font-syne text-3xl font-bold text-white">Account Created!</h2>
        <p className="mb-8 text-muted">
          Check your email to confirm your account before signing in.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-surface/50 p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          <Sparkles className="text-secondary" size={32} />
        </div>
        <h2 className="font-syne text-3xl font-bold text-white">Create Account</h2>
        <p className="mt-2 text-sm text-muted">Start forecasting sales with AI</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <User className="text-muted transition-colors group-focus-within:text-primary" size={18} />
          </div>
          <input
            {...register('fullName', { required: true, minLength: 2 })}
            type="text"
            placeholder=" "
            className="peer w-full rounded-xl border border-border bg-black/20 pb-2.5 pt-6 pl-10 pr-4 text-sm text-white placeholder-transparent transition-all focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <label className="pointer-events-none absolute left-10 top-4 -translate-y-3 text-xs text-muted transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-3 peer-focus:text-xs peer-focus:text-primary">
            Full Name
          </label>
        </div>

        {/* Email Field */}
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="text-muted transition-colors group-focus-within:text-primary" size={18} />
          </div>
          <input
            {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
            type="email"
            placeholder=" "
            className="peer w-full rounded-xl border border-border bg-black/20 pb-2.5 pt-6 pl-10 pr-4 text-sm text-white placeholder-transparent transition-all focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <label className="pointer-events-none absolute left-10 top-4 -translate-y-3 text-xs text-muted transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-3 peer-focus:text-xs peer-focus:text-primary">
            Email Address
          </label>
        </div>

        {/* Password Field */}
        <div>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="text-muted transition-colors group-focus-within:text-primary" size={18} />
            </div>
            <input
              {...register('password', { required: true, minLength: 8 })}
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
          
          {/* Password Strength */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-1 flex-1 gap-1">
              {getStrengthColors().map((color, i) => (
                <div key={i} className={`h-full flex-1 rounded-full ${color} transition-colors duration-300`} />
              ))}
            </div>
            <span className="w-10 text-right text-[10px] uppercase text-muted">{currentStrengthLabel}</span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="text-muted transition-colors group-focus-within:text-primary" size={18} />
          </div>
          <input
            {...register('confirmPassword', { required: true })}
            type={showPassword ? 'text' : 'password'}
            placeholder=" "
            className="peer w-full rounded-xl border border-border bg-black/20 pb-2.5 pt-6 pl-10 pr-10 text-sm text-white placeholder-transparent transition-all focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <label className="pointer-events-none absolute left-10 top-4 -translate-y-3 text-xs text-muted transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-3 peer-focus:text-xs peer-focus:text-primary">
            Confirm Password
          </label>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {confirmPasswordValue.length > 0 && (
              passwordValue === confirmPasswordValue ? (
                <CheckCircle2 className="text-green-500" size={18} />
              ) : (
                <XCircle className="text-red-500" size={18} />
              )
            )}
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 pt-2 cursor-pointer">
          <input
            {...register('terms')}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border bg-black/20 text-primary accent-primary"
          />
          <span className="text-xs text-muted">
            I agree to the Terms of Service and Privacy Policy
          </span>
        </label>

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
            'Create Account'
          )}
        </motion.button>
      </form>

      <div className="relative mt-6 flex items-center justify-center">
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
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
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

export default SignupForm;
