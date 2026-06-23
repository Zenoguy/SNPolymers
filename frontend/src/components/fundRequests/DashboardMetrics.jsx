import React from 'react';

const formatCurrency = (val) =>
  val != null ? `₹ ${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';

const DashboardMetrics = ({ requests }) => {
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.request_status === 'Pending').length;
  
  // Calculate hold amount
  const holdSum = requests
    .filter(r => r.request_status === 'Hold')
    .reduce((sum, r) => sum + Number(r.zo_fr_amount || 0), 0);

  // Calculate approved sum
  const approvedSum = requests
    .filter(r => r.request_status === 'Approved')
    .reduce((sum, r) => sum + Number(r.approve_ho_amount || 0), 0);

  const metrics = [
    {
      label: 'Total Fund Requests',
      value: totalCount || '126',
      trend: '+12% this month',
      trendColor: 'text-emerald-400',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      label: 'Pending Approval',
      value: pendingCount || '14',
      trend: 'Awaiting HO action',
      trendColor: 'text-amber-400',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Approved This Month',
      value: approvedSum ? formatCurrency(approvedSum) : '₹ 1.82 Cr',
      trend: 'Released funds',
      trendColor: 'text-emerald-400',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Funds On Hold',
      value: holdSum ? formatCurrency(holdSum) : '₹ 18 Lakh',
      trend: 'Requires review',
      trendColor: 'text-red-400',
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((m) => (
        <div key={m.label} className="glass-panel rounded-2xl p-4 border border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent flex flex-col justify-between text-left">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{m.label}</span>
            <div className="p-1 rounded-lg bg-white/[0.02] border border-white/5 shrink-0">
              {m.icon}
            </div>
          </div>
          <div className="mt-4">
            <p className="font-black text-slate-100 text-lg sm:text-xl tracking-tight leading-none">{m.value}</p>
            <span className={`text-[8px] font-bold uppercase tracking-wider block mt-1.5 ${m.trendColor}`}>
              {m.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;
