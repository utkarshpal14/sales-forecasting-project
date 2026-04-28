import { motion } from 'framer-motion';

/** @param {{ value:number }} props */
export const GaugeChart = ({ value = 0 }) => {
  const max = 5000;
  const p = Math.min(Math.max(value, 0), max) / max;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference * (1 - p);
  const color = value > 1500 ? 'var(--color-success)' : value >= 800 ? 'var(--color-warning)' : 'var(--color-danger)';
  const needleDeg = -130 + p * 260;

  return (
    <div className='relative mx-auto h-44 w-44'>
      <svg viewBox='0 0 180 180' className='h-full w-full -rotate-90'>
        <circle cx='90' cy='90' r='70' stroke='var(--color-border)' strokeWidth='12' fill='none' />
        <motion.circle
          cx='90'
          cy='90'
          r='70'
          stroke={color}
          strokeWidth='12'
          fill='none'
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <motion.div
        className='absolute left-1/2 top-1/2 h-14 w-[2px] -translate-x-1/2 -translate-y-[70%] origin-bottom rounded-full bg-textc'
        initial={{ rotate: -130 }}
        animate={{ rotate: needleDeg }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <p className='font-mono text-2xl'>{Math.round(value)}</p>
        <span className='text-xs text-muted'>units</span>
      </div>
    </div>
  );
};

export default GaugeChart;