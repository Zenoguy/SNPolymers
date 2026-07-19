import React from 'react';
import Sidebar, { MobileHeader } from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import BackgroundShapes from '../components/BackgroundShapes';

const HoDashboard = () => {
  return (
    <div className="h-screen bg-black text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      <BackgroundShapes />
      <Sidebar />
      <MobileHeader />

      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        <TopNavbar />
        <main className="flex-grow p-6 md:p-10 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full relative z-10">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-100">Executive Analytics (HO)</h1>
            <p className="text-sm text-slate-400 mt-1">Real-time portfolio metrics, zone benchmarking, and anomaly detections.</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl text-slate-400">
            Analytics view under development...
          </div>
        </main>
      </div>
    </div>
  );
};

export default HoDashboard;
