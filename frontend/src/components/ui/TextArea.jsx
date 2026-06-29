import React from 'react';

const TextArea = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  containerClassName = '',
  rows = 3,
  resize = 'none', // 'none' | 'vertical' | 'horizontal' | 'both'
  size = 'md', // 'sm' | 'md' | 'lg'
  ...props
}, ref) => {
  const sizeStyles = {
    sm: 'px-3 py-2 text-xs rounded-xl',
    md: 'px-4 py-3 text-sm rounded-xl',
    lg: 'px-5 py-4 text-base rounded-2xl',
  };

  const inputSizeClass = sizeStyles[size] || sizeStyles.md;
  const errorClass = error ? 'border-red-500/50 focus:border-red-500' : '';
  const resizeClass = resize === 'none' ? 'resize-none' : 
                      resize === 'vertical' ? 'resize-y' : 
                      resize === 'horizontal' ? 'resize-x' : 'resize';

  return (
    <div className={`flex flex-col w-full text-left ${containerClassName}`}>
      {label && (
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        required={required}
        className={`w-full glass-input focus:ring-0 outline-none font-semibold text-slate-100 transition duration-200 ${inputSizeClass} ${resizeClass} ${errorClass} ${className}`}
        {...props}
      />

      {error && (
        <span className="mt-1.5 text-[10px] font-semibold text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </span>
      )}

      {!error && helperText && (
        <span className="mt-1.5 text-[10px] text-slate-500">
          {helperText}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
