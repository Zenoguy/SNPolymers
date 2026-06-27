import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import BackgroundShapes from '../components/BackgroundShapes';
import Sidebar, { MobileHeader } from '../components/Sidebar';
import { getReports, getDeletedReports, createReport, updateReport, deleteReport, restoreReport } from '../api/reportsApi';
import { getProjects } from '../api/projectsApi';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = { work_order_no: '', amount: '', remarks: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (val) =>
  val != null ? `₹ ${Number(val).toLocaleString('en-IN')}` : '—';

const formatDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    Running: { dot: 'bg-emerald-400', pill: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400', label: 'Running' },
    Closed: { dot: 'bg-red-400', pill: 'bg-red-500/10 border-red-500/25 text-red-400', label: 'Closed' },
    'Complete Under Maintenance': { dot: 'bg-amber-400', pill: 'bg-amber-500/10 border-amber-500/25 text-amber-400', label: 'Under Maintenance' },
  };
  const s = cfg[status] ?? cfg['Running'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Mutability Warning Banner ────────────────────────────────────────────────
const MutabilityWarning = ({ workOrderNo }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-955/25 border border-red-500/30 text-xs text-red-300">
    <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
    <div>
      <span className="font-extrabold text-red-300 uppercase tracking-wider">Project Closed — Immutable</span>
      <p className="mt-1 font-medium text-red-400/80">
        <span className="font-mono font-bold">{workOrderNo}</span> has status <strong>Closed</strong>.
        All linked fund reports are locked. No new reports can be created, edited, or deleted.
      </p>
    </div>
  </div>
);

// ─── Project Auto-Fill Preview ────────────────────────────────────────────────
const ProjectPreview = ({ master }) => {
  if (!master) return null;
  const rows = [
    { label: 'Estimate No.', value: master.estimate_no },
    { label: 'Site Details', value: master.site_details },
    { label: 'State', value: master.state },
    { label: 'District', value: master.district },
    { label: 'Zone', value: master.zone },
    { label: 'Department', value: master.department },
  ];
  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-left">
      <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-3">
        ⟵ Auto-filled from Master Data
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
            <p className="text-xs font-semibold text-slate-300 mt-0.5 truncate">{value || '—'}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-indigo-500/10">
        <StatusBadge status={master.status} />
      </div>
    </div>
  );
};

// ─── Report Form Modal ────────────────────────────────────────────────────────
const ReportFormModal = ({ mode, initial, projects, onClose, onSave }) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [masterData, setMasterData] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  // Auto-fill when editing an existing report
  useEffect(() => {
    if (isEdit && initial?.work_order_no) {
      const proj = projects.find((p) => p.work_order_no === initial.work_order_no);
      if (proj) {
        setMasterData(proj);
        setIsClosed(proj.status === 'Closed');
      }
    }
  }, [isEdit, initial, projects]);

  // Debounced lookup for create mode
  const lookupProject = useCallback(
    (won) => {
      clearTimeout(debounceRef.current);
      if (!won.trim()) {
        setMasterData(null);
        setIsClosed(false);
        return;
      }
      debounceRef.current = setTimeout(() => {
        const proj = projects.find(
          (p) => p.work_order_no.toLowerCase() === won.trim().toLowerCase()
        );
        if (proj) {
          setMasterData(proj);
          setIsClosed(proj.status === 'Closed');
        } else {
          setMasterData(null);
          setIsClosed(false);
        }
        setLookupLoading(false);
      }, 400);
      setLookupLoading(true);
    },
    [projects]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'work_order_no' && !isEdit) {
      lookupProject(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isClosed) return;
    setError('');
    setSubmitting(true);
    try {
      await onSave({ ...form, amount: parseFloat(form.amount) });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Fund Report' : 'Create Fund Report'}
      subtitle={isEdit ? 'Edit Record' : 'New Record'}
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-955/20 border border-red-900/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4 text-left">
        {/* Work Order No. */}
        <div>
          {isEdit ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Work Order No. <span className="text-red-400">*</span>
              </label>
              <div className="glass-input rounded-xl px-4 py-3 text-sm font-mono font-semibold text-slate-500 opacity-60 cursor-not-allowed">
                {form.work_order_no}
                <span className="ml-2 text-[9px] font-sans uppercase tracking-wider text-slate-600">
                  (linked — immutable)
                </span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Input
                label="Work Order No."
                type="text"
                name="work_order_no"
                value={form.work_order_no}
                onChange={handleChange}
                placeholder="e.g. WB_APD_101"
                list="won-list"
                required
                disabled={submitting}
              />
              <datalist id="won-list">
                {projects.map((p) => (
                  <option key={p.work_order_no} value={p.work_order_no} />
                ))}
              </datalist>
              {lookupLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-amber-500" />
              )}
            </div>
          )}
        </div>

        {/* Project Preview / Mutability Warning */}
        {isClosed && <MutabilityWarning workOrderNo={form.work_order_no} />}
        {masterData && !isClosed && <ProjectPreview master={masterData} />}

        {/* Amount */}
        <Input
          label="Amount (₹)"
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          required
          disabled={submitting || isClosed}
          className={isClosed ? 'opacity-40 cursor-not-allowed' : ''}
        />

        {/* Remarks */}
        <Textarea
          label="Remarks"
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          placeholder="Optional notes or description…"
          rows={3}
          disabled={submitting || isClosed}
          className={isClosed ? 'opacity-40 cursor-not-allowed' : ''}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            onClick={onClose}
            disabled={submitting}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isClosed}
            isLoading={submitting}
          >
            {isEdit ? 'Save Changes' : 'Create Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onClose, danger = true }) => (
  <Modal isOpen={true} onClose={onClose} title={danger ? 'Confirm Delete' : 'Confirm Restore'} maxWidth="max-w-sm">
    <p className="text-xs text-slate-400 mb-6 font-medium text-left">{message}</p>
    <div className="flex gap-3 justify-end">
      <Button onClick={onClose} variant="ghost">
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant={danger ? 'danger' : 'primary'}
      >
        {danger ? 'Delete' : 'Restore'}
      </Button>
    </div>
  </Modal>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const FundReports = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [reports, setReports] = useState([]);
  const [deletedReports, setDeletedReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('active'); // 'active' | 'deleted'
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { type, report? }
  const [confirmModal, setConfirmModal] = useState(null); // { type, id, message }

  // ── Fetch ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rRes, pRes] = await Promise.all([getReports(), getProjects()]);
      setReports(rRes.data?.reports ?? []);
      setProjects(pRes.data?.projects ?? []);
      if (isAdmin) {
        const dRes = await getDeletedReports();
        setDeletedReports(dRes.data?.deleted_reports ?? []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch database records.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Operations ──
  const handleCreate = async (payload) => {
    try {
      await createReport(payload);
      setSuccess('Fund report created successfully.');
      fetchAll();
    } catch (err) {
      throw err; // Propagates to modal error handler
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const id = modal.report.fund_report_id;
      await updateReport(id, payload);
      setSuccess('Fund report updated successfully.');
      fetchAll();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal(null);
    try {
      await deleteReport(id);
      setSuccess('Report deleted (soft-delete).');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report.');
    }
  };

  const handleRestore = async (id) => {
    setConfirmModal(null);
    try {
      await restoreReport(id);
      setSuccess('Report restored successfully.');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore report.');
    }
  };

  // ── Filtered lists ──
  const activeFiltered = reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.work_order_no?.toLowerCase().includes(q) ||
      r.projects_master?.state?.toLowerCase().includes(q) ||
      r.projects_master?.district?.toLowerCase().includes(q) ||
      r.remarks?.toLowerCase().includes(q)
    );
  });

  const deletedFiltered = deletedReports.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.work_order_no?.toLowerCase().includes(q);
  });

  // ── Stat cards ──
  const totalAmount = reports.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const runningCount = reports.filter((r) => r.projects_master?.status === 'Running').length;
  const closedCount = reports.filter((r) => r.projects_master?.status === 'Closed').length;

  const activeColumns = [
    {
      key: 'work_order_no',
      header: 'Work Order',
      className: 'font-mono font-semibold text-slate-100 whitespace-nowrap'
    },
    {
      key: 'state_district',
      header: 'State / District',
      className: 'whitespace-nowrap',
      render: (_, r) => (
        <>
          <span className="font-semibold text-slate-200">{r.projects_master?.state}</span>
          {r.projects_master?.district && <span className="text-slate-500"> / {r.projects_master?.district}</span>}
        </>
      )
    },
    {
      key: 'department',
      header: 'Dept.',
      className: 'text-slate-400 whitespace-nowrap',
      render: (_, r) => r.projects_master?.department || '—'
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'font-mono font-bold text-emerald-400 whitespace-nowrap',
      render: (val) => formatCurrency(val)
    },
    {
      key: 'remarks',
      header: 'Remarks',
      className: 'max-w-[160px]',
      render: (val) => <span className="block truncate text-slate-400" title={val}>{val || '—'}</span>
    },
    {
      key: 'project_status',
      header: 'Project Status',
      className: 'whitespace-nowrap',
      render: (_, r) => <StatusBadge status={r.projects_master?.status} />
    },
    {
      key: 'created_at',
      header: 'Created',
      className: 'text-[11px] text-slate-500 whitespace-nowrap',
      render: (val) => formatDate(val)
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'whitespace-nowrap',
      render: (_, report) => {
        const closed = report.projects_master?.status === 'Closed';
        return (
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            {!closed && (
              <Button
                id={`btn-edit-report-${report.fund_report_id}`}
                onClick={() => setModal({ type: 'edit', report })}
                variant="secondary"
                size="sm"
                className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            )}
            {closed && (
              <span title="Immutable — project is Closed" className="p-1.5 rounded-lg bg-red-500/5 border border-red-500/15 text-red-500/50">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            )}
            {isAdmin && !closed && (
              <Button
                id={`btn-delete-report-${report.fund_report_id}`}
                onClick={() =>
                  setConfirmModal({
                    type: 'delete',
                    id: report.fund_report_id,
                    message: `Soft-delete report for ${report.work_order_no}? It can be restored later.`,
                  })
                }
                variant="secondary"
                size="sm"
                className="p-1.5 rounded-lg text-red-400 hover:text-red-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const deletedColumns = [
    { key: 'work_order_no', header: 'Work Order', className: 'font-mono font-semibold text-slate-300' },
    { key: 'amount', header: 'Amount', className: 'font-mono font-bold text-slate-400', render: (val) => formatCurrency(val) },
    { key: 'remarks', header: 'Remarks', className: 'max-w-[140px]', render: (val) => <span className="block truncate" title={val}>{val || '—'}</span> },
    { key: 'deleted_by', header: 'Deleted By', className: 'font-mono text-[11px]', render: (val) => val || '—' },
    { key: 'deleted_at', header: 'Deleted At', className: 'text-[11px]', render: (val) => formatDate(val) },
    {
      key: 'actions',
      header: 'Restore',
      render: (_, r) => (
        <Button
          id={`btn-restore-${r.fund_report_id}`}
          onClick={() =>
            setConfirmModal({
              type: 'restore',
              id: r.fund_report_id,
              message: `Restore this report for ${r.work_order_no}? It will appear in the active list again.`,
            })
          }
          variant="secondary"
          size="sm"
          className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
        >
          Restore
        </Button>
      )
    }
  ];

  return (
    <div className="h-screen bg-black text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      <BackgroundShapes />
      <Sidebar />
      <MobileHeader />

      <main className="flex-grow p-6 md:p-10 overflow-y-auto w-full relative z-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-6 border-b border-white/5">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-mono">
              Government Division · Finance
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mt-1">Fund Reports</h1>
            <p className="text-xs text-slate-400 font-medium mt-1.5">
              Manage disbursement records linked to project work orders. Auto-fills site data from Master Data.
            </p>
          </div>
          <Button
            id="btn-create-report"
            onClick={() => setModal({ type: 'create' })}
            variant="primary"
            className="flex items-center gap-2 shrink-0 transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Report
          </Button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Reports', value: reports.length, accent: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/20', mono: false },
            { label: 'Total Disbursed', value: formatCurrency(totalAmount), accent: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', small: true },
            { label: 'Running Projects', value: runningCount, accent: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/15' },
            { label: 'Closed Projects', value: closedCount, accent: 'from-red-500/20 to-red-500/5', border: 'border-red-500/20' },
          ].map(({ label, value, accent, border, small }) => (
            <Card key={label} className={`rounded-2xl p-5 border ${border} bg-gradient-to-br ${accent}`}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <p className={`font-black text-slate-100 mt-1.5 tabular-nums ${small ? 'text-xl' : 'text-3xl'}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* ── Notifications ── */}
        {error && (
          <div className="p-4 bg-red-955/20 border border-red-900/30 rounded-2xl text-xs text-red-300 mb-5 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-955/20 border border-emerald-900/30 rounded-2xl text-xs text-emerald-300 mb-5 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {success}
          </div>
        )}

        {/* ── Tabs + Search ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-1 glass-panel p-1 rounded-xl border border-white/5">
            {(['active', ...(isAdmin ? ['deleted'] : [])]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  tab === t
                    ? 'bg-white/10 text-slate-100 border border-white/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'active' ? `Active (${reports.length})` : `Deleted (${deletedReports.length})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-left">
            <Input
              id="search-reports"
              type="text"
              placeholder="Search reports…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              className="w-52 font-semibold"
              size="sm"
            />
            <Button
              onClick={fetchAll}
              title="Refresh"
              variant="secondary"
              size="sm"
              className="p-2.5 rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </div>

        {/* ── Active Reports Table ── */}
        {tab === 'active' && (
          <Table
            columns={activeColumns}
            data={activeFiltered}
            isLoading={loading}
            emptyMessage={search ? 'No matching reports.' : 'No active fund reports. Create one to get started.'}
            className="shadow-2xl"
          />
        )}

        {/* ── Deleted Reports Table (Admin) ── */}
        {tab === 'deleted' && isAdmin && (
          <Table
            columns={deletedColumns}
            data={deletedFiltered}
            isLoading={loading}
            emptyMessage="No deleted reports."
            className="shadow-2xl"
          />
        )}
      </main>

      {/* ── Report Form Modals ── */}
      {modal?.type === 'create' && (
        <ReportFormModal
          mode="create"
          initial={EMPTY_FORM}
          projects={projects}
          onClose={() => setModal(null)}
          onSave={handleCreate}
        />
      )}
      {modal?.type === 'edit' && (
        <ReportFormModal
          mode="edit"
          initial={{
            work_order_no: modal.report.work_order_no,
            amount: modal.report.amount,
            remarks: modal.report.remarks || '',
          }}
          projects={projects}
          onClose={() => setModal(null)}
          onSave={handleUpdate}
        />
      )}

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          danger={confirmModal.type === 'delete'}
          onClose={() => setConfirmModal(null)}
          onConfirm={() =>
            confirmModal.type === 'delete'
              ? handleDelete(confirmModal.id)
              : handleRestore(confirmModal.id)
          }
        />
      )}
    </div>
  );
};

export default FundReports;
