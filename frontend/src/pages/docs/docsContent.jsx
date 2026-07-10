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
          { id: 'access-control', text: 'Access Model', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p id="overview" className="text-slate-300 text-sm leading-relaxed">
              Welcome to the <strong>Integrated Digital Business Platform (IDBP)</strong> for <strong>S.N. Polymers Pvt. Ltd.</strong>
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              The IDBP is a central enterprise resource planning hub designed to streamline and automate civil engineering projects, raw materials formulation pipelines, municipal infrastructure billing, and regional financial controls.
            </p>
            
            <h2 id="core-functions" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Core Functional Modules</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li><strong>Cost Estimations</strong>: Collaborative drafting, review, and approval of civil engineering budgets against contracts.</li>
              <li><strong>Procurement Logs</strong>: Tracking vendor payment requisitions, invoicing, and project credit limit balances.</li>
              <li><strong>Site Monitoring</strong>: Daily physical progress tracking, photologging, and engineering site checklists.</li>
              <li><strong>Financial Controls</strong>: Fund disbursement requisitions and sequential contractor running account billing (RA bills).</li>
            </ul>

            <h2 id="access-control" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Access Model</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The platform utilizes strict role-based access control (RBAC). Your user profile initials, name, and registered role will dictate the navigation menu options, dashboards, and write clearances available to you on both mobile and desktop views.
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
                      <p className="mt-1">Enter your 10-digit mobile number in the login field. The system automatically handles country formatting (<code className="text-slate-200">+91</code> suffix prepending) and strips out dashes or letters.</p>
                    </div>
                  )
                },
                {
                  title: 'Setting Up the Telegram Bot',
                  content: (
                    <div id="telegram-bot" className="space-y-2">
                      <p>If you log in for the first time, the platform will redirect you to the <strong>Telegram Link Setup</strong> screen.</p>
                      <DocCallout type="warning">
                        Do not skip this process. One-Time Passcodes (OTPs) are delivered solely via our secure Telegram gateway to prevent cellular SMS delays.
                      </DocCallout>
                      <ol className="list-decimal pl-5 space-y-1.5 mt-2 text-[11px] text-slate-400">
                        <li>Click the redirection link to launch Telegram and start a chat with the official bot: <a href="https://t.me/snpolymers_bot" target="_blank" rel="noreferrer" className="text-amber-500 underline font-bold">@snpolymers_bot</a>.</li>
                        <li>Click the <strong>Start</strong> button in the chat screen.</li>
                        <li>When prompted by the bot, click <strong>Share Contact</strong>. This securely links your Telegram identifier with your whitelisted phone number.</li>
                        <li>Once linked, return to the browser login page to proceed.</li>
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
                      <p>The server matches the whitelisting records and issues an API command to our Telegram bot dispatcher.</p>
                    </div>
                  )
                },
                {
                  title: 'Retrieving Code',
                  content: (
                    <div className="space-y-1">
                      <p>Open your Telegram application and click the chat thread for <strong>S.N. Polymers Bot</strong>.</p>
                      <p>A message containing a secure 6-digit numeric login code will arrive immediately. The code remains active for <strong>5 minutes</strong>.</p>
                    </div>
                  )
                },
                {
                  title: 'Verification',
                  content: (
                    <div id="otp-verification" className="space-y-2">
                      <p>Type the 6-digit code in the numeric input boxes in your browser and click <strong>Verify Code</strong>.</p>
                      <p>If the code timer runs down to zero before you input the numbers, click <strong>Resend Code</strong> to dispatch a fresh passcode.</p>
                      <DocCallout type="note">
                        Upon successful verification, the browser stores your authorization token locally and redirects you directly to the Console Dashboard.
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
          { id: 'desktop-sidebar', text: 'Desktop Sidebar Details', level: 2 },
          { id: 'mobile-navigation', text: 'Mobile Header & Drawer', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The IDBP client application is built to load instantly and scale fluidly across laptop monitors, site tablets, and smartphones.
            </p>

            <h2 id="desktop-sidebar" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Desktop Sidebar Details</h2>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-300 mt-3 text-xs">
              <li><strong>Menu Collapse</strong>: Click the arrow control (<code className="text-slate-200">&lt;</code> / <code className="text-slate-200">&gt;</code>) at the top of the sidebar. This collapses the bar to a compact, icon-only layout to maximize screen real estate for billing sheets. The collapse selection is saved in browser localStorage.</li>
              <li><strong>Role-Filtered Menus</strong>: Menu selections are injected conditionally. Junior Engineers will not see billing logs or fund requests, ensuring a clean workplace interface.</li>
              <li><strong>Theme Mode Toggle</strong>: Located at the bottom of the sidebar. Toggle between <strong>Dark Mode</strong> (indigo-black palette for indoor reporting) and <strong>Light Mode</strong> (high-contrast screen values for outdoor inspection under high ambient sunlight).</li>
              <li><strong>Operator Panel</strong>: Displays display name, initials, active role, and a secure <strong>Sign Out</strong> button to invalidate the current cookie/token set.</li>
            </ul>

            <h2 id="mobile-navigation" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Mobile Header & Drawer</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>On small phone screens, the sidebar slides off-screen. Tap the menu toggle icon on the left header bar to slide out the navigation menu.</li>
              <li>The header bar offers quick buttons for the <strong>Console Dashboard</strong> or <strong>Admin Configuration</strong> panels matching your credentials.</li>
            </ul>
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
              Upon accessing the platform console for the first time, complete these quick validation checklists tailored to your functional role.
            </p>

            <h2 id="je-checklist" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Junior Engineer (JE) Checklist</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>Go to <strong>Material Master</strong>. Type a search query (e.g. "Steel" or "Cement") to check catalog search response.</li>
              <li>Go to <strong>Cost Estimates</strong> and click <strong>New Sheet</strong>. Pick a work order number to verify cascading metadata details (Client, Contract value, State) load correctly.</li>
              <li>Go to <strong>Daily Progress</strong> to confirm regional project directory listings populate.</li>
            </ul>

            <h2 id="zo-checklist" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Zonal Office (ZO) Checklist</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>Access <strong>Cost Estimates</strong>. Check for items flagged as <strong>Under ZO Review</strong> to inspect budget lines.</li>
              <li>Go to <strong>Fund Requests</strong> and verify that status distribution pie charts and budget allocation gauges (CC, OD, CR accounts) load.</li>
              <li>Access <strong>RA / Final Bills</strong> and check that your regional work folders load.</li>
            </ul>

            <h2 id="ho-checklist" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Head Office Checklist</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>Open <strong>Cost Estimates</strong>. Change views to <strong>Active Queue</strong> to inspect estimates requiring final approval.</li>
              <li>Open <strong>Fund Requests</strong>. Find a request flagged as <strong>Pending</strong>, open its action drawer, and confirm that Credit source assignment dropdowns populate.</li>
            </ul>

            <h2 id="admin-checklist" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Administrator Checklist</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li>Access the <strong>Access Whitelist</strong> page and search for your login record to verify details.</li>
              <li>Navigate to <strong>Audit Trail Logs</strong> and filter system events by "Auth" or "Estimate" categories.</li>
              <li>Go to <strong>Purchase Options</strong> to inspect active vendor and ledger mappings.</li>
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
              Operational reference dictionary for key ERP and logistics terms used throughout S.N. Polymers Pvt. Ltd. modules.
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
                  <td className="p-3">A contract allocated to the enterprise. Contains customer details, pricing caps, and geographical location bounds.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Estimate Sheet</td>
                  <td className="p-3">A priced bill of materials sheet (e.g. <code className="text-slate-300">EST-2026-XXXX</code>) compiled by engineers detailing material and labor allocations for a Work Order.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Running Account (RA) Bill</td>
                  <td className="p-3">Sequential invoice structures compiled against complete stages of work. Immutable once saved in DB.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Fund Request</td>
                  <td className="p-3">Cash allocation requisition filed by Zonal Managers to Head Office to settle local vendor bills.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Whitelisting</td>
                  <td className="p-3">System security filter blocking all incoming mobile OTP commands except those matching pre-authorized phone logs.</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-extrabold text-amber-400">Telegram Bot Gate</td>
                  <td className="p-3">The programmatic channel (<code className="text-slate-300">@snpolymers_bot</code>) transmitting instant login validation OTPs to user mobile feeds.</td>
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
          { id: 'dashboard-components', text: 'Dashboard Widgets', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p id="dashboard-overview" className="text-slate-300 text-sm leading-relaxed">
              The <strong>Console Dashboard</strong> acts as the central home landing pad after completing secure OTP verification.
            </p>

            <h2 id="dashboard-components" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Dashboard Widgets</h2>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-300 mt-3 text-xs">
              <li><strong>Operator Profile Card</strong>: Displays phone details and active permission tags.</li>
              <li><strong>Project Operations Overview</strong>: Counter cards showing overall project lists divided into <em>Total</em>, <em>Running</em>, and <em>Closed/Warranty</em> status categories. Also displays a timestamp of the last project data change.</li>
              <li><strong>Budget Sheets Tracker</strong>: Counter widget capturing pending estimate draft approvals. Offers a quick button for engineers to launch a blank estimate sheet.</li>
              <li><strong>Recent Activity Feed</strong>: A live action log displaying the last 4 database commands (e.g. status alterations, progress photo postings). Automatically fetches fresh data from the server every <strong>30 seconds</strong>.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'material-master',
        title: 'Material Master Catalog',
        headings: [
          { id: 'catalog-search', text: 'Search and Debounce Controls', level: 2 },
          { id: 'catalog-export', text: 'Excel Catalog Exporting', level: 2 },
          { id: 'catalog-actions', text: 'Editing Materials (Admin)', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Material Master</strong> stores the catalog of items, tools, and labor grades used during estimation processes.
            </p>

            <h2 id="catalog-search" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Search and Debounce Controls</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Use the search bar input at the top to filter items by keyword. The search uses a <strong>400ms debounce</strong> cycle, preventing repeated backend query triggers as you type. You can also filter catalog items by primary category, sub-category, or active status tags.
            </p>

            <h2 id="catalog-export" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Excel Catalog Exporting</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Click <strong>Export to Excel</strong> to compile and download the current filtered material rows as a spreadsheet (<code className="text-slate-200">.xlsx</code> format) for regional procurement scheduling.
            </p>

            <h2 id="catalog-actions" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Editing Materials (Admin)</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              System Administrators can access an item creation modal to define new sub-headings, adjust measuring metrics (Bags, Tons, Days), or toggle item activity checkmarks (deactivating items blocks JEs from adding them to estimates).
            </p>
          </div>
        )
      },
      {
        id: 'cost-estimates',
        title: 'Cost Estimating',
        headings: [
          { id: 'estimate-list', text: 'Estimate Logs and Filtering', level: 2 },
          { id: 'estimate-form', text: 'Priced Sheet Compilation', level: 2 },
          { id: 'estimate-timeline', text: 'Revision Timelines and Limits', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Cost Estimates</strong> module is the business portal's heart, managing tender line item details and regional work budgets.
            </p>

            <h2 id="estimate-list" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Estimate Logs and Filtering</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The estimates page displays log metrics, a workspace toggle to isolate <strong>Draft Sheets</strong>, and a dashboard table with work numbers, status indicators, contract value percentages, and action detail buttons.
            </p>

            <h2 id="estimate-form" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Priced Sheet Compilation</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To build a sheet, click <strong>New Sheet</strong>. Select a Work Order number to populate project metadata.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
              <li><strong>Interactive Grid</strong>: Select item category heads, sub-heads, and material configurations. The system automatically populates read-only unit types.</li>
              <li><strong>Dynamic Calculation</strong>: Input unit quantity and unit price values. The line row amount (<code className="text-amber-400">Qty × Rate</code>) and the gross estimate sum at the page footer update in real-time.</li>
              <li><strong>Save Draft</strong>: Saves current rows as a draft locally on the backend database without routing the sheet to the reviewers' queues.</li>
            </ul>

            <h2 id="estimate-timeline" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Revision Timelines and Limits</h2>
            <DocCallout type="important">
              <strong>Revision Countdown Gate</strong>: When a Zonal Office or Head Office reviewer flags an estimate for revision, the system displays an orange countdown banner detailing a submission deadline. If this timeline expires, the estimate is locked against adjustments. Only an Administrator can reset this deadline.
            </DocCallout>
          </div>
        )
      },
      {
        id: 'payment-requisitions',
        title: 'Payment Requisitions',
        headings: [
          { id: 'requisition-logging', text: 'Invoice Filing', level: 2 },
          { id: 'requisition-limits', text: 'Budget Constraint Enforcement', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Payment Requisitions</strong> module tracks raw materials procurement and supplier ledger payments.
            </p>

            <h2 id="requisition-logging" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Invoice Filing</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Engineers select a project folder to log invoice rows. Fields include Category Selection, Invoice Reference Number, Quantity, Unit Rate, GST declaration toggle, and an attachment uploader.
            </p>
            <DocCallout type="warning">
              <strong>Document Verification Gate</strong>: The backend inspects uploaded file headers. Files that are corrupt or do not match supported image/document formats (<code className="text-slate-200">.pdf</code>, <code className="text-slate-200">.png</code>, <code className="text-slate-200">.jpg</code>) are automatically rejected.
            </DocCallout>

            <h2 id="requisition-limits" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Budget Constraint Enforcement</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The platform monitors budget balance values in real-time. Submitting a requisition value that exceeds the remaining balance of the approved project estimate triggers a system block, preventing submit validation.
            </p>
          </div>
        )
      },
      {
        id: 'daily-progress',
        title: 'Daily Work Progress',
        headings: [
          { id: 'progress-logging', text: 'Physical Site Updates', level: 2 },
          { id: 'progress-timeline', text: 'Timeline View & Verification', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Daily Work Progress</strong> log tracks on-site construction timeline schedules.
            </p>

            <h2 id="progress-logging" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Physical Site Updates</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Junior Engineers update project completion records by choosing a site visit date, writing an activity summary, entering the cumulative physical completion percentage (0 - 100%), and uploading a verification photograph.
            </p>

            <h2 id="progress-timeline" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Timeline View & Verification</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Updates display as an interactive vertical feed. Click progress photo thumbnails to view high-resolution snapshots. Zonal Office and Head Office managers use evaluation text fields on each update to log compliance notes.
            </p>
          </div>
        )
      },
      {
        id: 'fund-requests',
        title: 'Fund Requests',
        headings: [
          { id: 'request-metrics', text: 'Financial Metrics Dashboard', level: 2 },
          { id: 'request-approval', text: 'Allocation and Review Gate', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Fund Requests</strong> module manages cash transfers to zonal bank accounts to settle site liabilities.
            </p>

            <h2 id="request-metrics" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Financial Metrics Dashboard</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              This panel displays counters for requested, approved, and pending funds. Integrated charts display active statuses (pie chart) and remaining cash values across Credit Control (CC), Overdraft (OD), and Cash Credit (CR) accounts (bar chart).
            </p>

            <h2 id="request-approval" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Allocation and Review Gate</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Zonal Officers can submit request rows detailing targets and local remarks. Head Office approvers review the request drawer, select the debit ledger source (CC, OD, or CR), and click <strong>Approve</strong> or <strong>Place on Hold</strong>.
            </p>
          </div>
        )
      },
      {
        id: 'ra-final-bills',
        title: 'RA & Final Bills',
        headings: [
          { id: 'bill-calculations', text: 'Bill Balance Logs', level: 2 },
          { id: 'bill-constraints', text: 'System Safeguards & Security', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>RA / Final Bills</strong> spreadsheet registers client progress invoice logs.
            </p>

            <h2 id="bill-calculations" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Bill Balance Logs</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The billing ledger calculates and displays cumulative billing values (previously billed, current bill amount, and remaining project values). Zonal Managers log billing rows and upload signed PDF billing records.
            </p>

            <h2 id="bill-constraints" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">System Safeguards & Security</h2>
            <DocCallout type="caution">
              <strong>Immutable Audit Log</strong>: To preserve accounting integrity, billing records cannot be edited or deleted by any user level (including administrators) once written to the database.
            </DocCallout>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 mt-3 text-xs">
              <li><strong>Billing Sequence</strong>: The system enforces sequential billing. The database blocks billing row $N$ unless billing row $N-1$ is registered in the system index.</li>
            </ul>
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
              Overview of the operational workflow for Junior Engineers (JE) tracking site activities.
            </p>

            <h2 id="je-steps" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">On-Site Engineering Steps</h2>
            <DocRoleWorkflow
              role="je"
              steps={[
                'Verify Telegram @snpolymers_bot connection and log in',
                'Inspect the Material Master list for catalog item rates',
                'Create a Cost Estimate draft for an active Work Order',
                'Submit the estimate sheet for Zonal review',
                'Log daily physical site progress percentages and upload photos',
                'Create payment requisitions and attach raw invoice files'
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
              Overview of the operational workflow for Zonal Office (ZO) managers coordinating regional operations.
            </p>

            <h2 id="zo-steps" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Regional Management Steps</h2>
            <DocRoleWorkflow
              role="zo"
              steps={[
                'Log in and open the Cost Estimates approval queue',
                'Audit JE sheets: Approve or Request Revision with a submission timer',
                'Submit Zonal Fund Requests to HO to pay local vendor bills',
                'Log work completion and file sequential Running Account (RA) bills'
              ]}
            />
          </div>
        )
      },
      {
        id: 'ho-workflow',
        title: 'Head Office Workflow',
        headings: [
          { id: 'ho-steps', text: 'Executive Approval and Funding Steps', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Overview of the operational workflow for Head Office (HO) directors managing financial controls and approvals.
            </p>

            <h2 id="ho-steps" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Executive Approval and Funding Steps</h2>
            <DocRoleWorkflow
              role="ho"
              steps={[
                'Access pending lists to final approve cost estimate sheets',
                'Monitor live progress updates, site photologs, and billing ledger balances',
                'Review regional Fund Requests and select the debit credit source (CC, OD, CR)',
                'Authorize fund releases and track ledger disbursements'
              ]}
            />
          </div>
        )
      },
      {
        id: 'admin-workflow',
        title: 'Administrator Workflow',
        headings: [
          { id: 'admin-steps', text: 'System Administration and Compliance Steps', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Overview of system setup, whitelisting, and compliance workflows for Administrators.
            </p>

            <h2 id="admin-steps" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">System Administration and Compliance Steps</h2>
            <DocRoleWorkflow
              role="admin"
              steps={[
                'Access the Whitelist menu to register or deactivate users',
                'Reset Telegram links for users updating phone hardware',
                'Maintain material heads, sub-heads, and catalog rates',
                'Review global Audit Trail logs for security and compliance checks'
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
          { id: 'user-deactivation', text: 'Deactivating Access Accounts', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Administrators manage platform security by whitelisting employee mobile credentials.
            </p>

            <h2 id="user-addition" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Adding Authorized Users</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Click <strong>Add User</strong> in the Admin panel. Input the user's Full Name, their 10-digit mobile number, and assign a role dropdown value. Once whitelisted, the user can establish their Telegram connection.
            </p>

            <h2 id="user-deactivation" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Deactivating Access Accounts</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To revoke access, edit the user's whitelist entry and toggle their active checkbox to <em>Inactive</em>. The authentication gate will block the next login request, and the server's API route guards will reject active sessions instantly.
            </p>
          </div>
        )
      },
      {
        id: 'purchase-options',
        title: 'Purchase Options Manager',
        headings: [
          { id: 'purchase-overview', text: 'Authorized Vendors', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <h2 id="purchase-overview" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-4">Authorized Vendors</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              This panel manages the default supplier profiles and cash ledger sources displayed during cost estimate and payment requisition compilation.
            </p>
          </div>
        )
      },
      {
        id: 'audit-logs',
        title: 'Audit Trail Logs',
        headings: [
          { id: 'audit-overview', text: 'Inspecting System Audit Logs', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <h2 id="audit-overview" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-4">Inspecting System Audit Logs</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              This module tracks system activity logs for compliance checks. The log records user actions, timestamps, and target records (e.g. estimate sheet changes, fund approvals, role updates). Use the query fields to filter records by user or date.
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
          { id: 'access-levels', text: 'Functional Access Definitions', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The system operates a role-based access control (RBAC) model. Review role definitions and permissions mapping below.
            </p>

            <h2 id="role-keys" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Active System Roles</h2>
            <ul className="space-y-3.5 mt-3 text-xs font-semibold">
              <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DocBadge role="je" />
                <span className="text-slate-400">Junior Engineer: Sites monitoring, estimate drafting, daily progress logging, and payment requisitions.</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DocBadge role="zo" />
                <span className="text-slate-400">Zonal Office: Regional managers reviewing estimates, requesting funds, and compiling contractor bills.</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DocBadge role="ho" />
                <span className="text-slate-400">Head Office: Directors coordinating approvals, allocating debit sources, and disbursing funds.</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DocBadge role="admin" />
                <span className="text-slate-400">Administrator: Configuration managers controlling user whitelisting, catalog tables, and system security.</span>
              </li>
            </ul>

            <DocCallout type="caution">
              <strong>Deprecated Role Alert</strong>: The <DocBadge role="staff" /> profile has been removed from active system configs. Operational personnel must be mapped to one of the four active roles listed above.
            </DocCallout>

            <h2 id="access-levels" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Functional Access Definitions</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3 text-xs">
              <li><strong>Full Access</strong>: Clearance to read, build, edit, and submit modifications.</li>
              <li><strong>View Only</strong>: Clearance to read log columns, charts, and metrics feeds without write capabilities.</li>
              <li><strong>No Access</strong>: Menu blocks and API guards deny access. Elements are hidden from the user interface.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'permissions-matrix',
        title: 'Full Permissions Matrix',
        headings: [
          { id: 'matrix-table', text: 'System Modules Matrix', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Full mapping table of role clearances across IDBP modules and database actions.
            </p>

            <h2 id="matrix-table" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-4">System Modules Matrix</h2>
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
                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Authentication & Setup</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Mobile input OTP logging</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Telegram link verification setup</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Adjust UI viewing theme</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Console Dashboard</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">View construction project logs</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Inspect project pricing logs</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Inspect live recent operations feed</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Material Master</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Search & filter material items list</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Export catalog to spreadsheet</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Add, modify, or toggle item statuses</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Cost Estimating</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Inspect estimation logs list</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Compile estimate draft and route to review</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Zonal intermediate review (ZO stage)</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Final approval execution (HO stage)</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Send sheet back to revision</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Payment Requisitions</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">View requisitions and invoice copies</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">File requisition & upload files</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Revoke/delete active requisition log</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Daily Work Progress</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Read progress entries and photologs</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Update daily progress and photolog</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Attach evaluation remarks</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Fund Requests</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Read request ledger and charts</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Submit zonal funding request</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Revoke pending request draft</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Approve request or set hold flags</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Contractor Billing (RA Bills)</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">View billing history ledger</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Create sequential billing records</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>

                {/* Section Group */}
                <tr className="bg-white/[0.02] font-extrabold text-[10px] text-amber-500 uppercase tracking-widest">
                  <td colSpan="5" className="p-2 pl-3">Administration Panel</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Add or edit whitelist records</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Reset user Telegram webhook links</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-slate-500 font-normal">None</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">Full</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition">
                  <td className="p-3">Inspect global system audit trail</td>
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
          { id: 'security-policies', text: 'Important Security Policies', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The IDBP database forces specific structural rules that cannot be bypassed.
            </p>

            <h2 id="security-policies" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-4">Important Security Policies</h2>
            <DocCallout type="caution">
              <strong>1. Immutable Billing Records</strong>: Once a Running Account (RA) or Final Bill is successfully written to the database, it cannot be modified or deleted by any user account (including administrators) once written to the database to ensure compliance with financial audits.
            </DocCallout>

            <DocCallout type="important">
              <strong>2. Sequential Billing Checks</strong>: The system verifies billing ranges. You cannot submit bill log $N$ unless bill entry $N-1$ is registered in the system index.
            </DocCallout>

            <DocCallout type="warning">
              <strong>3. Revision Timers</strong>: When a review officer requests an estimate modification, the system updates a live submission countdown clock. If the timer expires, the estimate input locks automatically for non-admin accounts.
            </DocCallout>

            <DocCallout type="note">
              <strong>4. API Security Filters</strong>: UI blocks hide menu components, but the backend server inspects all incoming requests for active JWT authorization tags to verify clearances.
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
          { id: 'estimates-faqs', text: 'Estimate Editing & Revision Issues', level: 2 },
          { id: 'upload-faqs', text: 'File Upload & Format Issues', level: 2 },
          { id: 'billing-faqs', text: 'Contractor Billing Issues', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <h2 id="otp-faqs" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-4">Authentication & OTP Issues</h2>
            <div className="space-y-4 my-4">
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: I did not receive my login OTP code in Telegram.</h4>
                <ol className="list-decimal pl-5 space-y-1 mt-1 text-xs text-slate-300">
                  <li>Verify that the mobile number typed matches your profile registration.</li>
                  <li>Confirm with your administrator that your phone details are in the whitelist database.</li>
                  <li>Open Telegram, search for the chat channel: <a href="https://t.me/snpolymers_bot" className="text-amber-500 underline font-bold">@snpolymers_bot</a> and type <code className="text-slate-300">/start</code> to reset the channel link.</li>
                </ol>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: System says "Access Denied: Registered whitelisted credentials required."</h4>
                <p className="text-xs text-slate-300 mt-1">Your mobile number is not registered in the system whitelist. Contact your Administrator to whitelist your phone number.</p>
              </div>
            </div>

            <h2 id="estimates-faqs" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Estimate Editing & Revision Issues</h2>
            <div className="space-y-4 my-4">
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: Why cannot I modify my cost estimate sheet?</h4>
                <p className="text-xs text-slate-300 mt-1">Once submitted, estimate sheets are locked. If you need adjustments, contact a Zonal or Head Office reviewer to request a revision.</p>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: Why is my estimate revision locked?</h4>
                <p className="text-xs text-slate-300 mt-1">Your revision deadline has expired. Contact your Zonal Office or an Administrator to extend the deadline.</p>
              </div>
            </div>

            <h2 id="upload-faqs" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">File Upload & Format Issues</h2>
            <div className="space-y-4 my-4">
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: Why was my file upload rejected?</h4>
                <p className="text-xs text-slate-300 mt-1">The server validates files to prevent security issues. Ensure you upload uncorrupted <code className="text-slate-300">.pdf</code>, <code className="text-slate-300">.png</code>, or <code className="text-slate-300">.jpg</code> formats. Other file extensions are blocked.</p>
              </div>
            </div>

            <h2 id="billing-faqs" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Contractor Billing Issues</h2>
            <div className="space-y-4 my-4">
              <div>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Q: Why cannot I save a new Running Account Bill?</h4>
                <p className="text-xs text-slate-300 mt-1">The system forces sequential contractor billing. You cannot create bill entry $N$ unless bill entry $N-1$ is registered in the database index.</p>
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
