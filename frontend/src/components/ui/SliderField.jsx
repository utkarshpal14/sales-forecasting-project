/** @param {{ label:string, value:number|string, onChange:(e:any)=>void, min?:number,max?:number,step?:number }} props */
export const SliderField = ({ label, value, onChange, min = 0, max = 50, step = 1 }) => (
  <div className='space-y-2'>
    <div className='flex items-center justify-between'>
      <span className='text-sm font-medium text-textc'>{label}</span>
      <span className='rounded-full bg-primary/20 px-2 py-1 font-mono text-sm text-primary'>{value}</span>
    </div>
    <input type='range' value={value} onChange={onChange} min={min} max={max} step={step} className='h-11 w-full accent-primary' />
  </div>
);

export default SliderField;