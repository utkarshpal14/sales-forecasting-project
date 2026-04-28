import { AnimatePresence, motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import useMobileMenu from '../../hooks/useMobileMenu';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/** @param {{}} props */
export const AppLayout = () => {
  const mobileMenu = useMobileMenu();

  return (
    <div className='min-h-screen bg-bg text-textc md:flex'>
      <Sidebar mobileOpen={mobileMenu.isOpen} onCloseMobile={mobileMenu.close} />
      <main className='flex-1 p-4 md:p-6'>
        <TopBar onOpenMobileMenu={mobileMenu.open} />
        <AnimatePresence mode='wait'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AppLayout;