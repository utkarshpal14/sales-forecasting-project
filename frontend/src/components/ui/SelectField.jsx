import React from 'react';
import { cn } from '../../utils/cn';

/** @param {{ label: string, options: {value:number,label:string}[], error?: string, [key:string]: any }} props */
export const SelectField = React.forwardRef(({ label, options, error, ...props }, ref) => (
  <label className='block space-y-1'>
    <span className='text-sm font-medium text-textc'>{label}</span>
    <select
      ref={ref}
      {...props}
      className={cn('h-11 w-full rounded-xl border border-borderc bg-surface px-3 text-sm text-textc outline-none focus:border-primary', error && 'border-danger')}
    >
      <option value=''>Select...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {error && <p className='text-xs text-danger'>{error}</p>}
  </label>
));

SelectField.displayName = 'SelectField';

export default SelectField;