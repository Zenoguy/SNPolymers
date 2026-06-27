import React from 'react';

/**
 * Reusable glassmorphic & themed Button component.
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left', // 'left' | 'right'
  className = '',
  onClick,
  ...props
}) => {
  // Base classes for premium theme button
  const baseClasses = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-300 shrink-0 transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none';

  // Variant-specific classes
  const variants = {
    primary: 'bg-white hover:bg-slate-100 text-slate-950 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    secondary: 'border border-white/10 hover:bg-white/5 text-slate-300 hover:text-slate-100',
    danger: 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300',
    success: 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300',
    ghost: 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent',
  };

  // Size-specific classes
  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] rounded-lg gap-1',
    md: 'px-4 py-2.5 text-xs rounded-xl gap-2',
    lg: 'px-5 py-3 text-xs rounded-xl gap-2',
  };

  const buttonClasses = [
    baseClasses,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="flex items-center justify-center">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="flex items-center justify-center">{icon}</span>
      )}
    </button>
  );
};

export default Button;
