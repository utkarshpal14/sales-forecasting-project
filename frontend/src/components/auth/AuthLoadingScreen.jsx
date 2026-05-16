import { motion } from 'framer-motion';

export const AuthLoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"></div>
          <div className="relative h-16 w-16 animate-pulse rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_30px_rgba(99,102,241,0.5)]"></div>
          
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-syne text-2xl font-bold tracking-tight text-textc">
            SalesAI
          </h2>
          <div className="flex items-center gap-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLoadingScreen;
