import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import PredictPage from '../pages/PredictPage';
import OptimizePage from '../pages/OptimizePage';
import InsightsPage from '../pages/InsightsPage';
import ModelInfoPage from '../pages/ModelInfoPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'predict', element: <PredictPage /> },
      { path: 'optimize', element: <OptimizePage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'model-info', element: <ModelInfoPage /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);

export default router;