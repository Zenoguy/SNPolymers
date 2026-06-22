import React from 'react';

const QuickFiltersSidebar = ({ filters, onFilterChange, activities }) => {
  const handleCheckboxChange = (key) => {
    onFilterChange(key, !filters[key]);
  };

  const checklistItems = [
    { key: 'myRequests', label: 'My Requests' },
    { key: 'pendingOnly', label: 'Pending Only' },
    { key: 'approvedThisMonth', label: 'Approved This Month' },
    { key: 'onHoldRequests', label: 'On Hold Requests' },
    { key: 'largeAmount', label: 'Large Amount Requests (> ₹5L)' }
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Quick Filters Panel */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-4">Quick Filters</span>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer select-none text-xs text-slate-300 font-medium hover:text-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={!!filters[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
                className="w-4 h-4 rounded bg-slate-900 border-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Top Requesting Zones (Podium Visual) */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-4">Top Requesting Zones</span>
        <div className="flex items-end justify-center gap-2 pt-6 pb-2">
          {/* Podium 2: West Zone */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-extrabold text-slate-400">West</span>
            <span className="text-[10px] font-mono font-bold text-slate-300 mt-1">₹52L</span>
            <div className="w-12 bg-white/5 border border-white/10 rounded-t-lg mt-2 flex items-center justify-center font-black text-slate-400 text-xs shadow-md" style={{ height: '50px' }}>
              2
            </div>
          </div>
          {/* Podium 1: East Zone */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-extrabold text-amber-400">East</span>
            <span className="text-[10px] font-mono font-bold text-slate-200 mt-1">₹66L</span>
            <div className="w-12 bg-amber-500/10 border border-amber-500/20 rounded-t-lg mt-2 flex items-center justify-center font-black text-amber-400 text-sm shadow-[0_4px_20px_rgba(245,158,11,0.1)]" style={{ height: '75px' }}>
              1
            </div>
          </div>
          {/* Podium 3: North Zone */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-extrabold text-slate-500">North</span>
            <span className="text-[10px] font-mono font-bold text-slate-400 mt-1">₹35L</span>
            <div className="w-12 bg-white/5 border border-white/5 rounded-t-lg mt-2 flex items-center justify-center font-black text-slate-500 text-xs" style={{ height: '35px' }}>
              3
            </div>
          </div>
        </div>
      </div>

      {/* 3. Management Insights */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-4">Management Insights</span>
        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <span className="text-slate-400 font-semibold">Highest Request Amount</span>
            <span className="font-mono font-bold text-slate-200">₹18 Lakh</span>
          </div>
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <span className="text-slate-400 font-semibold">Most Active Zone</span>
            <span className="font-bold text-slate-200">West Zone</span>
          </div>
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <span className="text-slate-400 font-semibold">Approval Bottleneck</span>
            <span className="text-amber-500 font-semibold">2 Requests &gt; 7 Days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Monthly Approval Rate</span>
            <span className="text-emerald-400 font-bold">92%</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity Feed */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-4">Recent Activity Feed</span>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((act, idx) => (
              <div key={idx} className="flex gap-3 text-xs leading-relaxed items-start">
                <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                  act.status === 'Approved' ? 'bg-emerald-500' :
                  act.status === 'Hold' ? 'bg-red-500' :
                  act.status === 'Cancelled' ? 'bg-slate-500' : 'bg-amber-500'
                }`} />
                <div className="flex flex-col">
                  <span className="text-slate-300 font-bold">{act.no} {act.status}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{act.time}</span>
                </div>
              </div>
            ))
          ) : (
            <span className="text-slate-500 text-xs">No recent activities logged.</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default QuickFiltersSidebar;
