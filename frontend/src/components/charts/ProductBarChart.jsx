import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import mockData from '../../constants/mockData';
import GlassCard from '../ui/GlassCard';
import ChartTooltip from './ChartTooltip';

/** @param {{ data?: any[] }} props */
export const ProductBarChart = ({ data = mockData.productComparison }) => {
  const maxSales = Math.max(...data.map((d) => Number(d.sales || 0)));
  const avg = data.reduce((acc, row) => acc + Number(row.sales || 0), 0) / Math.max(data.length, 1);

  return (
    <GlassCard className='p-4 sm:p-5'>
      <h3 className='mb-3 font-syne text-base font-semibold'>Product Comparison</h3>
      <div className='h-[240px] md:h-80'>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke='var(--color-border)' strokeDasharray='3 3' />
            <XAxis dataKey='product' tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
            <ReferenceLine y={avg} stroke='var(--color-muted)' strokeDasharray='2 4' />
            <Bar dataKey='sales' isAnimationActive animationBegin={0} radius={[8, 8, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.sales === maxSales ? 'var(--color-secondary)' : 'var(--color-primary)'}
                  className={entry.sales === maxSales ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]' : ''}
                />
              ))}
              <LabelList dataKey='sales' position='top' fill='var(--color-muted)' fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className='mt-3 flex flex-wrap gap-2'>
        <span className='rounded-full bg-primary/20 px-3 py-1 text-xs text-primary'>Products</span>
        <span className='rounded-full bg-secondary/20 px-3 py-1 text-xs text-secondary'>Winner Highlight</span>
      </div>
    </GlassCard>
  );
};

export default ProductBarChart;