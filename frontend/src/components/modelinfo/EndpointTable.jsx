const rows = [
  ['POST', '/predict', 'Single prediction', '<100ms'],
  ['POST', '/predict-batch', 'Batch predictions', 'varies'],
  ['POST', '/insight', 'Business insights', '<100ms'],
  ['POST', '/best-product', 'Product optimizer', '<200ms'],
  ['POST', '/best-store', 'Store optimizer', '<200ms'],
  ['POST', '/optimal-price', 'Price optimizer', '<300ms'],
  ['GET', '/model-info', 'System metrics', '<50ms'],
];

/** @param {{}} props */
export const EndpointTable = () => (
  <div className='glass mt-6 overflow-x-auto rounded-2xl p-4 sm:p-5'>
    <table className='w-full min-w-[420px] text-xs'>
      <thead>
        <tr className='text-muted'>
          <th className='p-2 text-left'>Method</th>
          <th className='p-2 text-left'>Endpoint</th>
          <th className='hidden p-2 text-left sm:table-cell'>Purpose</th>
          <th className='p-2 text-left'>Response Time</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[1]} className='border-t border-borderc'>
            <td className='p-2'>
              <span className={`rounded-full px-2 py-0.5 text-xs ${r[0] === 'POST' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>{r[0]}</span>
            </td>
            <td className='max-w-[140px] truncate p-2 font-mono text-xs'>{r[1]}</td>
            <td className='hidden p-2 sm:table-cell'>{r[2]}</td>
            <td className='p-2'>{r[3]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EndpointTable;