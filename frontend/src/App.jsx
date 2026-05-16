import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './router';
import { AuthProvider } from './context/AuthContext';
import { useEffect } from 'react';
import Lenis from 'lenis';

/** @param {{}} props */
export const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster 
        position='top-right' 
        toastOptions={{ 
          style: { background: '#111118', color: '#f1f5f9', border: '1px solid #1e1e2e' } 
        }} 
      />
    </AuthProvider>
  );
};

export default App;