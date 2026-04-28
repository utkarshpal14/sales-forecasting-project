import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '../../utils/cn';

/** @param {{ children: import('react').ReactNode, variant?: string, loading?: boolean, className?: string, type?: 'button'|'submit'|'reset', onClick?: (e:any)=>void }} props */
export const Button = ({ children, variant = 'primary', loading, className, type = 'button', onClick }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const newRipple = {
      id: Date.now(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== newRipple.id)), 400);
    onClick?.(event);
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-primary to-secondary text-white bg-[length:180%_180%] transition-[background-position] duration-300 hover:bg-right-center',
    ghost: 'border border-borderc text-textc bg-surface/40',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'relative isolate h-11 min-w-28 overflow-hidden rounded-xl px-4 text-sm font-medium disabled:opacity-60',
        variants[variant],
        className
      )}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className='pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-ripple rounded-full bg-white/30'
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
      <span className='relative z-10'>{loading ? 'Loading...' : children}</span>
    </motion.button>
  );
};

export default Button;