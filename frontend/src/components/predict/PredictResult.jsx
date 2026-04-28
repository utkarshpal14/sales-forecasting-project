import { motion } from 'framer-motion';
import GaugeChart from '../charts/GaugeChart';
import Badge from '../ui/Badge';
import { getDemandLevel, getRecommendation } from '../../utils/formatters';
import Tilt from 'react-parallax-tilt';
import { Player } from '@lottiefiles/react-lottie-player';

/** @param {{ data:any }} props */
export const PredictResult = ({ data }) => {
  const sales = Number(data?.predicted_sales || 0);
  const level = getDemandLevel(sales);
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
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className='pulse-once glass relative overflow-hidden rounded-2xl border border-primary/30 p-4 sm:p-5 h-full'
      >
        <div className="absolute top-2 right-2 w-16 h-16 z-20 pointer-events-none">
          <Player
            autoplay
            keepLastFrame
            src="https://assets3.lottiefiles.com/packages/lf20_jbrw3hcz.json"
          />
        </div>
        <h3 className='mb-3 font-syne text-base font-semibold sm:text-xl'>Prediction Result</h3>
        <GaugeChart value={sales} />
        <div className='mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between'>
          <Badge level={level} />
          <p className='font-mono text-3xl font-bold'>{sales.toFixed(2)}</p>
        </div>
        <p className='mt-2 text-sm leading-relaxed text-muted'>{getRecommendation(sales)}</p>
        {level === 'High' && (
          <div className='pointer-events-none absolute inset-0'>
            <span className='absolute left-1/4 top-1/3 h-2 w-2 animate-ping rounded-full bg-success' />
            <span className='absolute left-1/2 top-1/4 h-2 w-2 animate-ping rounded-full bg-secondary [animation-delay:120ms]' />
            <span className='absolute left-2/3 top-1/3 h-2 w-2 animate-ping rounded-full bg-primary [animation-delay:220ms]' />
            <span className='absolute left-1/3 top-1/2 h-2 w-2 animate-ping rounded-full bg-warning [animation-delay:320ms]' />
          </div>
        )}
      </motion.div>
    </Tilt>
  );
};

export default PredictResult;