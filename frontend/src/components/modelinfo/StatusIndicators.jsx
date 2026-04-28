/** @param {{}} props */
export const StatusIndicators = () => (
  <div className='glass rounded-2xl p-4 sm:p-5'>
    <h3 className='mb-3 font-syne text-base font-semibold'>System Status</h3>
    <div className='flex flex-col gap-3 text-sm'>
      <div className='flex items-center gap-3'>
        <span className='status-pulse h-2.5 w-2.5 rounded-full bg-success' />
        <span className='text-sm'>Model Active</span>
      </div>
      <div className='flex items-center gap-3'>
        <span className='status-pulse h-2.5 w-2.5 rounded-full bg-success' />
        <span className='text-sm'>API Healthy</span>
      </div>
    </div>
  </div>
);

export default StatusIndicators;