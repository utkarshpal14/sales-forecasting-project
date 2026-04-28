import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

/** @param {{ onOpenMobileMenu?: ()=>void }} props */
export const TopBar = ({ onOpenMobileMenu = () => {} }) => {
  const loc = useLocation();
  const title = loc.pathname === '/' ? 'Dashboard' : loc.pathname.slice(1).replace('-', ' ');

  return (
    <header className='relative mb-6 rounded-2xl border border-borderc bg-surface/70 px-4 py-3'>
      <div className='flex items-center justify-between gap-4 md:hidden'>
        <button aria-label='Open menu' onClick={onOpenMobileMenu} className='rounded-lg border border-borderc bg-surface p-2 text-muted'>
          <Menu size={18} />
        </button>
        <h2 className='text-center font-syne text-lg capitalize'>{title}</h2>
        <div className='w-9' />
      </div>

      <div className='mt-2 text-center md:mt-0 md:hidden'>
        <p className='text-xs text-muted'>Sales Forecasting / {title}</p>
      </div>

      <div className='hidden h-10 items-center justify-between md:flex'>
        <div>
          <p className='text-xs text-muted'>Sales Forecasting / {title}</p>
          <h2 className='font-syne text-xl capitalize'>{title}</h2>
        </div>
        <div className='flex items-center gap-2 rounded-full bg-success/20 px-3 py-1 text-xs text-success'>
          <span className='status-pulse h-2 w-2 rounded-full bg-success' />
          API Online
        </div>
      </div>
    </header>
  );
};

export default TopBar;