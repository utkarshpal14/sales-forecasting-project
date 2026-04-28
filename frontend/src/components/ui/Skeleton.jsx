import { cn } from '../../utils/cn';
import { Player } from '@lottiefiles/react-lottie-player';

/** @param {{ variant?: string, animationType?: 'brain' | 'chart' | 'data' }} props */
export const Skeleton = ({ variant = 'card', animationType = 'data' }) => {
  const m = { card: 'h-48 w-full', chart: 'h-72 w-full', table: 'h-64 w-full', text: 'h-16 w-1/2' };
  
  const getLottieSrc = () => {
    switch (animationType) {
      case 'brain': return 'https://assets2.lottiefiles.com/packages/lf20_kxsd2ytq.json';
      case 'chart': return 'https://assets9.lottiefiles.com/packages/lf20_qp1q7mct.json';
      case 'data': 
      default: return 'https://assets4.lottiefiles.com/packages/lf20_szlepvdh.json';
    }
  };

  return (
    <div className={cn('glass rounded-2xl bg-surface/60 flex items-center justify-center p-4', m[variant])}>
      <Player
        autoplay
        loop
        src={getLottieSrc()}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default Skeleton;