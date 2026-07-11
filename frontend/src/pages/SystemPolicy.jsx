import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundShapes from '../components/BackgroundShapes';

const SystemPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background Silhouettes & Ambient Glows */}
      <BackgroundShapes />

      {/* Header Bar */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img src="/assets/logo.png" alt="SN Polymers Pvt LTD Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider text-slate-100 uppercase">
                SN Polymers Pvt LTD
              </span>
              <span className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">
                Privacy Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-slate-100 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12 relative z-10">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/15">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
                Privacy Policy
              </h1>
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-1">
                Last updated: July 11, 2026
              </p>
            </div>
            <div className="hidden sm:block">
              <svg className="w-12 h-12 text-amber-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-slate-300">
            <section>
              <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider mb-3">
                1. Overview & Authorized Access Only
              </h2>
              <p>
                This Portal is designed exclusively for authorized personnel, operators, and administrators of 
                <strong> SN Polymers Pvt LTD</strong>. Access is restricted strictly to users who have been whitelisted 
                by site administration. This Privacy Policy details the metrics and digital markers collected to guarantee 
                integrity, audit transparency, and portal security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider mb-3">
                2. Information We Collect
              </h2>
              <p className="mb-3">
                To facilitate secure entry and operation tracking, the system processes and records specific markers:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-100">Mobile Phone Numbers:</strong> Used exclusively for verification. 
                  Login requests require a pre-registered, whitelisted mobile number. One-Time Passcodes (OTPs) are delivered 
                  safely via Telegram API to your registered contact.
                </li>
                <li>
                  <strong className="text-slate-100">IP Addresses & Network Indicators:</strong> We automatically log incoming 
                  IP addresses for every request and session start. This is utilized to monitor geographic indicators, enforce 
                  rate-limiting rules, prevent unauthorized entry attempts, and safeguard infrastructure.
                </li>
                <li>
                  <strong className="text-slate-100">Audit Logs (Activity Trails):</strong> Actions taken inside the console 
                  (such as creating cost estimates, approving payment requisitions, tracking daily progress, and modifying 
                  master inventory records) are logged with a timestamp and the user ID. This is required for business auditability.
                </li>
                <li>
                  <strong className="text-slate-100">Browser Data & Local Storage:</strong> We use local browser storage and session cookies 
                  to maintain your login session active and persist your preferred user interface configuration (e.g., Light/Dark mode).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider mb-3">
                3. Purpose of Processing Data
              </h2>
              <p>
                We do not sell, share, or monetize any operator information. Data collected is used solely for:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Verifying whitelisted operator identity via two-factor OTP.</li>
                <li>Preserving operational audit trails for municipal compliance and internal accounting.</li>
                <li>Protecting application endpoints against brute force and DDoS vectors using rate limiters.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider mb-3">
                4. Data Protection & Audits
              </h2>
              <p>
                Your session activity and personal info are stored on secure Database clusters behind strict Row Level Security (RLS) policies. 
                IP logs and OTP verification audit tables are periodically pruned or archived based on internal security retention guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider mb-3">
                5. Contact & Management
              </h2>
              <p>
                For whitelist modifications, number updates, or access audits, please contact the SN Polymers Administrator Panel or file an internal IT request ticket.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} SN Polymers Pvt LTD. Internal System Documentation.
            </span>
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemPolicy;
