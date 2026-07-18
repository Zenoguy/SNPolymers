import React from 'react';
import { useAuth } from '../components/AuthContext';
import BackgroundShapes from '../components/BackgroundShapes';
import Sidebar, { MobileHeader } from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import HoDashboardView from './dashboard/HoDashboardView';
import ZoDashboardView from './dashboard/ZoDashboardView';
import JeDashboardView from './dashboard/JeDashboardView';
import StaffDashboardView from './dashboard/StaffDashboardView';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen bg-black text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Background Silhouettes & Ambient Glows */}
      <BackgroundShapes />

      <Sidebar />
      <MobileHeader />

      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        <TopNavbar />
        {/* Main Administrative Control Grid */}
        <main className="flex-grow p-6 md:p-10 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full relative z-10">
          
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Authorized Operator Session</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mt-1">Welcome back, {user?.display_name || user?.mobile_number}!</h1>
              <p className="text-xs text-slate-400 font-medium mt-1.5">Select a sub-module from the navigation rails or view key details below.</p>
            </div>
          </div>

          {/* Dynamic Dashboard Sub-Views */}
          {['ho', 'admin'].includes(user?.role) ? (
            <HoDashboardView />
          ) : user?.role === 'zo' ? (
            <ZoDashboardView />
          ) : user?.role === 'je' ? (
            <JeDashboardView />
          ) : (
            <StaffDashboardView />
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
