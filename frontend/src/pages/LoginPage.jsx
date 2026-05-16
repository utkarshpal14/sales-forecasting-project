import { Navigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Let the AuthProvider's global loading handle it or just wait
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
