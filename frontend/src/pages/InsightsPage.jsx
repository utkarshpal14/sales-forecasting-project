import { motion } from 'framer-motion';
import GaugeChart from '../components/charts/GaugeChart';
import PredictForm from '../components/predict/PredictForm';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ErrorCard from '../components/ui/ErrorCard';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import GsapReveal from '../components/ui/GsapReveal';
import { usePrediction } from '../hooks/usePrediction';

/** @param {{}} props */
export const InsightsPage = () => {
  const { data, loading, error, executeInsight } = usePrediction();
  const sales = Number(data?.predicted_sales || 0);
  const level = data?.demand_level || 'Low';
  const fillClass = level === 'High' ? 'w-[95%]' : level === 'Medium' ? 'w-[60%]' : 'w-[20%]';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }} className='px-4 py-5'>
      <PageHeader title='Business Insights' subtitle='AI-powered demand intelligence' />
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        <GsapReveal delay={0.1}>
          <PredictForm onSubmit={executeInsight} loading={loading} />
        </GsapReveal>
        <GsapReveal delay={0.2}>
          {loading ? (
            <Skeleton variant='card' animationType='data' />
          ) : error ? (
            <ErrorCard message={error} />
          ) : data ? (
            <div className='glass rounded-2xl p-4 sm:p-5'>
              <h3 className='mb-4 font-syne text-lg font-semibold'>Insight Result</h3>
              <GaugeChart value={sales} />
              <div className='mt-2 flex flex-col items-center justify-between gap-3 sm:flex-row'>
                <span className='font-mono text-4xl font-bold gradient-text'>{sales.toFixed(2)}</span>
                <div className='rounded-full'>
                  <Badge level={level} />
                </div>
              </div>
              <div className='mt-4 space-y-3'>
                <div className='flex items-center justify-between border-b border-borderc pb-2'>
                  <span className='text-xs text-muted'>Demand</span>
                  <span className='text-sm font-medium'>{level}</span>
                </div>
                <div className='flex items-center justify-between border-b border-borderc pb-2'>
                  <span className='text-xs text-muted'>Stock Action</span>
                  <span className='text-sm font-medium'>{data?.recommendation}</span>
                </div>
                <div className='flex items-center justify-between border-b border-borderc pb-2'>
                  <span className='text-xs text-muted'>Confidence</span>
                  <span className='text-sm font-medium'>Model-based</span>
                </div>
              </div>
              <div className='mt-4 h-2 rounded-full bg-surface'>
                <div className={`h-full rounded-full bg-primary ${fillClass}`} />
              </div>
              <div className='glass mt-4 flex items-center gap-3 rounded-xl p-4'>
                <span className='text-lg'>*</span>
                <p className='text-sm leading-relaxed text-muted'>{data?.recommendation}</p>
              </div>
            </div>
          ) : (
            <EmptyState message='Generate insight first' />
          )}
        </GsapReveal>
      </div>
    </motion.div>
  );
};

export default InsightsPage;