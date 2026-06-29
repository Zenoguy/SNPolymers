import React from 'react';

const Checkbox = React.forwardRef(({
  label,
  description,
  error,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col text-left ${containerClassName}`}>
      <label className="inline-flex items-start gap-2.5 cursor-pointer group select-none">
        <input
          ref={ref}
          type="checkbox"
          className={`mt-0.5 rounded bg-slate-950 border-white/10 text-amber-500 focus:ring-0 cursor-pointer transition-colors duration-200 group-hover:border-white/25 w-4 h-4 ${className}`}
          {...props}
        />
        
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-xs font-bold text-slate-300 group-hover:text-slate-100 transition-colors duration-200">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[10px] text-slate-500 mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>

      {error && (
        <span className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
