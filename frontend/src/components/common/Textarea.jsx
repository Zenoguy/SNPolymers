import React from 'react';

/**
 * Reusable glassmorphic Textarea component.
 */
const Textarea = React.forwardRef(({
  label,
  error,
  rows = 4,
  className = '',
  id,
  disabled = false,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`w-full glass-input focus:ring-0 outline-none rounded-xl px-4 py-3 text-xs font-semibold text-slate-200 transition bg-black ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          error ? 'border-red-500/50 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-red-400 font-semibold mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
