import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';

const data = [
  { feature: 'Base', value: 80 },
  { feature: 'Interaction', value: 72 },
  { feature: 'Polynomial', value: 61 },
  { feature: 'Ratio', value: 70 },
  { feature: 'Advanced', value: 66 },
];

/** @param {{}} props */
export const FeatureRadarChart = () => (
  <GlassCard className='w-full min-w-0 p-4 sm:p-5'>
    <h3 className='mb-3 font-syne text-base font-semibold'>Feature Group Importance</h3>
    <div className='h-[240px] w-full min-w-0 md:h-80'>
      <ResponsiveContainer width='100%' height='100%' minWidth={0}>
        <RadarChart data={data}>
          <PolarGrid stroke='var(--color-border)' />
          <PolarAngleAxis dataKey='feature' tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }} />
          <Radar
            dataKey='value'
            stroke='var(--color-primary)'
            fill='var(--color-primary)'
            fillOpacity={0.35}
            dot={{ fill: 'var(--color-secondary)', r: 3 }}
            isAnimationActive
            animationBegin={0}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
    <div className='mt-3 flex flex-wrap gap-2'>
      <span className='rounded-full bg-primary/20 px-3 py-1 text-xs text-primary'>Importance Surface</span>
      <span className='rounded-full bg-secondary/20 px-3 py-1 text-xs text-secondary'>Vertices</span>
    </div>
  </GlassCard>
);

export default FeatureRadarChart;