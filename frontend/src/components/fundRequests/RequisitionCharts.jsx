import React from 'react';

const RequisitionCharts = ({ requests, onReviewNowClick }) => {
  const pendingCount = requests.filter(r => r.request_status === 'Pending').length;
  
  // Sum up pending request amounts
  const pendingSum = requests
    .filter(r => r.request_status === 'Pending')
    .reduce((sum, r) => sum + Number(r.zo_fr_amount || 0), 0);

  const formatCurrency = (val) =>
    `₹ ${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 text-left">
      
      {/* 1. Urgent Approval Queue */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[180px]">
        <div className="absolute top-0 right-0 p-5 opacity-[0.03] pointer-events-none">
          <svg className="w-36 h-36 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 font-mono">Urgent Queue</span>
          <h3 className="text-base font-extrabold text-slate-200 mt-1">Approval Deadlines</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {pendingCount > 0 ? (
              <>There are <strong className="text-amber-500">{pendingCount} requests</strong> pending review. Total value awaiting approval is <strong className="text-slate-200">{formatCurrency(pendingSum)}</strong>.</>
            ) : (
              "All requisition items processed. Zero pending queues."
            )}
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-amber-500/80 bg-amber-950/20 border border-amber-900/30 px-2.5 py-0.5 rounded-lg">Critical Path</span>
          {pendingCount > 0 && (
            <button
              onClick={onReviewNowClick}
              className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-white hover:bg-slate-100 text-slate-950 transition-all shadow-md transform hover:-translate-y-0.5"
            >
              Review Now &rarr;
            </button>
          )}
        </div>
      </div>

      {/* 2. Financial Snapshot */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[180px]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Financial Snapshot</span>
          <h3 className="text-base font-extrabold text-slate-200 mt-1">Estimates Allocation</h3>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">Funds Released</span>
              <span className="text-emerald-400">₹ 4.7 Cr (55%)</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '55%' }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] pt-3 border-t border-white/5">
          <div>
            <span className="text-slate-500 block">Pending Release</span>
            <span className="font-mono font-bold text-slate-300">₹ 3.8 Cr</span>
          </div>
          <div>
            <span className="text-slate-500 block">Active Requests</span>
            <span className="font-mono font-bold text-amber-500">{formatCurrency(pendingSum)}</span>
          </div>
        </div>
      </div>

      {/* 3. Estimate Utilization Chart */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[180px]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Estimate Utilization</span>
          <h3 className="text-base font-extrabold text-slate-200 mt-1">Requisitions Burn Rate</h3>
          
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-black text-slate-200 mb-1">
              <span>78% Utilized</span>
              <span className="text-slate-400">Target Range</span>
            </div>
            <div className="flex w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: '70%' }} title="Approved Requisitions" />
              <div className="bg-amber-500 h-full" style={{ width: '8%' }} title="Pending Review" />
              <div className="bg-slate-800 h-full rounded-r-full" style={{ width: '22%' }} title="Available Margins" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-[8px] font-bold uppercase tracking-wider text-slate-500 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span>Available</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RequisitionCharts;
