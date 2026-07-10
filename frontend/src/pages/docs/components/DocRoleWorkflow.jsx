import React from 'react';

const DocRoleWorkflow = ({ role = 'je', steps = [] }) => {
  const roleColors = {
    je: {
      border: 'hover:border-emerald-500/50',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]'
    },
    zo: {
      border: 'hover:border-blue-500/50',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]'
    },
    ho: {
      border: 'hover:border-purple-500/50',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]'
    },
    admin: {
      border: 'hover:border-amber-500/50',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]'
    }
  };

  const style = roleColors[role.toLowerCase()] || roleColors.je;

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-4 justify-between my-8 relative">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <React.Fragment key={idx}>
            {/* Step Card */}
            <div className={`flex-1 min-w-[150px] p-4 rounded-xl border border-white/5 bg-slate-950/40 backdrop-blur-sm flex flex-col justify-between transition-all duration-300 group ${style.border} ${style.glow}`}>
              <div className="space-y-3">
                {/* Step Number Badge */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${style.badge}`}>
                  Step {idx + 1}
                </span>
                
                {/* Step Text */}
                <p className="text-slate-200 text-xs font-bold leading-relaxed">
                  {step}
                </p>
              </div>
            </div>
            
            {/* Connector Arrow */}
            {!isLast && (
              <div className="flex items-center justify-center py-2 md:py-0 text-slate-600 shrink-0">
                {/* Down arrow on mobile, right arrow on desktop */}
                <svg className="w-5 h-5 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                </svg>
                <svg className="w-5 h-5 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DocRoleWorkflow;
