import { ArrowRight, Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import GlassCard from '../ui/GlassCard';
import Tilt from 'react-parallax-tilt';

/** @param {{}} props */
export const QuickActions = () => {
  const cards = [
    ['Predict', ROUTES.predict, TrendingUp, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80'],
    ['Optimize', ROUTES.optimize, Zap, 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80'],
    ['Insights', ROUTES.insights, Lightbulb, 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&q=80'],
  ];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {cards.map(([t, p, I, img]) => (
        <Tilt
          key={t}
          tiltEnable={!isMobile}
          glareEnable={true}
          glareMaxOpacity={0.2}
          glareColor="#6366f1"
          glarePosition="all"
          className="h-full rounded-2xl group"
        >
          <Link to={p} className="block h-full relative rounded-2xl overflow-hidden gradient-border-card">
            <img 
              src={img} 
              alt={t} 
              loading="lazy" 
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay transition-transform duration-500 group-hover:scale-110 z-0" 
            />
            <GlassCard className='h-full p-4 relative z-10 border-none !bg-surface/40'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <I className='mb-3 h-8 w-8 text-primary' />
                  <h3 className='mb-3 font-syne text-sm font-semibold'>{t}</h3>
                  <p className='text-xs text-muted'>Open {t.toLowerCase()} tools</p>
                </div>
                <ArrowRight className='mt-1 h-5 w-5 text-muted transition-transform group-hover:translate-x-1' />
              </div>
            </GlassCard>
          </Link>
        </Tilt>
      ))}
    </div>
  );
};

export default QuickActions;