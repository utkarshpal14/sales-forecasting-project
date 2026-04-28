import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import mockData from '../../constants/mockData';
import GlassCard from '../ui/GlassCard';
import ChartTooltip from './ChartTooltip';

/** @param {{ data?: any[] }} props */
export const StoreBarChart = ({ data = mockData.storeComparison }) => (
  <GlassCard className='p-4 sm:p-5'>
    <h3 className='mb-3 font-syne text-base font-semibold'>Store Comparison</h3>
    <div className='h-[240px] md:h-80'>
      <ResponsiveContainer>
        <BarChart layout='vertical' data={data}>
          <CartesianGrid stroke='var(--color-border)' strokeDasharray='3 3' />
          <XAxis type='number' tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <YAxis type='category' dataKey='store' tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(34,211,238,0.08)' }} />
          <Bar dataKey='sales' fill='var(--color-secondary)' isAnimationActive animationBegin={0} radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className='mt-3 flex flex-wrap gap-2'>
      <span className='rounded-full bg-secondary/20 px-3 py-1 text-xs text-secondary'>Store Sales</span>
    </div>
  </GlassCard>
);

export default StoreBarChart;