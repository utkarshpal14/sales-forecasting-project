import React from 'react';
import { cn } from '../../utils/cn';

/** @param {{ label: string, error?: string, [key: string]: any }} props */
export const InputField = React.forwardRef(({ label, error, ...props }, ref) => (
  <label className='block'>
    <div
      className={cn(
        'group relative rounded-xl border border-borderc bg-surface/90 transition-all duration-300 focus-within:bg-surface',
        'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-xl before:bg-transparent before:transition-all',
        'focus-within:before:bg-gradient-to-b focus-within:before:from-primary focus-within:before:to-secondary',
        error && 'border-danger'
      )}
    >
      <input
        ref={ref}
        {...props}
        placeholder=' '
        className='peer h-11 w-full rounded-xl bg-transparent px-3 pt-3 text-textc outline-none'
      />
      <span className='pointer-events-none absolute left-3 top-3 text-sm text-muted transition-all duration-200 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px]'>
        {label}
      </span>
    </div>
    {error && <p className='mt-1 text-xs text-danger'>{error}</p>}
  </label>
));

InputField.displayName = 'InputField';

export default InputField;