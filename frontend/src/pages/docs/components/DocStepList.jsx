import React from 'react';

const DocStepList = ({ steps = [] }) => {
  return (
    <div className="relative border-l border-white/10 ml-4 pl-8 space-y-10 my-8">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        return (
          <div key={idx} className="relative group">
            {/* Number Indicator */}
            <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-center font-extrabold text-amber-500 text-xs shadow-md group-hover:border-amber-500/50 transition-all">
              {stepNum}
            </div>
            
            {/* Step Body */}
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                {step.title}
              </h4>
              <div className="text-slate-300 text-xs leading-relaxed font-normal">
                {step.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocStepList;
