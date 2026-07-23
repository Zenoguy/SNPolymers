import React from 'react';
import DocCallout from './components/DocCallout';
import DocBadge from './components/DocBadge';
import DocTable from './components/DocTable';
import DocStepList from './components/DocStepList';
import DocRoleWorkflow from './components/DocRoleWorkflow';

export const docSections = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    pages: [
      {
        id: 'what-is-idbp',
        title: 'What is IDBP?',
        headings: [
          { id: 'overview', text: 'Overview', level: 2 },
          { id: 'core-functions', text: 'Core Functional Modules', level: 2 },
          { id: 'analytics-twins', text: 'Analytics & Digital Twin Hub', level: 2 },
          { id: 'access-control', text: 'Access & Role Model', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p id="overview" className="text-slate-300 text-sm leading-relaxed">
              Welcome to the <strong>Integrated Digital Business Platform (IDBP)</strong> for <strong>S.N. Polymers Pvt. Ltd.</strong>
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              The IDBP is an enterprise resource planning and telemetry hub designed to streamline civil engineering projects, raw material catalogs, municipal infrastructure billing, regional zonal balances, and executive financial controls.
            </p>

            <h2 id="core-functions" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Core Functional Modules</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li><strong>Cost Estimations</strong>: Collaborative drafting, multi-tier review, and approval of civil engineering budgets against contract limits.</li>
              <li><strong>Procurement & Requisitions</strong>: Tracking vendor payment requisitions, invoice document uploads, and budget limit checks.</li>
              <li><strong>Site Telemetry & DPR</strong>: Daily physical progress tracking, geotagged photologging, and site inspection checklists.</li>
              <li><strong>Financial Controls & Billing</strong>: Sequential contractor running account (RA) bills, Zonal Office fund requests, and excess fund return workflows.</li>
            </ul>

            <h2 id="analytics-twins" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Analytics & Digital Twin Hub</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The platform features advanced executive dashboards, real-time work order health scoring, gamified field engineer leaderboards, and interactive 3D Project Digital Twins that compare physical progress against financial disbursements.
            </p>

            <h2 id="access-control" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Access & Role Model</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The platform operates on strict Role-Based Access Control (RBAC). Your assigned role (<code className="text-amber-400">je</code>, <code className="text-amber-400">zo</code>, <code className="text-amber-400">ho</code>, or <code className="text-amber-400">admin</code>) and work order assignments govern available navigation menus, telemetry views, and write clearances.
            </p>
          </div>
        )
      },
      {
        id: 'account-setup',
        title: 'Setting Up Your Account',
        headings: [
          { id: 'whitelist-process', text: 'Step 1: Whitelist Authorization', level: 2 },
          { id: 'login-portal', text: 'Step 2: Accessing the Login Portal', level: 2 },
          { id: 'telegram-bot', text: 'Step 3: Setting Up the Telegram Bot', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              S.N. Polymers Pvt. Ltd. enforces a strict, closed whitelist security configuration. Accounts cannot be registered directly from the frontend; your credential set must be authorized in advance.
            </p>

            <DocStepList
              steps={[
                {
                  title: 'Whitelist Authorization',
                  content: (
                    <div id="whitelist-process" className="space-y-2">
                      <p>Contact your System Administrator to whitelist your phone number. You must supply:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1 text-[11px] text-slate-400">
                        <li>Your complete display name.</li>
                        <li>Your active 10-digit mobile number.</li>
                        <li>Your assigned organizational role (<code className="text-amber-400">je</code>, <code className="text-amber-400">zo</code>, <code className="text-amber-400">ho</code>, or <code className="text-amber-400">admin</code>).</li>
                      </ul>
                    </div>
                  )
                },
                {
                  title: 'Accessing the Login Portal',
                  content: (
                    <div id="login-portal" className="space-y-2">
                      <p>Open your desktop or mobile browser and navigate to the portal login link:</p>
                      <a href="https://sn-polymers.vercel.app/" target="_blank" rel="noreferrer" className="text-amber-500 underline font-bold">https://sn-polymers.vercel.app/</a>
                      <p className="mt-1">Enter your 10-digit mobile number in the login field. The system automatically handles country formatting (<code className="text-slate-200">+91</code>) and strips out invalid characters.</p>
                    </div>
                  )
                },
                {
                  title: 'Setting Up the Telegram Bot',
                  content: (
                    <div id="telegram-bot" className="space-y-2">
                      <p>If you log in for the first time, the platform will redirect you to the <strong>Telegram Link Setup</strong> screen.</p>
                      <DocCallout type="warning">
                        Do not skip this process. One-Time Passcodes (OTPs) are delivered solely via our secure Telegram gateway to prevent SMS delays.
                      </DocCallout>
                      <ol className="list-decimal pl-5 space-y-1.5 mt-2 text-[11px] text-slate-400">
                        <li>Click the link to launch Telegram and start a chat with the official bot: <a href="https://t.me/snpolymers_bot" target="_blank" rel="noreferrer" className="text-amber-500 underline font-bold">@snpolymers_bot</a>.</li>
                        <li>Click the <strong>Start</strong> button in Telegram.</li>
                        <li>Click <strong>Share Contact</strong> when prompted. This securely binds your Telegram ID with your whitelisted phone number.</li>
                        <li>Return to the browser login page to complete authentication.</li>
                      </ol>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )
      },
      {
        id: 'first-login',
        title: 'Your First Login',
        headings: [
          { id: 'otp-generation', text: 'Requesting OTP', level: 2 },
          { id: 'otp-verification', text: 'Verification Code', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Once setup is complete, you can log in securely in under a minute without memorizing passwords.
            </p>

            <DocStepList
              steps={[
                {
                  title: 'Requesting OTP',
                  content: (
                    <div id="otp-generation" className="space-y-1">
                      <p>Enter your whitelisted mobile number on the login page and click <strong>Verify Whitelist & Send OTP</strong>.</p>
                      <p>The server validates your whitelisted record and dispatches an OTP request via Telegram.</p>
                    </div>
                  )
                },
                {
                  title: 'Retrieving Code',
                  content: (
                    <div className="space-y-1">
                      <p>Open your Telegram application and open the chat thread for <strong>S.N. Polymers Bot</strong>.</p>
                      <p>A message containing a 6-digit login passcode will arrive immediately (valid for 5 minutes).</p>
                    </div>
                  )
                },
                {
                  title: 'Verification',
                  content: (
                    <div id="otp-verification" className="space-y-2">
                      <p>Type the 6-digit code in the numeric input fields and click <strong>Verify Code</strong>.</p>
                      <p>If the timer expires before you submit, click <strong>Resend Code</strong> to request a fresh OTP.</p>
                      <DocCallout type="note">
                        Upon successful verification, your token is stored securely and you are redirected to the Console Dashboard.
                      </DocCallout>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )
      },
      {
        id: 'navigation-tour',
        title: 'Platform Navigation Tour',
        headings: [
          { id: 'desktop-sidebar', text: 'Desktop Sidebar & Top Navigation', level: 2 },
          { id: 'mobile-navigation', text: 'Mobile Responsive Navigation', level: 2 },
          { id: 'theme-toggle', text: 'Dark / Light High-Contrast Theme Toggle', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The IDBP web application is optimized for desktop workstations, site tablets, and smartphones under sunlight conditions.
            </p>

            <h2 id="desktop-sidebar" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Desktop Sidebar & Top Navigation</h2>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-300 mt-3 text-xs">
              <li><strong>Sidebar Toggle</strong>: Click the collapse arrow at the top of the sidebar to collapse into icon mode, expanding grid layout width for large spreadsheets.</li>
              <li><strong>Top Navbar Shortcuts</strong>: Gives instant access to <strong>Dashboard</strong>, <strong>Analytics Hub</strong>, <strong>Digital Twin</strong>, and <strong>Documentation</strong>.</li>
              <li><strong>Role-Filtered Menus</strong>: Navigation items dynamically adjust based on your permissions.</li>
            </ul>

            <h2 id="mobile-navigation" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Mobile Responsive Navigation</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              On mobile devices, tap the hamburger menu icon in the top header bar to reveal the full navigation drawer. All forms and data tables are optimized for touch interaction.
            </p>

            <h2 id="theme-toggle" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Dark / Light High-Contrast Theme Toggle</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Toggle between <strong>Dark Mode</strong> (sleek dark palette for office monitoring) and <strong>Light Mode</strong> (high-contrast mode designed for outdoor field inspection in bright sunlight).
            </p>
          </div>
        )
      },
      {
        id: 'role-checklists',
        title: 'First Steps by Role',
        headings: [
          { id: 'je-checklist', text: 'Junior Engineer Checklist', level: 2 },
          { id: 'zo-checklist', text: 'Zonal Office Checklist', level: 2 },
          { id: 'ho-checklist', text: 'Head Office Checklist', level: 2 },
          { id: 'admin-checklist', text: 'Administrator Checklist', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Complete these quick validation checklists tailored to your functional role upon your first login:
            </p>

            <h2 id="je-checklist" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Junior Engineer (JE) Checklist</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>Go to <strong>Material Master</strong> and search catalog rates for items (e.g., Cement, HDPE Pipes).</li>
              <li>Open <strong>Cost Estimates</strong> and click <strong>New Sheet</strong> to select your assigned work order.</li>
              <li>Go to <strong>Daily Progress</strong> to verify site photologging and physical progress entry.</li>
              <li>Check your score on the <strong>JE Field Leaderboard</strong> under Analytics.</li>
            </ul>

            <h2 id="zo-checklist" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Zonal Office (ZO) Checklist</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>Open <strong>ZO Analytics Dashboard</strong> (<code className="text-slate-200">/analytics/zo</code>) to review regional cash runway and project telemetry.</li>
              <li>Check <strong>Cost Estimates</strong> for sheets flagged as <strong>Under ZO Review</strong>.</li>
              <li>Go to <strong>Zonal Balances & Returns</strong> to check CC/OD/CR account allocations.</li>
              <li>Manage <strong>RA & Final Bills</strong> to record sequential client billings.</li>
            </ul>

            <h2 id="ho-checklist" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Head Office (HO) Checklist</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>Open <strong>HO Command Center</strong> (<code className="text-slate-200">/analytics/ho</code>) to view the 10-KPI strip and telemetry table.</li>
              <li>Review pending <strong>Fund Requests</strong> and assign funding sources (CC, OD, CR).</li>
              <li>Inspect <strong>Audit & Compliance Center</strong> for system risk flags and audit trails.</li>
            </ul>

            <h2 id="admin-checklist" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Administrator Checklist</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>Access <strong>Access Whitelist</strong> to view and register user phone records.</li>
              <li>Configure <strong>User & Work Order Mappings</strong> to assign JEs to Zonal Office clusters.</li>
              <li>Audit system logs under <strong>Audit Trail Logs</strong> and <strong>Master Data</strong>.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'glossary',
        title: 'Glossary of Core Concepts',
        headings: [
          { id: 'terminology', text: 'Enterprise Terminology', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Operational reference dictionary for key ERP, financial, and digital twin terms:
            </p>

            <h2 id="terminology" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-4">Enterprise Terminology</h2>
            <DocTable>
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-200 font-extrabold">
                  <th className="p-3">Term</th>
                  <th className="p-3">Definition & System Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Work Order (WO)</td>
                  <td className="p-3">A contract allocated to the enterprise. Contains client details, pricing caps, and regional department bounds.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">3D Digital Twin</td>
                  <td className="p-3">Virtual 3D CAD/GIS rendering of a construction site that overlays physical progress timelines, photologs, and financial completion.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Health Score</td>
                  <td className="p-3">Real-time composite telemetry metric (0–100) computed from DPR frequency, budget overrun percentage, and milestone progress.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Running Account (RA) Bill</td>
                  <td className="p-3">Sequential invoice structures compiled against complete stages of work. Immutable once saved in DB.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Excess Fund Return</td>
                  <td className="p-3">Formal ledger transaction returning unspent cash allocations from Zonal Offices back to Head Office accounts.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">JE Field Leaderboard</td>
                  <td className="p-3">Gamified ranking system scoring Junior Engineers based on DPR reporting timeliness, photolog completeness, and accuracy.</td>
                </tr>
              </tbody>
            </DocTable>
          </div>
        )
      }
    ]
  },
  {
    id: 'module-reference',
    label: 'Module Reference',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    pages: [
      {
        id: 'dashboard',
        title: 'Console Dashboard',
        headings: [
          { id: 'dashboard-overview', text: 'Main Page Interface', level: 2 },
          { id: 'dashboard-role-adaptation', text: 'Dynamic Role Adaptation', level: 2 },
          { id: 'dashboard-components', text: 'Live Audit Log & Counter Widgets', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p id="dashboard-overview" className="text-slate-300 text-sm leading-relaxed">
              The <strong>Console Dashboard</strong> serves as the default landing portal after login, providing quick access to active work order stats and recent operations.
            </p>

            <h2 id="dashboard-role-adaptation" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Dynamic Role Adaptation</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Widgets dynamically change according to the user's role. Junior Engineers see quick links to estimate creation and daily progress logs; ZOs and HOs see financial summary counters, pending approval queues, and zonal telemetry.
            </p>

            <h2 id="dashboard-components" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Live Audit Log & Counter Widgets</h2>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-300 mt-3 text-xs">
              <li><strong>Project Counters</strong>: Live breakdown of Total Work Orders, Running Projects, and Completed Contracts.</li>
              <li><strong>Live Audit Stream</strong>: Displays real-time database activities (CREATE, UPDATE, STATUS_CHANGE) with 30-second background polling.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'ho-analytics',
        title: 'HO Executive Command Center',
        headings: [
          { id: 'kpi-strip', text: '10-KPI Executive Financial Strip', level: 2 },
          { id: 'financial-charts', text: 'Interactive Financial & Runway Charts', level: 2 },
          { id: 'telemetry-table', text: 'Work Order Telemetry & Health Score', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>HO Executive Command Center</strong> (<code className="text-slate-200">/analytics/ho</code>) delivers enterprise-wide executive oversight over monetary flows, project health, and zonal liquidity.
            </p>

            <h2 id="kpi-strip" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">10-KPI Executive Financial Strip</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The top strip features 10 real-time financial indicators:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
              <li><strong>Total Work Orders</strong> & <strong>Total WO Value</strong></li>
              <li><strong>Total Estimate Amount</strong> & <strong>Total Requisitions</strong></li>
              <li><strong>Total Approved Funds</strong> & <strong>ZO Available Balance</strong></li>
              <li><strong>Total Excess Refunds</strong> & <strong>Gross Bill Amount</strong></li>
              <li><strong>Agency Net Payments</strong> & <strong>Due Bill Exposure</strong></li>
            </ul>

            <h2 id="financial-charts" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Interactive Financial & Runway Charts</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Executive visualization suite includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
              <li><strong>Fund Flow Bubble & Sankey</strong>: Visualizing cash movement from HO ledgers to Zonal accounts.</li>
              <li><strong>Zonal Performance Comparison</strong>: Benchmarking budget consumption across Zonal Offices.</li>
              <li><strong>Cash Runway Gauges</strong>: Predicting zonal fund exhaustion dates based on burn rate.</li>
              <li><strong>Physical Progress S-Curves</strong>: Planned vs. actual site progress trajectories.</li>
            </ul>

            <h2 id="telemetry-table" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Work Order Telemetry & Health Score</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              High-density project tracking table featuring real-time <strong>Health Scores</strong> (0–100), filters for department/zone, and one-click <strong>Excel Export</strong>. Clicking any work order opens its 3D Digital Twin.
            </p>
          </div>
        )
      },
      {
        id: 'zo-analytics',
        title: 'ZO Zonal Operations Dashboard',
        headings: [
          { id: 'zo-overview', text: 'Zonal Telemetry & Metrics', level: 2 },
          { id: 'zo-runway', text: 'Regional Runway & Fund Allocation', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>ZO Analytics Dashboard</strong> (<code className="text-slate-200">/analytics/zo</code>) empowers Zonal Managers to monitor regional projects, track available cash credit, and oversee site progress.
            </p>

            <h2 id="zo-overview" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Zonal Telemetry & Metrics</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Provides Zonal Officers with real-time counters of active work orders, total estimated budget, approved fund requisitions, and pending contractor bills within their specific zone.
            </p>

            <h2 id="zo-runway" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Regional Runway & Fund Allocation</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Features visual gauges for CC, OD, and CR accounts, highlighting low-runway warnings to prevent site material delays.
            </p>
          </div>
        )
      },
      {
        id: 'digital-twin',
        title: '3D Project Digital Twin & Hub',
        headings: [
          { id: 'twin-hub', text: 'Digital Twin Directory Hub', level: 2 },
          { id: 'twin-viewer', text: 'Interactive 3D Site Twin & Photologs', level: 2 },
          { id: 'twin-telemetry', text: 'Physical vs. Financial Progress Comparison', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Project Digital Twin</strong> module (<code className="text-slate-200">/analytics/digital-twin</code> & <code className="text-slate-200">/projects/:wo/digital-twin</code>) creates a virtual 3D replica of civil engineering sites linked to live field data.
            </p>

            <h2 id="twin-hub" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Digital Twin Directory Hub</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Central catalog listing active work orders with 3D model status badges, health score indicators, and instant navigation to site digital twins.
            </p>

            <h2 id="twin-viewer" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Interactive 3D Site Twin & Photologs</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Features interactive 3D site visualization:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
              <li><strong>Milestone Scrubber</strong>: Scrub backward and forward in time to watch 3D site construction stages evolve.</li>
              <li><strong>Hotspot Markers</strong>: Click site camera hotspots to inspect geotagged high-resolution photologs uploaded by field engineers.</li>
              <li><strong>Progress Heatmap</strong>: Color-coded structural elements indicating physical completion percentages.</li>
            </ul>

            <h2 id="twin-telemetry" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Physical vs. Financial Progress Comparison</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Side-by-side gauge comparing <strong>Physical Progress (%)</strong> against <strong>Financial Disbursement (%)</strong>, immediately flagging budget overruns or lagging physical work.
            </p>
          </div>
        )
      },
      {
        id: 'je-leaderboard',
        title: 'JE Field Leaderboard',
        headings: [
          { id: 'leaderboard-scoring', text: 'Gamified Performance Scoring', level: 2 },
          { id: 'leaderboard-metrics', text: 'Key Ranking Indicators', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>JE Field Leaderboard</strong> (<code className="text-slate-200">/analytics/leaderboard</code>) incentivizes timely and accurate daily field progress reporting across Junior Engineers.
            </p>

            <h2 id="leaderboard-scoring" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Gamified Performance Scoring</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Engineers earn performance points and rank badges based on consistency, site visit logging frequency, and high-quality photologs.
            </p>

            <h2 id="leaderboard-metrics" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Key Ranking Indicators</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
              <li><strong>DPR Logging Streak</strong>: Consecutive days of submitted daily progress reports.</li>
              <li><strong>Photolog Completeness</strong>: Percentage of entries containing verified site inspection photos.</li>
              <li><strong>Audit Compliance Rate</strong>: Submissions passed without revision requests.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'material-master',
        title: 'Material Master Catalog',
        headings: [
          { id: 'catalog-search', text: 'Search and Debounce Controls', level: 2 },
          { id: 'catalog-active-status', text: 'Active/Inactive Status Logic', level: 2 },
          { id: 'catalog-export', text: 'Excel Catalog Exporting', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Material Master Catalog</strong> is the central catalog of civil engineering materials, equipment rentals, and labor heads.
            </p>

            <h2 id="catalog-search" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Search and Debounce Controls</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Includes a <strong>400ms client-side debounce</strong> filter to ensure smooth catalog search across thousands of material items without server lag.
            </p>

            <h2 id="catalog-active-status" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Active/Inactive Status Logic</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Items can be toggled between Active and Inactive. Inactive items are hidden from new estimate compilation.
            </p>

            <h2 id="catalog-export" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Excel Catalog Exporting</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              One-click <strong>Export to Excel</strong> button downloads current material prices, categories, and unit specifications into formatted spreadsheet files.
            </p>
          </div>
        )
      },
      {
        id: 'cost-estimates',
        title: 'Cost Estimating',
        headings: [
          { id: 'estimate-workflow', text: 'Estimate Approval Lifecycle', level: 2 },
          { id: 'estimate-compilation', text: 'Priced Sheet Grid Controls', level: 2 },
          { id: 'estimate-drafts', text: 'Intermittent Saving & Drafts', level: 2 },
          { id: 'estimate-auto-resubmit', text: 'Revision Timers & Auto-Resubmission', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Cost Estimates</strong> module manages project budgets through a multi-tier review workflow.
            </p>

            <h2 id="estimate-workflow" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Estimate Approval Lifecycle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
              <div className="bg-white/5 p-3 rounded border border-white/5">
                <span className="font-bold text-amber-400 block mb-1">ZO Review Stage</span>
                <DocStepList
                  steps={[
                    { title: 'Draft', content: 'Compiled by assigned JE.' },
                    { title: 'Submitted', content: 'Sent by JE, sheet locked.' },
                    { title: 'Under ZO Review', content: 'ZO Manager audits items.' },
                    { title: 'ZO Approved', content: 'Passed to HO for final approval.' }
                  ]}
                />
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/5">
                <span className="font-bold text-amber-400 block mb-1">HO Review Stage</span>
                <DocStepList
                  steps={[
                    { title: 'Under HO Review', content: 'HO Director audits estimate.' },
                    { title: 'Final Approved', content: 'Budget locked for procurement & billing.' },
                    { title: 'HO Revision', content: 'Returned to JE with comments.' }
                  ]}
                />
              </div>
            </div>

            <h2 id="estimate-compilation" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Priced Sheet Grid Controls</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Interactive calculation grid with real-time totals (<code className="text-slate-200">Qty × Rate</code>), duplicate item checks, and transactional rollback on save errors.
            </p>

            <h2 id="estimate-auto-resubmit" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Revision Timers & Auto-Resubmission</h2>
            <DocCallout type="important">
              When a revision is requested, a 24-hour deadline timer starts. If unaddressed, the backend triggers an automatic resubmission for re-audit.
            </DocCallout>
          </div>
        )
      },
      {
        id: 'payment-requisitions',
        title: 'Payment Requisitions',
        headings: [
          { id: 'requisition-workflow', text: 'Invoice Upload & Filing', level: 2 },
          { id: 'requisition-limits', text: 'Budget Limit Verification', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Payment Requisitions</strong> module records vendor invoice claims and sub-contractor bill payments.
            </p>

            <h2 id="requisition-workflow" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Invoice Upload & Filing</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Engineers select a work order, input supplier details, GST breakdowns, and upload scanned invoice files (<code className="text-slate-200">.pdf</code>, <code className="text-slate-200">.jpg</code>, <code className="text-slate-200">.png</code>). Uploaded files are obfuscated with UUIDs for security.
            </p>

            <h2 id="requisition-limits" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Budget Limit Verification</h2>
            <DocCallout type="warning">
              Requisition totals are checked against the remaining approved estimate balance. Requisitions exceeding available budget caps are blocked.
            </DocCallout>
          </div>
        )
      },
      {
        id: 'daily-progress',
        title: 'Daily Work Progress (DPR)',
        headings: [
          { id: 'progress-logging', text: 'Site Visit Logging & Photologs', level: 2 },
          { id: 'progress-backdate', text: 'Back-Date Approval Gate', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Daily Work Progress</strong> module collects daily site inspection logs, physical progress percentages, and geotagged site photologs.
            </p>

            <h2 id="progress-logging" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Site Visit Logging & Photologs</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Junior Engineers input work descriptions, physical progress percentages, and attach site inspection photos. Images are stored securely with temporary signed URLs.
            </p>

            <h2 id="progress-backdate" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Back-Date Approval Gate</h2>
            <DocCallout type="important">
              Logging progress for past dates requires mandatory justification remarks and undergoes Zonal Manager review before entering public timelines.
            </DocCallout>
          </div>
        )
      },
      {
        id: 'fund-requests',
        title: 'Fund Requests',
        headings: [
          { id: 'fund-metrics', text: 'Zonal Credit Accounts (CC, OD, CR)', level: 2 },
          { id: 'fund-workflow', text: 'Approval & Debit Source Assignment', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Fund Requests</strong> module manages cash requests filed by Zonal Managers to settle site vendor bills.
            </p>

            <h2 id="fund-metrics" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Zonal Credit Accounts (CC, OD, CR)</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
              <li><strong>Credit Control (CC)</strong>: Primary cash account.</li>
              <li><strong>Overdraft (OD)</strong>: Short-term credit facility.</li>
              <li><strong>Cash Credit (CR)</strong>: Secondary working capital account.</li>
            </ul>

            <h2 id="fund-workflow" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Approval & Debit Source Assignment</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              HO Directors audit pending requests, select the active source account (CC/OD/CR), and release funds, immediately updating zonal ledger balances.
            </p>
          </div>
        )
      },
      {
        id: 'ra-final-bills',
        title: 'RA & Final Bills',
        headings: [
          { id: 'bill-calculations', text: 'Bill Calculation & Breakdown Sum Check', level: 2 },
          { id: 'bill-sequence', text: 'Sequential Billing Validation', level: 2 },
          { id: 'bill-immutability', text: 'Database Immutability Safeguard', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Running Account (RA) & Final Bills</strong> ledger records formal invoices submitted to clients for civil works executed.
            </p>

            <h2 id="bill-calculations" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Bill Calculation & Breakdown Sum Check</h2>
            <div className="bg-white/5 p-3 rounded font-mono text-[11px] text-amber-400 border border-white/5 mt-2">
              Gross Bill = Agency Payment + Security Deposit + EMD + Retentions + IT TDS + SGST + CGST
            </div>
            <p className="text-slate-300 text-xs mt-2">
              The system enforces exact breakdown totals. If the gross bill differs from the breakdown sum, submission is rejected.
            </p>

            <h2 id="bill-sequence" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Sequential Billing Validation</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              RA Bills must be filed sequentially (<code className="text-slate-200">RA Bill N</code> requires <code className="text-slate-200">RA Bill N-1</code>).
            </p>

            <h2 id="bill-immutability" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Database Immutability Safeguard</h2>
            <DocCallout type="caution">
              Once written, saved RA Bill records cannot be edited or deleted by any user role (including System Admins).
            </DocCallout>
          </div>
        )
      },
      {
        id: 'zonal-balances-returns',
        title: 'Zonal Balances & Excess Fund Returns',
        headings: [
          { id: 'zonal-ledgers', text: 'Zonal Credit Ledger Balances', level: 2 },
          { id: 'excess-returns', text: 'Excess Fund Return Transactions', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Zonal Balances</strong> and <strong>Excess Fund Returns</strong> modules (<code className="text-slate-200">/zonal-balances</code> & <code className="text-slate-200">/excess-fund-returns</code>) manage regional cash ledgers and return unspent capital.
            </p>

            <h2 id="zonal-ledgers" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Zonal Credit Ledger Balances</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Presents real-time balances for each Zonal Office across available cash, reserved liabilities, and total disbursements.
            </p>

            <h2 id="excess-returns" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Excess Fund Return Transactions</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Allows Zonal Officers to initiate formal <code className="text-slate-200">RETURN</code> transactions, transferring unspent project funds back to Head Office accounts and logging audit entries.
            </p>
          </div>
        )
      },
      {
        id: 'fund-reports',
        title: 'Project Fund Reports',
        headings: [
          { id: 'report-overview', text: 'Financial Disbursements Tracking', level: 2 },
          { id: 'report-constraints', text: 'Immutability & Soft Delete Controls', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Project Fund Reports</strong> module (<code className="text-slate-200">/fund-reports</code>) registers corporate payment disbursements mapped to active work orders.
            </p>

            <h2 id="report-overview" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Financial Disbursements Tracking</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Users submit disbursement logs with NEFT/RTGS transaction remarks, auto-populating project department and location metadata.
            </p>

            <h2 id="report-constraints" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Immutability & Soft Delete Controls</h2>
            <DocCallout type="note">
              Administrators can soft-delete erroneous disbursement entries and restore them from the <strong>Deleted Reports</strong> tab. Closed projects automatically lock linked fund reports.
            </DocCallout>
          </div>
        )
      },
      {
        id: 'audit-compliance',
        title: 'Audit & Compliance Center',
        headings: [
          { id: 'compliance-overview', text: 'System Risk Scoring & Anomaly Detection', level: 2 },
          { id: 'compliance-audits', text: 'Policy Verification & Event Logs', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Audit & Compliance Center</strong> (<code className="text-slate-200">/analytics/audit</code>) provides real-time oversight of security events, policy compliance, and data anomalies.
            </p>

            <h2 id="compliance-overview" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">System Risk Scoring & Anomaly Detection</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Computes real-time system risk indices by analyzing failed auth attempts, out-of-sequence bill attempts, and unauthorized API calls.
            </p>

            <h2 id="compliance-audits" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Policy Verification & Event Logs</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Allows compliance officers to audit system activity, filter events by severity/category, and export compliance verification reports.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'role-workflows',
    label: 'Role Workflows',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3z" />
      </svg>
    ),
    pages: [
      {
        id: 'je-workflow',
        title: 'Junior Engineer Workflow',
        headings: [
          { id: 'je-steps', text: 'On-Site Engineering Steps', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Operational workflow for Junior Engineers (JE) conducting site operations and estimate compilations.
            </p>

            <h2 id="je-steps" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">On-Site Engineering Steps</h2>
            <DocRoleWorkflow
              role="je"
              steps={[
                'Log in via Telegram @snpolymers_bot OTP gateway',
                'Check catalog item rates in Material Master',
                'Compile Cost Estimate draft for assigned Work Order and submit',
                'Log daily physical site progress (%) and upload geotagged photologs',
                'File payment requisitions and attach vendor invoice files',
                'Track score and streak on JE Field Leaderboard (/analytics/leaderboard)'
              ]}
            />
          </div>
        )
      },
      {
        id: 'zo-workflow',
        title: 'Zonal Office Workflow',
        headings: [
          { id: 'zo-steps', text: 'Regional Management Steps', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Operational workflow for Zonal Office (ZO) managers overseeing regional work order execution.
            </p>

            <h2 id="zo-steps" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Regional Management Steps</h2>
            <DocRoleWorkflow
              role="zo"
              steps={[
                'Open ZO Analytics Dashboard (/analytics/zo) to monitor cash runway',
                'Audit JE Cost Estimates: Approve or Request Revision',
                'File Zonal Fund Requests to HO for local supplier bills',
                'Record sequential Running Account (RA) Bills',
                'Manage Zonal Balances and execute Excess Fund Returns (/excess-fund-returns)'
              ]}
            />
          </div>
        )
      },
      {
        id: 'ho-workflow',
        title: 'Head Office Workflow',
        headings: [
          { id: 'ho-steps', text: 'Executive Approval & Financial Control Steps', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Operational workflow for Head Office (HO) directors managing enterprise finances and approvals.
            </p>

            <h2 id="ho-steps" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Executive Approval & Financial Control Steps</h2>
            <DocRoleWorkflow
              role="ho"
              steps={[
                'Monitor HO Executive Command Center (/analytics/ho) KPI strip and telemetry',
                'Final approve ZO-audited Cost Estimates',
                'Audit regional Fund Requests and assign debit credit sources (CC, OD, CR)',
                'Inspect 3D Project Digital Twins and physical vs. financial progress ratios',
                'Review Audit & Compliance Center for system risk flags'
              ]}
            />
          </div>
        )
      },
      {
        id: 'admin-workflow',
        title: 'Administrator Workflow',
        headings: [
          { id: 'admin-steps', text: 'System Administration & Security Steps', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Operational workflow for System Administrators managing user whitelists, mappings, and security policies.
            </p>

            <DocRoleWorkflow
              role="admin"
              steps={[
                'Manage user accounts in Access Whitelist',
                'Assign JEs and Zonal Managers in User & Work Order Mappings',
                'Maintain Material Master rates, sub-heads, and catalog categories',
                'Manage Purchase Options and ledger vendor mappings',
                'Monitor system Audit Trail Logs and reset Telegram bot webhooks if required'
              ]}
            />
          </div>
        )
      }
    ]
  },
  {
    id: 'administration',
    label: 'System Administration',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    pages: [
      {
        id: 'whitelist-mgmt',
        title: 'Access Whitelist Management',
        headings: [
          { id: 'user-addition', text: 'Adding Authorized Users', level: 2 },
          { id: 'user-deactivation', text: 'Deactivating Accounts', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Administrators control system access by whitelisting employee mobile numbers and assigning role credentials.
            </p>

            <h2 id="user-addition" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Adding Authorized Users</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Click <strong>Add User</strong> in the Whitelist panel. Supply display name, 10-digit mobile number, and role (<code className="text-amber-400">je</code>, <code className="text-amber-400">zo</code>, <code className="text-amber-400">ho</code>, <code className="text-amber-400">admin</code>).
            </p>

            <h2 id="user-deactivation" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Deactivating Accounts</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Toggle user status to <em>Inactive</em> to revoke authentication privileges and invalidate session tokens immediately.
            </p>
          </div>
        )
      },
      {
        id: 'user-wo-mappings',
        title: 'User & Work Order Mappings',
        headings: [
          { id: 'je-zo-mappings', text: 'JE to Zonal Office Clustering', level: 2 },
          { id: 'wo-assignments', text: 'Work Order Project Assignments', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>User Mappings</strong> and <strong>Work Order Mappings</strong> managers (<code className="text-slate-200">/user-mappings</code> & <code className="text-slate-200">/work-order-mappings</code>) configure organizational hierarchy and site ownership.
            </p>

            <h2 id="je-zo-mappings" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">JE to Zonal Office Clustering</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Assigns Junior Engineers to specific Zonal Offices, routing their estimates and requisitions to the correct Zonal Manager queue.
            </p>

            <h2 id="wo-assignments" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Work Order Project Assignments</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Binds specific work orders to assigned field engineers for targeted daily progress entry and requisition filing.
            </p>
          </div>
        )
      },
      {
        id: 'master-data',
        title: 'Master Data Management',
        headings: [
          { id: 'master-projects', text: 'Work Order Master Records', level: 2 },
          { id: 'master-depts', text: 'Departments & Zonal Configurations', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Master Data Panel</strong> (<code className="text-slate-200">/admin/master-data</code>) maintains core work order contracts, department lists, client details, and zonal boundaries.
            </p>
          </div>
        )
      },
      {
        id: 'purchase-options',
        title: 'Purchase Options Manager',
        headings: [
          { id: 'purchase-vendors', text: 'Vendor & Supplier Profiles', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Manages authorized material supplier profiles, credit terms, and cash ledger debits for payment requisitions.
            </p>
          </div>
        )
      },
      {
        id: 'audit-logs',
        title: 'Audit Trail Logs',
        headings: [
          { id: 'audit-inspection', text: 'System Event Inspection', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Centralized security audit log (<code className="text-slate-200">/admin/sessions</code>) recording user logins, document updates, estimate approvals, and administrative actions with IP/browser timestamps.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'permissions',
    label: 'Permissions Reference',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    pages: [
      {
        id: 'role-overview',
        title: 'Role Key Overview',
        headings: [
          { id: 'role-keys', text: 'Active System Roles', level: 2 },
          { id: 'access-levels', text: 'Access Levels', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Overview of system user roles and access capabilities across modules:
            </p>

            <ul className="space-y-3.5 mt-3 text-xs font-semibold">
              <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DocBadge role="je" />
                <span className="text-slate-400">Junior Engineer: Site DPR logging, photologging, cost estimate drafting, payment requisitions.</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DocBadge role="zo" />
                <span className="text-slate-400">Zonal Office: Regional project telemetry, ZO estimate review, zonal fund requests, RA billing.</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DocBadge role="ho" />
                <span className="text-slate-400">Head Office: Executive 10-KPI strip, final estimate approvals, fund request disbursements, compliance oversight.</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DocBadge role="admin" />
                <span className="text-slate-400">Administrator: Full system configuration, whitelisting, user mappings, master data, audit logs.</span>
              </li>
            </ul>
          </div>
        )
      },
      {
        id: 'permissions-matrix',
        title: 'Full Permissions Matrix',
        headings: [
          { id: 'matrix-table', text: 'Module Permissions Matrix', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Complete matrix of role clearances across IDBP modules:
            </p>

            <DocTable>
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-200 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="p-3">Module & System Action</th>
                  <th className="p-3 text-center">JE</th>
                  <th className="p-3 text-center">ZO</th>
                  <th className="p-3 text-center">HO</th>
                  <th className="p-3 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Analytics & Telemetry</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">HO Executive Command Center (/analytics/ho)</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">ZO Zonal Operations Dashboard (/analytics/zo)</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">3D Digital Twin Viewer & Hub</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">JE Field Leaderboard (/analytics/leaderboard)</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Audit & Compliance Center (/analytics/audit)</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Cost Estimating</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Draft & submit cost estimate sheet</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">ZO intermediate audit review</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">HO final estimate approval</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Financials & Billing</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">File Zonal Fund Request</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Approve Fund Request & assign source (CC/OD/CR)</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Record Running Account (RA) Bills</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Execute Excess Fund Returns</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Administration & Setup</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Whitelist User Management & Mappings</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
              </tbody>
            </DocTable>
          </div>
        )
      },
      {
        id: 'security-rules',
        title: 'Security Rules & Constraints',
        headings: [
          { id: 'security-policies', text: 'Important System Security Constraints', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The IDBP system enforces core structural security constraints that cannot be overridden:
            </p>

            <DocCallout type="caution">
              <strong>1. Immutable Billing Records</strong>: Once written to the database, Running Account (RA) and Final Bill records cannot be modified or deleted by any user account (including System Admins).
            </DocCallout>

            <DocCallout type="important">
              <strong>2. Sequential Billing Rule</strong>: Submitting RA Bill $N$ requires RA Bill $N-1$ to be present in database indices.
            </DocCallout>

            <DocCallout type="warning">
              <strong>3. Budget Limit Enforcement</strong>: Payment requisitions and estimate totals exceeding project contract limits are blocked by backend transaction guards.
            </DocCallout>
          </div>
        )
      }
    ]
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting & FAQs',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    pages: [
      {
        id: 'faqs',
        title: 'Frequently Asked Questions',
        headings: [
          { id: 'otp-faqs', text: 'Authentication & OTP Issues', level: 2 },
          { id: 'twin-faqs', text: '3D Digital Twin Viewer Issues', level: 2 },
          { id: 'estimates-faqs', text: 'Estimate Editing & Revision Issues', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <h2 id="otp-faqs" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-4">Authentication & OTP Issues</h2>
            <div className="space-y-4 my-4">
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: I did not receive my login OTP in Telegram.</h4>
                <ol className="list-decimal pl-5 space-y-1 mt-1 text-xs text-slate-300">
                  <li>Verify that your mobile number is whitelisted by an Administrator.</li>
                  <li>Search for Telegram bot <a href="https://t.me/snpolymers_bot" className="text-amber-500 underline font-bold">@snpolymers_bot</a> and send <code className="text-slate-300">/start</code> to reset the connection.</li>
                </ol>
              </div>
            </div>

            <h2 id="twin-faqs" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">3D Digital Twin Viewer Issues</h2>
            <div className="space-y-4 my-4">
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: 3D Site Model is not rendering on mobile.</h4>
                <p className="text-xs text-slate-300 mt-1">Ensure WebGL is enabled in your browser settings. For high-resolution 3D models, use modern mobile browsers (Chrome/Safari).</p>
              </div>
            </div>

            <h2 id="estimates-faqs" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Estimate Editing & Revision Issues</h2>
            <div className="space-y-4 my-4">
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: Why is my estimate sheet locked?</h4>
                <p className="text-xs text-slate-300 mt-1">Once submitted for ZO or HO review, estimate sheets are locked to prevent unauthorized changes during audit.</p>
              </div>
            </div>
          </div>
        )
      }
    ]
  }
];

export const findPageById = (pageId) => {
  for (const section of docSections) {
    const page = section.pages.find((p) => p.id === pageId);
    if (page) return { page, section };
  }
  return null;
};

export const getAllPagesFlat = () => {
  const list = [];
  for (const section of docSections) {
    for (const page of section.pages) {
      list.push({
        id: page.id,
        title: page.title,
        sectionId: section.id,
        sectionLabel: section.label
      });
    }
  }
  return list;
};
