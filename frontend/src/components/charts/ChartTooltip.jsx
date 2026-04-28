/** @param {{ active?: boolean, payload?: any[], label?: string|number }} props */
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className='glass rounded-xl px-3 py-2 text-xs'>
      <p className='mb-1 text-muted'>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className='font-medium text-textc'>
          {entry.name || entry.dataKey}: {Number(entry.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default ChartTooltip;
