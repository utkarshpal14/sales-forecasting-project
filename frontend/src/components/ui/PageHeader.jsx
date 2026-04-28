/** @param {{ title:string, subtitle?:string, icon?:import('react').ReactNode, bgImage?:string }} props */
export const PageHeader = ({ title, subtitle, icon, bgImage }) => (
  <div className={`mb-6 flex items-start justify-between gap-4 ${bgImage ? 'p-6 rounded-2xl relative overflow-hidden glass' : ''}`}>
    {bgImage && (
      <img src={bgImage} alt="Header Background" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay z-0" />
    )}
    <div className='min-w-0 relative z-10'>
      <h1 className='font-syne text-xl font-extrabold gradient-text sm:text-3xl'>{title}</h1>
      {subtitle && <p className='mt-1 text-sm text-muted'>{subtitle}</p>}
    </div>
    {icon && <div className='rounded-xl bg-primary/20 p-3 text-primary relative z-10'>{icon}</div>}
  </div>
);

export default PageHeader;