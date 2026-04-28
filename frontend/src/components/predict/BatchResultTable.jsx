import { getDemandLevel } from '../../utils/formatters';

/** @param {{ data:any }} props */
export const BatchResultTable = ({ data }) => (
  <div className='glass rounded-2xl p-4 sm:p-5'>
    <h3 className='mb-3 font-syne text-base font-semibold'>Batch Results ({data?.count || 0})</h3>
    <div className='overflow-x-auto'>
      <table className='min-w-[320px] w-full text-xs'>
        <thead>
          <tr className='text-muted'>
            <th className='p-2 text-left'>#</th>
            <th className='p-2 text-left'>Predicted Sales</th>
            <th className='p-2 text-left'>Demand Level</th>
          </tr>
        </thead>
        <tbody>
          {(data?.predictions || []).map((p, i) => (
            <tr key={i} className='h-10 border-t border-borderc'>
              <td className='p-2'>{i + 1}</td>
              <td className='p-2 font-mono'>{Number(p).toFixed(2)}</td>
              <td className='p-2'>{getDemandLevel(Number(p))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default BatchResultTable;