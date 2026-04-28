import { motion } from 'framer-motion';
import FeatureRadarChart from '../components/charts/FeatureRadarChart';
import EndpointTable from '../components/modelinfo/EndpointTable';
import FeatureBadges from '../components/modelinfo/FeatureBadges';
import MetricCards from '../components/modelinfo/MetricCards';
import StatusIndicators from '../components/modelinfo/StatusIndicators';
import ErrorCard from '../components/ui/ErrorCard';
import PageHeader from '../components/ui/PageHeader';
import FloatingCubes from '../components/3d/FloatingCubes';
import GsapReveal from '../components/ui/GsapReveal';
import { useModelInfo } from '../hooks/useModelInfo';

/** @param {{}} props */
export const ModelInfoPage = () => {
  const { data, loading, error } = useModelInfo();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }} className='px-4 py-5 relative min-h-screen overflow-hidden'>
      <FloatingCubes />
      <div className='relative z-10'>
        <PageHeader title='Model Information' bgImage="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80" />
        {error && <ErrorCard message={error} />}
        <GsapReveal scale={true} delay={0.1}>
          <MetricCards data={data} loading={loading} />
        </GsapReveal>
        <GsapReveal delay={0.2}>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 mt-6'>
            <FeatureRadarChart />
            <StatusIndicators />
          </div>
        </GsapReveal>
        <GsapReveal delay={0.3}>
          <div className="mt-6">
            <FeatureBadges />
          </div>
        </GsapReveal>
        <GsapReveal delay={0.4}>
          <div className="mt-6">
            <EndpointTable />
          </div>
        </GsapReveal>
      </div>
    </motion.div>
  );
};

export default ModelInfoPage;