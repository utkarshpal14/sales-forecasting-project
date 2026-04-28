import { motion } from 'framer-motion';

/** @param {{ activeTab:number, onChange:(i:number)=>void }} props */
export const OptimizeTabs = ({ activeTab, onChange }) => {
  const tabs = ['Best Product', 'Best Store', 'Optimal Price'];
  return (
    <div className='mb-6 overflow-x-auto'>
      <div className='flex min-w-[420px] snap-x rounded-xl bg-surface p-1'>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => onChange(i)} className='relative h-11 flex-1 snap-start rounded-lg px-4 text-sm'>
            {activeTab === i && <motion.span layoutId='tab' className='absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary' />}
            <span className='relative'>{t}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OptimizeTabs;