/**
 * Maps Supabase error codes or messages to user-friendly messages.
 * @param {Error|null} error 
 * @returns {string} User friendly error message
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred. Please try again.';

  const message = error.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Wrong email or password. Please try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please check your email and confirm your account.';
  }
  if (message.includes('user already exists')) {
    return 'An account with this email already exists. Please sign in.';
  }
  if (message.includes('weak_password') || message.includes('password should be at least')) {
    return 'Password is too weak. Please use a stronger password.';
  }
  if (message.includes('invalid_email') || message.includes('valid email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('email rate limit')) {
    return (
      'Supabase email limit reached (free plan allows only a few emails per hour). ' +
      'Wait about an hour, or in Supabase Dashboard go to Authentication → Providers → Email ' +
      'and turn off “Confirm email” for local testing, or add custom SMTP.'
    );
  }
  if (
    error.status === 429 ||
    message.includes('too many requests') ||
    message.includes('rate limit') ||
    message.includes('429')
  ) {
    return (
      'Too many signup attempts. Wait 15–60 minutes, then try again once. ' +
      'For local dev, disable “Confirm email” in Supabase → Authentication → Providers.'
    );
  }
  if (message.includes('network error') || message.includes('fetch') || message.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection.';
  }

  // Default fallback
  return error.message || 'Something went wrong. Please try again.';
};
