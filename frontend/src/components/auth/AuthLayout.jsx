import { motion } from 'framer-motion';
import AuthBackground from '../3d/AuthBackground';
import { Zap } from 'lucide-react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0f] text-textc selection:bg-primary/30">
      {/* LEFT HALF - Visuals (Hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* Layer 1: Base background is #0a0a0f from parent */}
        
        {/* Layer 2: Image with low opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80)' }}
        />
        
        {/* Layer 3: Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10" />

        {/* Layer 4: 3D Scene */}
        <AuthBackground />

        {/* Layer 5: Text content on top */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-12">
          {/* Top: Logo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Zap className="text-white" size={24} />
            </div>
            <span className="font-syne text-2xl font-bold tracking-tight text-white">SalesAI</span>
          </motion.div>

          {/* Center: Headings */}
          <div className="flex flex-col gap-2">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-syne text-6xl font-extrabold text-white sm:text-7xl"
            >
              Predict.
            </motion.h1>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-syne text-6xl font-extrabold text-white sm:text-7xl"
            >
              Optimize.
            </motion.h1>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-syne text-6xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent sm:text-7xl"
            >
              Dominate.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 max-w-md text-lg text-muted"
            >
              AI-powered sales forecasting for modern retail businesses.
            </motion.p>
          </div>

          {/* Bottom: Stats Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4"
          >
            {['62% Accuracy', '8,523 Records', '<100ms Speed'].map((stat, i) => (
              <div 
                key={i} 
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md animate-[pulse_4s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                {stat}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* RIGHT HALF - Form Container */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <Zap className="text-white" size={18} />
          </div>
          <span className="font-syne text-xl font-bold tracking-tight text-white">SalesAI</span>
        </div>
        
        {/* Form Card Container */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="mx-auto w-full max-w-[420px]"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
