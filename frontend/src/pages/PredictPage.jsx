import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import BatchResultTable from '../components/predict/BatchResultTable';
import BatchUpload from '../components/predict/BatchUpload';
import PredictForm from '../components/predict/PredictForm';
import PredictResult from '../components/predict/PredictResult';
import EmptyState from '../components/ui/EmptyState';
import ErrorCard from '../components/ui/ErrorCard';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import GsapReveal from '../components/ui/GsapReveal';
import { usePrediction } from '../hooks/usePrediction';

/** @param {{}} props */
export const PredictPage = () => {
  const [mode, setMode] = useState('single');
  const { data, loading, error, execute, executeBatch } = usePrediction();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }} className='px-4 py-5'>
      <PageHeader title='Sales Prediction' />
      <div className='mb-4 grid w-full grid-cols-2 gap-2 rounded-2xl bg-surface p-1'>
        <button onClick={() => setMode('single')} className={`h-11 rounded-xl border text-sm font-medium ${mode === 'single' ? 'border-primary bg-primary text-white' : 'border-borderc bg-surface text-muted'}`}>
          Single Prediction
        </button>
        <button onClick={() => setMode('batch')} className={`h-11 rounded-xl border text-sm font-medium ${mode === 'batch' ? 'border-primary bg-primary text-white' : 'border-borderc bg-surface text-muted'}`}>
          Batch Processing
        </button>
      </div>
      <AnimatePresence mode='wait'>
        {mode === 'single' ? (
          <motion.div key='single' className='grid gap-4 lg:grid-cols-2'>
            <GsapReveal delay={0.1}>
              <PredictForm onSubmit={execute} loading={loading} />
            </GsapReveal>
            <GsapReveal delay={0.2}>
              {loading ? <Skeleton variant='card' animationType='brain' /> : error ? <ErrorCard message={error} /> : data ? <PredictResult data={data} /> : <EmptyState message='Run a prediction first' />}
            </GsapReveal>
          </motion.div>
        ) : (
          <motion.div key='batch' className='grid gap-4 lg:grid-cols-2'>
            <GsapReveal delay={0.1}>
              <BatchUpload onSubmit={executeBatch} loading={loading} />
            </GsapReveal>
            <GsapReveal delay={0.2}>
              {loading ? <Skeleton variant='table' animationType='data' /> : error ? <ErrorCard message={error} /> : data ? <BatchResultTable data={data} /> : <EmptyState message='Upload JSON and run batch' />}
            </GsapReveal>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PredictPage;