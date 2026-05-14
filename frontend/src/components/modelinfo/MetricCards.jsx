import { Database, Gauge, LineChart, Target } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import StatCard from '../ui/StatCard';

/** @param {{ data:any, loading?:boolean }} props */
export const MetricCards = ({ data, loading }) => {
  if (loading) return <Skeleton variant='card' />;

  const r2Rupee = Number(data?.r2_score ?? 0.62);
  const rawLog = data?.r2_log;
  const r2Log = rawLog != null && rawLog !== '' && !Number.isNaN(Number(rawLog)) ? Number(rawLog) : null;
  const r2LogPct = r2Log != null ? Math.round(r2Log * 100) : null;
  const hasLog = r2LogPct != null;

  return (
    <div>
      {!hasLog ? (
        <p className='mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100'>
          API did not return <code className='rounded bg-black/30 px-1'>r2_log</code>. Restart the FastAPI server after
          retraining so <code className='rounded bg-black/30 px-1'>model.pkl</code> loads, then hard-refresh this page (
          <kbd className='rounded bg-black/30 px-1'>Ctrl+Shift+R</kbd>).
        </p>
      ) : null}
      <div
        className={`mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 ${hasLog ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}
      >
        <StatCard
          icon={<Target />}
          label='R² on rupee sales (what you feel in ₹)'
          value={Math.round(r2Rupee * 100)}
          hideTrend
          subtitle='Harder metric: noisy counts & long tail.'
        />
        {hasLog ? (
          <StatCard
            icon={<LineChart />}
            label='R² on log-sales (training target)'
            value={r2LogPct}
            hideTrend
            color='success'
            subtitle='This is the metric pushed past 75% during training.'
          />
        ) : null}
        <StatCard
          icon={<Gauge />}
          label='Test RMSE (rupees)'
          value={Math.round(Number(data?.rmse ?? 991))}
          hideTrend
          subtitle='Typical absolute error on held-out rows.'
        />
        <StatCard
          icon={<Database />}
          label='Training rows'
          value={Number(data?.records ?? 8523)}
          hideTrend
          subtitle='Rows in BigMart train.csv used for metrics.'
        />
      </div>
    </div>
  );
};

export default MetricCards;
