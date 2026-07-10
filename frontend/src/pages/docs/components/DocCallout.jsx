import React from 'react';

const DocCallout = ({ type = 'note', children }) => {
  const styles = {
    note: {
      borderClass: 'border-indigo-500/30',
      bgClass: 'bg-indigo-500/5',
      iconClass: 'text-indigo-400',
      label: 'Note',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      borderClass: 'border-amber-500/30',
      bgClass: 'bg-amber-500/5',
      iconClass: 'text-amber-400',
      label: 'Warning',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    important: {
      borderClass: 'border-rose-500/30',
      bgClass: 'bg-rose-500/5',
      iconClass: 'text-rose-400',
      label: 'Important',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    caution: {
      borderClass: 'border-red-500/30',
      bgClass: 'bg-red-500/5',
      iconClass: 'text-red-400',
      label: 'Caution',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
        </svg>
      )
    }
  };

  const style = styles[type] || styles.note;

  return (
    <div className={`p-4 rounded-xl border ${style.borderClass} ${style.bgClass} flex gap-3.5 my-6`}>
      <span className={`${style.iconClass} shrink-0 mt-0.5`}>
        {style.icon}
      </span>
      <div className="space-y-1">
        <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${style.iconClass}`}>
          {style.label}
        </span>
        <div className="text-slate-300 text-xs font-semibold leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DocCallout;
