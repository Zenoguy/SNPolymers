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
          { id: 'dashboard-role-adaptation', text: 'Dynamic Role-Based Presentation', level: 2 },
          { id: 'dashboard-components', text: 'Dashboard Widgets & Live Refresh', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p id="dashboard-overview" className="text-slate-300 text-sm leading-relaxed">
              The <strong>Console Dashboard</strong> acts as the central command center of the IDBP application. Once your login session is verified via Telegram OTP, you are redirected here.
            </p>
            
            <h2 id="dashboard-role-adaptation" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Dynamic Role-Based Presentation</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The dashboard dynamically changes its elements based on the operator's active permissions. JEs are presented with estimate draft buttons and site progress logs, whereas ZOs, HOs, and Admins are presented with summary gauges, pending approval queues, and system audit feeds.
            </p>

            <h2 id="dashboard-components" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Dashboard Widgets & Live Refresh</h2>
            <ul className="list-disc pl-5 space-y-3.5 text-slate-300 mt-3 text-xs">
              <li>
                <strong>Operator Profile Details</strong>: Displays active session info, display name, whitelisted phone number, and dynamic privilege badges.
              </li>
              <li>
                <strong>Project Status Counters</strong>: Categorizes and counts projects into <em>Total Registered</em>, <em>Running (Active)</em>, and <em>Closed (Finalized)</em> states.
              </li>
              <li>
                <strong>Live Audit Logs Feed</strong>: Keeps track of recent database modifications (CREATE, UPDATE, STATUS_CHANGE) across all modules. This widget automatically polls the backend database every <strong>30 seconds</strong> to ensure all users see real-time updates.
              </li>
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
          { id: 'catalog-export', text: 'Excel Catalog Exporting', level: 2 },
          { id: 'catalog-actions', text: 'Editing Materials (Admin)', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Material Master Catalog</strong> is the centralized registry of civil engineering materials, equipment rentals, and labor heads. It enforces standard item names and unit configurations across all project sites.
            </p>

            <h2 id="catalog-search" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Search and Debounce Controls</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To prevent server resource exhaustion, the search bar implements a <strong>400ms client-side debounce</strong>. When searching for raw items (e.g., "Steel" or "Cement"), queries are only dispatched after you pause typing. Category filters and sub-heading dropdowns let you isolate specific supply lines.
            </p>

            <h2 id="catalog-active-status" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Active/Inactive Status Logic</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Materials can be toggled between <strong>Active</strong> and <strong>Inactive</strong>. Inactivating a catalog item hides it from Junior Engineers compiling new cost estimates, preventing obsolete material specifications.
            </p>

            <h2 id="catalog-export" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Excel Catalog Exporting</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The catalog provides a one-click <strong>Export to Excel</strong> function. This compiles the current filtered view into a formatted spreadsheet (<code className="text-slate-200">.xlsx</code>) containing item descriptions, categories, units, and rates for offline pricing analysis.
            </p>

            <h2 id="catalog-actions" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Editing Materials (Admin Only)</h2>
            <DocCallout type="note">
              Only Administrators can add, edit, or toggle the activity status of catalog items. Any modification triggers a global audit trail log indicating the old and new values.
            </DocCallout>
          </div>
        )
      },
      {
        id: 'cost-estimates',
        title: 'Cost Estimating',
        headings: [
          { id: 'estimate-workflow', text: 'Estimate Approval Lifecycle', level: 2 },
          { id: 'estimate-compilation', text: 'Priced Sheet Compilation & Grid Controls', level: 2 },
          { id: 'estimate-drafts', text: 'Draft Sheets & Intermittent Saving', level: 2 },
          { id: 'estimate-row-approvals', text: 'Row-Level Approvals & Rejections', level: 2 },
          { id: 'estimate-telegram', text: 'Automated Telegram Dispatcher', level: 2 },
          { id: 'estimate-auto-resubmit', text: 'Automatic Resubmission Mechanics', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Cost Estimates</strong> module manages the project budgets. It is designed to ensure strict quality checks, pricing controls, and automated review workflows.
            </p>

            <h2 id="estimate-workflow" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Estimate Approval Lifecycle</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Cost estimates progress through a strict multi-tier workflow:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
              <div className="bg-white/5 p-3 rounded border border-white/5">
                <span className="font-bold text-amber-400 block mb-1">ZO Stage Workflow</span>
                <DocStepList
                  steps={[
                    { title: 'Draft', content: 'Created and edited solely by the assigned JE.' },
                    { title: 'Submitted', content: 'Estimate sent by JE. Locks the sheet against further edits.' },
                    { title: 'Under ZO Review', content: 'ZO Manager reviews individual line items.' },
                    { title: 'ZO Approved / Rejected', content: 'Passed to HO if all rows approved; else returned to JE for revision.' }
                  ]}
                />
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/5">
                <span className="font-bold text-amber-400 block mb-1">HO Stage Workflow</span>
                <DocStepList
                  steps={[
                    { title: 'Under HO Review', content: 'HO Director audits the ZO-approved cost estimate.' },
                    { title: 'Final Approved', content: 'The estimate budget is locked, allowing project billing and procurement.' },
                    { title: 'HO Revision Requested', content: 'Returned to JE for adjustments.' }
                  ]}
                />
              </div>
            </div>

            <h2 id="estimate-compilation" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Priced Sheet Compilation & Grid Controls</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              JEs compile estimate sheets using an interactive grid linked to the database:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs">
              <li><strong>Real-time Totals</strong>: The row amount (<code className="text-slate-200">Qty × Rate</code>) and the gross estimate amount update instantly in the frontend grid.</li>
              <li><strong>Duplicate Prevention</strong>: The grid blocks adding the exact same material multiple times.</li>
              <li><strong>Transactional Rollback</strong>: On saving drafts or submitting, the backend processes items as a single transaction. If any row contains an invalid material ID, missing values, or negative numbers, the database performs a complete rollback to prevent corrupt data entry.</li>
            </ul>

            <h2 id="estimate-drafts" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Draft Sheets & Intermittent Saving</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Save Draft</strong> button allows JEs to store intermediate budget lines without locking the estimate or routing it to the reviewer queues. The draft remains editable and serves as a working copy.
            </p>

            <h2 id="estimate-row-approvals" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Row-Level Approvals & Rejections</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Reviewers audit estimates row-by-row rather than blindly approving sheets. ZOs and HOs mark each row as <em>Approve</em> or <em>Not Approve</em>. If a reviewer selects <strong>Not Approve</strong>, they must supply a justification in the row's remarks field. If undecided rows exist, the overall review submission is blocked.
            </p>

            <h2 id="estimate-telegram" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Automated Telegram Dispatcher</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To keep the team aligned without delay, the backend is linked to our **Telegram Notification Gateway**:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
              <li><strong>Submissions</strong>: When a JE submits a new sheet, the system dispatches an alert to the Zonal Manager's registered Telegram handle.</li>
              <li><strong>Approvals</strong>: Approving an estimate routes a release notification to Head Office directors.</li>
              <li><strong>Revisions</strong>: If a revision is requested, the bot immediately alerts the JE with the comments and the submission timeline.</li>
            </ul>

            <h2 id="estimate-auto-resubmit" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Automatic Resubmission Mechanics</h2>
            <DocCallout type="important">
              <strong>Revision Countdown Gate</strong>: When a review is returned with a revision request, a countdown timer (defaulting to 24 hours) is registered. If the deadline expires, the next review attempt by the ZO or HO will automatically trigger an <strong>Auto-Resubmission</strong>. This updates the status back to <em>Submitted</em> (or <em>Under HO Review</em>), increments the revision cycle sequence, resets the rejected items to null for re-evaluation, and records an system audit log.
            </DocCallout>
          </div>
        )
      },
      {
        id: 'payment-requisitions',
        title: 'Payment Requisitions',
        headings: [
          { id: 'requisition-directory', text: 'Project Directory & Ledger View', level: 2 },
          { id: 'requisition-workflow', text: 'Filing & Document Upload', level: 2 },
          { id: 'requisition-limits', text: 'Budget Constraint Enforcement', level: 2 },
          { id: 'requisition-ledger', text: 'Ledger and Purchase Mappings', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Payment Requisitions</strong> module tracks material procurement invoices, sub-contractor bills, and supplier payments against project budgets.
            </p>

            <h2 id="requisition-directory" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Project Directory & Ledger View</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The interface divides controls between a global dashboard view and a **Project Directory**. Under the directory tab, you can search and filter the master work order list. Selecting a project work order opens a detailed, chronological table listing all requisition entries filed for that specific project, summarizing their approval state.
            </p>

            <h2 id="requisition-workflow" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Filing & Document Upload</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To file a requisition, select a running project and input the invoice category, reference number, quantity, rate, and GST details. You must upload a scanned copy of the vendor invoice:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
              <li><strong>Format Validation</strong>: The backend checks files and rejects uploads that do not match supported formats (<code className="text-slate-200">.pdf</code>, <code className="text-slate-200">.png</code>, <code className="text-slate-200">.jpg</code>).</li>
              <li><strong>UUID Obfuscation</strong>: Uploaded filenames are obfuscated using UUIDs to prevent directory path traversal vulnerabilities.</li>
            </ul>

            <h2 id="requisition-limits" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Budget Constraint Enforcement</h2>
            <DocCallout type="warning">
              <strong>Strict Budget Block</strong>: Requisition values are validated in real-time. If a submitted amount (including tax options) exceeds the remaining budget of the approved project estimate, the database transaction blocks the entry. Only approved requisition values count towards the remaining budget.
            </DocCallout>

            <h2 id="requisition-ledger" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Ledger and Purchase Mappings</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Requisitions must map to specific suppliers and debit ledger sources. Administrators maintain vendor profiles and payment terms in the Purchase Options Manager to keep options consistent.
            </p>
          </div>
        )
      },
      {
        id: 'daily-progress',
        title: 'Daily Work Progress',
        headings: [
          { id: 'progress-directory', text: 'Active Project Directory', level: 2 },
          { id: 'progress-logging', text: 'On-Site Status Logging & Progress Tables', level: 2 },
          { id: 'progress-backdate', text: 'Back-Date Validation & Approvals', level: 2 },
          { id: 'progress-storage', text: 'Image Storage Security & Signed URLs', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Daily Work Progress</strong> module provides daily monitoring of physical site progress, establishing a detailed chronological audit trail of project completion.
            </p>

            <h2 id="progress-directory" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Active Project Directory</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The daily progress workspace features a **Project Directory** directory panel. Clicking on any work order folder opens the chronological logs dashboard for that site. This drills down into a historical table view of all daily progress entries logged by JEs.
            </p>

            <h2 id="progress-logging" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">On-Site Status Logging & Progress Tables</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Junior Engineers submit reports detailing site visit dates, work summaries, current physical progress percentages (rounded to integer values), and site photologs. These logs compile into a structured tabular progress feed for that work order.
            </p>

            <h2 id="progress-backdate" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Back-Date Validation & Approvals</h2>
            <DocCallout type="important">
              <strong>Back-Date Security Gate</strong>: Logging progress for a past date requires writing a detailed remark justifying the delayed submission. Back-dated reports are marked as <strong>Pending Approval</strong>. They do not appear in the public project timelines until reviewed and approved by Zonal or Head Office authorities.
            </DocCallout>

            <h2 id="progress-storage" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Image Storage Security & Signed URLs</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Site photos are stored in a private Supabase storage bucket. The app denies direct public URLs. Instead, temporary **Signed URLs** with a 1-hour expiration token are generated dynamically for authorized users, securing site photos against unauthorized access.
            </p>
          </div>
        )
      },
      {
        id: 'fund-requests',
        title: 'Fund Requests',
        headings: [
          { id: 'fund-metrics', text: 'Financial Gauges & Accounts', level: 2 },
          { id: 'fund-workflow', text: 'Review and Source Allocation', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Fund Requests</strong> module manages cash disbursement requests filed by Zonal Managers to settle local supplier and sub-contractor liabilities.
            </p>

            <h2 id="fund-metrics" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Financial Gauges & Accounts</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The module dashboard features allocation gauges displaying remaining credits across active accounts:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs">
              <li><strong>Credit Control (CC)</strong>: Primary cash account.</li>
              <li><strong>Overdraft (OD)</strong>: Short-term credit line.</li>
              <li><strong>Cash Credit (CR)</strong>: Secondary working capital account.</li>
            </ul>

            <h2 id="fund-workflow" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Review and Source Allocation</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Zonal Officers file fund requests in a <em>Pending</em> state. Head Office reviewers audit request details, select the source debit account (CC, OD, or CR), and input approval comments. Releasing funds updates account ledger balances.
            </p>
          </div>
        )
      },
      {
        id: 'ra-final-bills',
        title: 'RA & Final Bills',
        headings: [
          { id: 'bill-directory', text: 'Billing Directory & Work Order Selection', level: 2 },
          { id: 'bill-calculations', text: 'Bill Balance Logs & Breakdown Integrity', level: 2 },
          { id: 'bill-sequence', text: 'Sequential Bill Verification', level: 2 },
          { id: 'bill-immutability', text: 'Permanent Immutability Safeguard', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Running Account (RA) & Final Bills</strong> ledger records formal project invoices submitted to clients for civil works completed.
            </p>

            <h2 id="bill-directory" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Billing Directory & Work Order Selection</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The workspace provides a **Billing Directory** view showing all work orders. Selecting a project opens its specific Billing Ledger Sheet. This presents a chronological table listing all historical RA bill entries and balance computations for that project work order.
            </p>

            <h2 id="bill-calculations" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Bill Balance Logs & Breakdown Integrity</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every bill entry calculates previous billings, the current invoice value, and remaining project contract values. The backend enforces a strict breakdown sum rule:
            </p>
            <div className="bg-white/5 p-3 rounded font-mono text-[11px] text-amber-400 border border-white/5 mt-2">
              Gross Bill = Agency Payment + Security Deposit + Earnest Money Deposit + Special Security + Other Retentions + IT TDS + Taxes (SGST & CGST)
            </div>
            <p className="text-slate-300 text-xs mt-2">
              If the submitted gross bill deviates from the sum of these breakdown fields (by 0.01 or more), the API rejects the request with a validation error.
            </p>

            <h2 id="bill-sequence" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Sequential Bill Verification</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To ensure sequential billing compliance, the database validates billing logs. Creating a bill labeled <em>RA Bill N</em> is blocked unless a record for <em>RA Bill N-1</em> exists in the work order directory.
            </p>

            <h2 id="bill-immutability" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Permanent Immutability Safeguard</h2>
            <DocCallout type="caution">
              <strong>Immutable Database Records</strong>: Once written, RA and Final Bill records cannot be edited, modified, or deleted by any user role (including System Administrators). This constraint is enforced by database triggers and API validation layers.
            </DocCallout>
          </div>
        )
      },
      {
        id: 'fund-reports',
        title: 'Project Fund Reports',
        headings: [
          { id: 'report-overview', text: 'Financial Disbursements Tracking', level: 2 },
          { id: 'report-constraints', text: 'Immutability and Project Closure', level: 2 }
        ],
        content: (
          <div className="space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong>Project Fund Reports</strong> module tracks and registers actual corporate disbursement events mapped to active project work orders.
            </p>

            <h2 id="report-overview" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Financial Disbursements Tracking</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Users with active credentials can submit a new disbursement log by entering the Work Order Number, the disbursed amount (INR), and NEFT/RTGS transaction reference remarks. The system automatically pulls project location and department info from Master Data.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 mt-3 text-xs">
              <li><strong>Refreshed Analytics Header</strong>: Real-time summaries show the total disbursement volume, active reports count, running projects, and closed projects.</li>
              <li><strong>Edit access</strong>: General roles can view, compile, and update details for active reports.</li>
              <li><strong>Administrative control</strong>: Administrators can soft-delete active records, view deleted logs in a dedicated <strong>Deleted</strong> tab, and restore soft-deleted items instantly.</li>
            </ul>

            <h2 id="report-constraints" className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2 mt-6">Immutability and Project Closure</h2>
            <DocCallout type="caution">
              <strong>Closed Project Lock</strong>: If a project's status is changed to <strong>Closed</strong> in Master Data, all linked fund reports are locked immediately. Creation, modification, soft-deletion, or restoration requests for closed projects are blocked on both the client side and the database level.
            </DocCallout>
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
                'Create payment requisitions and attach raw invoice files',
                'Log project disbursements under the Fund Reports portal (/fund-reports)'
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
                'Log work completion and file sequential Running Account (RA) bills',
                'Submit disbursement logs under the Fund Reports console (/fund-reports)'
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
                'Authorize fund releases and track ledger disbursements',
                'Track and compile regional project disbursements under Fund Reports (/fund-reports)'
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
                'Review global Audit Trail logs for security and compliance checks',
                'Manage project fund reports: view active/deleted, soft-delete, and restore logs (/fund-reports)'
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
