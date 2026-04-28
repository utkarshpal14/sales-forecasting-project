import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Cpu, LayoutDashboard, Lightbulb, TrendingUp, X, Zap } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../utils/cn';

/** @param {{ mobileOpen?: boolean, onCloseMobile?: ()=>void }} props */
export const Sidebar = ({ mobileOpen = false, onCloseMobile = () => {} }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const items = useMemo(
    () => [
      ['Dashboard', ROUTES.dashboard, LayoutDashboard],
      ['Predict', ROUTES.predict, TrendingUp],
      ['Optimize', ROUTES.optimize, Zap],
      ['Insights', ROUTES.insights, Lightbulb],
      ['Model Info', ROUTES.modelInfo, Cpu],
    ],
    []
  );

  useEffect(() => {
    onCloseMobile();
    // close drawer after route navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const navItem = (label, path, Icon) => (
    <NavLink key={path} to={path} className='group relative block overflow-hidden rounded-xl'>
      {({ isActive }) => (
        <span
          className={cn(
            'relative flex h-11 items-center gap-3 px-3 text-sm transition-colors',
            isActive ? 'text-textc' : 'text-muted group-hover:text-textc'
          )}
        >
          <span
            className={cn(
              'absolute inset-0 origin-left scale-x-0 rounded-xl bg-primary/15 transition-transform duration-300',
              isActive && 'scale-x-100'
            )}
          />
          <span
            className={cn(
              'absolute left-0 top-2 h-7 w-[3px] rounded-r bg-primary opacity-0 shadow-[0_0_14px_rgba(99,102,241,0.8)] transition-opacity',
              isActive && 'opacity-100'
            )}
          />
          <Icon
            size={18}
            className={cn(
              'relative z-10 transition-transform duration-300',
              isActive ? 'text-primary animate-[floaty_1s_ease-in-out_1]' : 'group-hover:scale-110'
            )}
          />
          {!collapsed && <span className='relative z-10'>{label}</span>}
        </span>
      )}
    </NavLink>
  );

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className='glass hidden h-screen flex-col p-3 md:flex'
      >
        <div className='mb-4 flex items-center gap-2'>
          <div className='h-8 w-8 rounded-lg bg-primary glow-primary' />
          {!collapsed && <span className='font-syne font-bold'>SalesAI</span>}
        </div>
        <nav className='flex-1 space-y-2'>{items.map(([l, p, I]) => navItem(l, p, I))}</nav>
        <button onClick={() => setCollapsed((v) => !v)} className='mt-auto flex h-10 items-center justify-center rounded-xl bg-surface text-muted'>
          <ChevronLeft className={cn('transition', collapsed && 'rotate-180')} />
        </button>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              aria-label='Close mobile menu'
              className='fixed inset-0 z-40 bg-black/60 md:hidden'
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className='glass fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col p-3 md:hidden'
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-8 w-8 rounded-lg bg-primary glow-primary' />
                  <span className='font-syne font-bold'>SalesAI</span>
                </div>
                <button aria-label='Close menu' onClick={onCloseMobile} className='rounded-lg bg-surface p-2 text-muted'>
                  <X size={18} />
                </button>
              </div>
              <nav className='flex-1 space-y-2'>
                {items.map(([l, p, I]) => (
                  <NavLink key={p} to={p} className='group relative block overflow-hidden rounded-xl px-3 py-3 text-sm text-textc hover:bg-primary/15'>
                    <span className='flex items-center gap-3'>
                      <I size={18} />
                      {l}
                    </span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;