import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import BestProductPanel from '../components/optimize/BestProductPanel';
import BestStorePanel from '../components/optimize/BestStorePanel';
import OptimalPricePanel from '../components/optimize/OptimalPricePanel';
import OptimizeTabs from '../components/optimize/OptimizeTabs';
import PageHeader from '../components/ui/PageHeader';
import GsapReveal from '../components/ui/GsapReveal';

/** @param {{}} props */
export const OptimizePage = () => {
  const [tab, setTab] = useState(0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }} className='px-4 py-5'>
      <PageHeader title='Optimization Engine' />
      <GsapReveal delay={0.1}>
        <OptimizeTabs activeTab={tab} onChange={setTab} />
      </GsapReveal>
      <GsapReveal delay={0.2}>
        <AnimatePresence mode='wait'>
          {tab === 0 && <BestProductPanel />}
          {tab === 1 && <BestStorePanel />}
          {tab === 2 && <OptimalPricePanel />}
        </AnimatePresence>
      </GsapReveal>
    </motion.div>
  );
};

export default OptimizePage;