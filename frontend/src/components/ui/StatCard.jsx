import { TrendingDown, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';
import { useCountUp } from '../../hooks/useCountUp';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

/** @param {{ icon: import('react').ReactNode, label:string, value:number, trend?:number, hideTrend?:boolean, color?:string, subtitle?:string }} props */
export const StatCard = ({
  icon,
  label,
  value,
  trend = 0,
  hideTrend = false,
  color = 'primary',
  subtitle,
}) => {
  const c = useCountUp(value);
  const up = trend >= 0;
  const colorClasses =
    color === 'secondary'
      ? 'bg-secondary/20 text-secondary'
      : color === 'success'
      ? 'bg-success/20 text-success'
      : 'bg-primary/20 text-primary';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <Tilt
      tiltEnable={!isMobile}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#6366f1"
      glarePosition="all"
      className="rounded-2xl gradient-border-card"
    >
      <GlassCard className='stat-sweep relative overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-4 h-full'>
        <motion.div
          className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0'
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        />
        <div className='relative z-10 flex items-center justify-between'>
          <div className='min-w-0 flex-1 pr-2'>
            <p className='text-xs leading-snug text-muted line-clamp-2'>{label}</p>
            <h3 className='font-mono text-2xl font-bold'>{Math.round(c).toLocaleString()}</h3>
            {!hideTrend ? (
              <p className={up ? 'text-success text-xs' : 'text-danger text-xs'}>
                {up ? <TrendingUp className='mr-1 inline h-3' /> : <TrendingDown className='mr-1 inline h-3' />}
                {Math.abs(trend)}%
              </p>
            ) : null}
            {subtitle ? <p className='mt-1 text-[11px] leading-snug text-muted/90'>{subtitle}</p> : null}
          </div>
          <div className={`rounded-xl p-2 ${colorClasses}`}>{icon}</div>
        </div>
      </GlassCard>
    </Tilt>
  );
};

export default StatCard;