import { motion } from 'framer-motion';
import SalesTrendChart from '../components/charts/SalesTrendChart';
import HeroSection from '../components/dashboard/HeroSection';
import QuickActions from '../components/dashboard/QuickActions';
import StatsRow from '../components/dashboard/StatsRow';
import PageHeader from '../components/ui/PageHeader';
import RotatingGrid from '../components/3d/RotatingGrid';
import GsapReveal from '../components/ui/GsapReveal';

/** @param {{}} props */
export const DashboardPage = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }} className='px-4 py-5 relative min-h-screen overflow-hidden'>
    <RotatingGrid />
    <div className='relative z-10'>
      <PageHeader title='Dashboard' subtitle='Real-time sales intelligence' />
      <HeroSection />
      <GsapReveal delay={0.1}><StatsRow /></GsapReveal>
      <GsapReveal delay={0.2}><SalesTrendChart /></GsapReveal>
      <GsapReveal delay={0.3}>
        <div className='mt-6'>
          <QuickActions />
        </div>
      </GsapReveal>
    </div>
  </motion.div>
);

export default DashboardPage;