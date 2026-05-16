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
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (message.includes('network error') || message.includes('fetch') || message.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection.';
  }

  // Default fallback
  return error.message || 'Something went wrong. Please try again.';
};
