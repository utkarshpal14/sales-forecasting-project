import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import mockData from '../../constants/mockData';
import GlassCard from '../ui/GlassCard';
import ChartTooltip from './ChartTooltip';

/** @param {{ data?: any[] }} props */
export const SalesTrendChart = ({ data = mockData.salesTrend }) => {
  const avg = data.reduce((acc, row) => acc + Number(row.sales || 0), 0) / Math.max(data.length, 1);

  return (
    <GlassCard className='w-full min-w-0 p-4 sm:p-5'>
      <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <h3 className='font-syne text-base font-semibold'>12-Month Sales Trend</h3>
        <span className='w-fit rounded-full bg-surface px-2 py-1 text-xs text-muted'>Last 12 Months</span>
      </div>
      <div className='h-[220px] w-full min-w-0 md:h-80'>
        <ResponsiveContainer width='100%' height='100%' minWidth={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id='salesGrad' x1='0' x2='0' y1='0' y2='1'>
                <stop offset='0%' stopColor='var(--color-primary)' stopOpacity='0.7' />
                <stop offset='100%' stopColor='var(--color-primary)' stopOpacity='0.02' />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='var(--color-border)' strokeDasharray='3 3' />
            <XAxis
              dataKey='month'
              tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }}
              interval={1}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-secondary)', strokeDasharray: '4 4' }} />
            <ReferenceLine y={avg} stroke='var(--color-muted)' strokeDasharray='4 4' />
            <Area
              type='monotone'
              dataKey='sales'
              stroke='var(--color-secondary)'
              fill='url(#salesGrad)'
              strokeWidth={2}
              isAnimationActive
              animationBegin={0}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className='mt-3 flex flex-wrap gap-2'>
        <span className='rounded-full bg-primary/20 px-3 py-1 text-xs text-primary'>Sales Curve</span>
        <span className='rounded-full bg-muted/20 px-3 py-1 text-xs text-muted'>Average Line</span>
      </div>
    </GlassCard>
  );
};

export default SalesTrendChart;