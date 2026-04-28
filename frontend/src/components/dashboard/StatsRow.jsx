import { motion } from 'framer-motion';
import { Activity, BarChart3, DollarSign, Target } from 'lucide-react';
import StatCard from '../ui/StatCard';

/** @param {{}} props */
export const StatsRow = () => {
  const items = [
    { label: 'Avg Sales', value: 1624, trend: 8, icon: <DollarSign /> },
    { label: 'Model R2', value: 62, trend: 3, icon: <Target /> },
    { label: 'Active Endpoints', value: 7, trend: 0, icon: <Activity /> },
    { label: 'Predictions Today', value: 248, trend: 12, icon: <BarChart3 /> },
  ];

  return (
    <motion.div
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      initial='initial'
      animate='animate'
      className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4'
    >
      {items.map((i) => (
        <motion.div key={i.label} variants={{ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard {...i} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsRow;