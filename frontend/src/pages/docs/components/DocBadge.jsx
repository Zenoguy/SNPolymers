import React from 'react';

const DocBadge = ({ role }) => {
  const configs = {
    je: {
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      label: 'JE (Junior Engineer)'
    },
    zo: {
      bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      label: 'ZO (Zonal Office)'
    },
    ho: {
      bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      label: 'HO (Head Office)'
    },
    admin: {
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      label: 'Admin'
    },
    staff: {
      bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20 line-through',
      label: 'Staff (Deprecated)'
    }
  };

  const config = configs[role.toLowerCase()] || {
    bgClass: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    label: role
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${config.bgClass}`}>
      {config.label}
    </span>
  );
};

export default DocBadge;
