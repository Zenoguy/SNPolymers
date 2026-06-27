import React from 'react';

/**
 * Reusable glassmorphic Input component.
 */
const Input = React.forwardRef(({
  label,
  error,
  icon,
  type = 'text',
  size = 'md', // 'sm' | 'md'
  className = '',
  id,
  disabled = false,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const sizes = {
    sm: 'px-3 py-2 text-xs rounded-lg',
    md: 'px-4 py-3 text-xs font-semibold rounded-xl',
  };

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          disabled={disabled}
          className={`w-full glass-input focus:ring-0 outline-none text-slate-200 transition bg-black ${
            sizes[size] || sizes.md
          } ${
            icon ? 'pl-12' : ''
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            error ? 'border-red-500/50 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] text-red-400 font-semibold mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
