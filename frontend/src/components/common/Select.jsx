import React from 'react';

/**
 * Reusable glassmorphic Select component.
 */
const Select = React.forwardRef(({
  label,
  error,
  options = [],
  children,
  size = 'md', // 'sm' | 'md'
  className = '',
  id,
  disabled = false,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const sizes = {
    sm: 'px-3 py-2 text-xs rounded-lg',
    md: 'px-3.5 py-2.5 text-xs text-slate-200 rounded-xl',
  };

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        className={`w-full glass-input focus:ring-0 outline-none bg-black border border-white/5 ${
          sizes[size] || sizes.md
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          error ? 'border-red-500/50 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children ? children : (
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        )}
      </select>
      {error && (
        <p className="text-[10px] text-red-400 font-semibold mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
