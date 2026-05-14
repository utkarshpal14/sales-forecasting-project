import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import mockData from '../../constants/mockData';
import GlassCard from '../ui/GlassCard';
import ChartTooltip from './ChartTooltip';

/** @param {{ data?: any[] }} props */
export const PriceRevenueChart = ({ data = mockData.priceRevenue }) => {
  const peak = data.reduce((a, b) => (a.revenue > b.revenue ? a : b), data[0]);
  return (
    <GlassCard className='w-full min-w-0'>
      <h3 className='mb-3 font-syne text-base font-semibold'>Revenue vs Price</h3>
      <div className='h-[220px] w-full min-w-0 md:h-80'>
        <ResponsiveContainer width='100%' height='100%' minWidth={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id='revGrad' x1='0' x2='0' y1='0' y2='1'>
                <stop offset='0%' stopColor='var(--color-success)' stopOpacity='0.55' />
                <stop offset='100%' stopColor='var(--color-success)' stopOpacity='0.03' />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='var(--color-border)' strokeDasharray='3 3' />
            <XAxis dataKey='price' tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-success)', strokeDasharray: '4 4' }} />
            <Area type='monotone' dataKey='revenue' stroke='var(--color-success)' strokeWidth={2} fill='url(#revGrad)' isAnimationActive animationBegin={0} />
            <ReferenceDot x={peak.price} y={peak.revenue} fill='var(--color-warning)' r={6} className='animate-pulse' />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className='mt-2 inline-flex rounded-lg border border-warning/40 bg-warning/10 px-2 py-1 text-xs text-warning'>
        Optimal: ${peak.price}
      </div>
      <div className='mt-3 flex flex-wrap gap-2'>
        <span className='rounded-full bg-success/20 px-3 py-1 text-xs text-success'>Revenue Curve</span>
        <span className='rounded-full bg-warning/20 px-3 py-1 text-xs text-warning'>Optimal Dot</span>
      </div>
    </GlassCard>
  );
};

export default PriceRevenueChart;