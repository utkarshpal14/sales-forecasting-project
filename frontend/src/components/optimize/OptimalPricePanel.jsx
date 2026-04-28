import { DollarSign } from 'lucide-react';
import { useOptimize } from '../../hooks/useOptimize';
import PriceRevenueChart from '../charts/PriceRevenueChart';
import PredictForm from '../predict/PredictForm';
import EmptyState from '../ui/EmptyState';
import ErrorCard from '../ui/ErrorCard';
import Tilt from 'react-parallax-tilt';

/** @param {{}} props */
export const OptimalPricePanel = () => {
  const { data, loading, error, getOptimalPrice } = useOptimize();
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <PredictForm onSubmit={({ Item_Type, Outlet_Type, Outlet_Age, Outlet_Location_Type, Item_MRP = 180 }) => getOptimalPrice({ Item_MRP, Item_Type, Outlet_Type, Outlet_Age, Outlet_Location_Type })} loading={loading} />
      <div>
        {error && <ErrorCard message={error} />}
        {!data && <EmptyState message='Run optimization first' />}
        {data && (
          <>
            <Tilt
              tiltEnable={typeof window !== 'undefined' && window.innerWidth >= 768}
              glareEnable={true}
              glareMaxOpacity={0.15}
              glareColor="#10b981"
              glarePosition="all"
              className="mb-4 rounded-xl gradient-border-card"
            >
              <div className='rounded-xl bg-success/20 p-4 text-success h-full glow-secondary'>
                <DollarSign className='mb-2 h-5 w-5' />
                <p className='text-xs font-mono text-success/90'>Optimal price point</p>
                <p className='font-mono text-3xl font-bold gradient-text'>{data.optimal_price}</p>
                <p className='text-xs text-muted'>Best price in tested range</p>
                <p className='mt-2 text-lg font-semibold'>Revenue: {Number(data.expected_revenue || 0).toFixed(2)}</p>
              </div>
            </Tilt>
            <PriceRevenueChart data={data.analysis} />
          </>
        )}
      </div>
    </div>
  );
};

export default OptimalPricePanel;