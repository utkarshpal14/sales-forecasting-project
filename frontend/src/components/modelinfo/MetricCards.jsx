import { Database, Gauge, Target } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import StatCard from '../ui/StatCard';

/** @param {{ data:any, loading?:boolean }} props */
export const MetricCards = ({ data, loading }) => {
  if (loading) return <Skeleton variant='card' />;
  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
      <StatCard icon={<Target />} label='Model Accuracy' value={(data?.r2_score || 0.62) * 100} trend={2} />
      <StatCard icon={<Gauge />} label='Prediction Error' value={data?.rmse || 994.64} trend={-1} />
      <StatCard icon={<Database />} label='Training Data' value={data?.records || 8523} trend={0} />
    </div>
  );
};

export default MetricCards;