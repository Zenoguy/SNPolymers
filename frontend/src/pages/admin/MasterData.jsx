import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BackgroundShapes from '../../components/BackgroundShapes';
import Sidebar, { MobileHeader } from '../../components/Sidebar';
import { getProjects, createProject, updateProject, updateProjectStatus } from '../../api/projectsApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['Running', 'Closed', 'Complete Under Maintenance'];

const formatCurrency = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
};

const EMPTY_FORM = {
  work_order_no: '',
  estimate_no: '',
  work_order_value: '',
  site_details: '',
  state: '',
  district: '',
  zone: '',
  department: '',
  status: 'Running',
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    Running: {
      dot: 'bg-emerald-400',
      pill: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
      label: 'Running',
    },
    Closed: {
      dot: 'bg-red-400',
      pill: 'bg-red-500/10 border-red-500/25 text-red-400',
      label: 'Closed',
    },
    'Complete Under Maintenance': {
      dot: 'bg-amber-400',
      pill: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
      label: 'Under Maintenance',
    },
  };
  const s = cfg[status] ?? cfg['Running'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${s.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {s.label}
    </span>
  );
};



// ─── Project Form Modal ───────────────────────────────────────────────────────
const ProjectFormModal = ({ mode, initial, onClose, onSave }) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: 'work_order_no', label: 'Work Order No.', placeholder: 'e.g. WB_APD_101', disabled: isEdit },
    { name: 'estimate_no', label: 'Estimate No.', placeholder: 'e.g. APD_1' },
    { name: 'work_order_value', label: 'Work Order Value', placeholder: 'e.g. 2500000', type: 'number', min: '0', step: '0.01' },
    { name: 'site_details', label: 'Site Details', placeholder: 'Site location / description' },
    { name: 'state', label: 'State', placeholder: 'e.g. West Bengal' },
    { name: 'district', label: 'District', placeholder: 'e.g. Bankura' },
    { name: 'zone', label: 'Zone', placeholder: 'e.g. North' },
    { name: 'department', label: 'Department', placeholder: 'e.g. PWD' },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'Create Project'}
      subtitle={isEdit ? 'Modify Record' : 'New Record'}
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-955/20 border border-red-900/30 rounded-xl text-xs text-red-300 flex items-center gap-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ name, label, placeholder, disabled, type, ...rest }) => (
            <div key={name} className={name === 'site_details' ? 'sm:col-span-2' : ''}>
              <Input
                label={label}
                type={type || 'text'}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled || submitting}
                required={name === 'work_order_no' || name === 'work_order_value'}
                {...rest}
              />
              {disabled && (
                <p className="text-[9px] text-slate-500 mt-1 font-mono">
                  ⊘ Immutable after creation
                </p>
              )}
            </div>
          ))}

          {/* Status – shown only on edit */}
          {isEdit && (
            <div className="sm:col-span-2">
              <Select
                label="Project Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={submitting}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-8">
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
            isLoading={submitting}
          >
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


// ─── Status Quick-Change Modal ────────────────────────────────────────────────
const StatusModal = ({ project, onClose, onSave }) => {
  const [status, setStatus] = useState(project.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSave(project.work_order_no, status);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Update Status"
      subtitle={project.work_order_no}
      maxWidth="max-w-sm"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-955/20 border border-red-900/30 rounded-xl text-xs text-red-300 flex items-center gap-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="text-left">
        <div className="space-y-2 mb-6">
          {STATUS_OPTIONS.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                status === s
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="accent-amber-500"
              />
              <StatusBadge status={s} />
            </label>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
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
            disabled={status === project.status}
            isLoading={submitting}
          >
            Apply Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MasterData = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit'|'status', project? }

  // ── Data fetching ──
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProjects();
      setProjects(res.data?.projects ?? []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Auto-dismiss success banner
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(t);
  }, [success]);

  // ── Handlers ──
  const handleCreate = async (form) => {
    await createProject(form);
    setSuccess(`Project ${form.work_order_no} created successfully.`);
    fetchProjects();
  };

  const handleEdit = async (form) => {
    const { work_order_no, status, ...editableFields } = form;
    // Send field edits first
    await updateProject(work_order_no, editableFields);
    // If status changed, also patch status
    if (status !== modal?.project?.status) {
      await updateProjectStatus(work_order_no, status);
    }
    setSuccess(`Project ${work_order_no} updated successfully.`);
    fetchProjects();
  };

  const handleStatusChange = async (workOrderNo, status) => {
    await updateProjectStatus(workOrderNo, status);
    setSuccess(`Status for ${workOrderNo} updated to "${status}".`);
    fetchProjects();
  };

  // ── Filtered list ──
  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.work_order_no?.toLowerCase().includes(q) ||
      p.estimate_no?.toLowerCase().includes(q) ||
      p.state?.toLowerCase().includes(q) ||
      p.district?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q)
    );
  });

  const counts = {
    total: projects.length,
    running: projects.filter((p) => p.status === 'Running').length,
    closed: projects.filter((p) => p.status === 'Closed').length,
    maintenance: projects.filter((p) => p.status === 'Complete Under Maintenance').length,
  };

  const columns = [
    {
      key: 'work_order_no',
      header: 'Work Order No.',
      className: 'font-mono font-semibold text-slate-100 whitespace-nowrap'
    },
    {
      key: 'estimate_no',
      header: 'Estimate No.',
      className: 'font-medium text-slate-300 whitespace-nowrap',
      render: (val) => val || <span className="text-slate-600 italic font-normal">—</span>
    },
    {
      key: 'work_order_value',
      header: 'Work Order Value',
      className: 'font-semibold text-amber-500 whitespace-nowrap',
      render: (val) => formatCurrency(val)
    },
    {
      key: 'site_details',
      header: 'Site Details',
      className: 'max-w-[180px] text-slate-400 truncate',
      render: (val) => (
        <span title={val}>
          {val || '—'}
        </span>
      )
    },
    {
      key: 'state_district',
      header: 'State / District',
      className: 'whitespace-nowrap',
      render: (_, project) => (
        <>
          <span className="font-semibold text-slate-200">{project.state}</span>
          {project.district && (
            <span className="text-slate-500 font-normal"> / {project.district}</span>
          )}
        </>
      )
    },
    {
      key: 'zone',
      header: 'Zone',
      className: 'text-slate-400 whitespace-nowrap',
      render: (val) => val || '—'
    },
    {
      key: 'department',
      header: 'Department',
      className: 'text-slate-400 whitespace-nowrap',
      render: (val) => val || '—'
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'whitespace-nowrap',
      render: (_, project) => (
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
          {/* Edit fields */}
          <Button
            id={`btn-edit-${project.work_order_no}`}
            onClick={() => setModal({ type: 'edit', project })}
            title="Edit project"
            variant="secondary"
            size="sm"
            className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          {/* Status change */}
          <Button
            id={`btn-status-${project.work_order_no}`}
            onClick={() => setModal({ type: 'status', project })}
            title="Update status"
            variant="secondary"
            size="sm"
            className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="h-screen bg-black text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      <BackgroundShapes />
      <Sidebar />
      <MobileHeader />

      <main className="flex-grow p-6 md:p-10 overflow-y-auto max-w-full mx-auto w-full relative z-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-6 border-b border-white/5">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-mono">
              Project Management Module
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mt-1">
              Master Data Sheet
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1.5">
              Manage all project records, status transitions, and field edits with a full audit trail.
            </p>
          </div>
          <Button
            id="btn-create-project"
            onClick={() => setModal({ type: 'create' })}
            variant="primary"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: counts.total, accent: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/20' },
            { label: 'Running', value: counts.running, accent: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
            { label: 'Closed', value: counts.closed, accent: 'from-red-500/20 to-red-500/5', border: 'border-red-500/20' },
            { label: 'Under Maintenance', value: counts.maintenance, accent: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20' },
          ].map(({ label, value, accent, border }) => (
            <Card
              key={label}
              className={`p-5 border ${border} bg-gradient-to-br ${accent} text-left`}
            >
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-3xl font-black text-slate-100 mt-1.5 tabular-nums">{value}</p>
            </Card>
          ))}
        </div>

        {/* ── Notifications ── */}
        {error && (
          <div className="p-4 bg-red-955/20 border border-red-900/30 rounded-2xl text-xs text-red-300 mb-6 flex items-center gap-2.5 text-left">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-955/20 border border-emerald-900/30 rounded-2xl text-xs text-emerald-300 mb-6 flex items-center gap-2.5 animate-pulse-once text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {success}
          </div>
        )}

        {/* ── Search ── */}
        <div className="flex items-center gap-3 mb-5 w-full">
          <div className="flex-1 max-w-sm">
            <Input
              id="search-projects"
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              size="sm"
            />
          </div>
          <Button
            onClick={fetchProjects}
            title="Refresh"
            variant="secondary"
            size="sm"
            className="p-2.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>

        {/* ── Table ── */}
        <Table
          columns={columns}
          data={filtered}
          isLoading={loading}
          emptyMessage={search ? 'No matching projects found.' : 'No projects found. Create one to get started.'}
          className="shadow-2xl"
        />
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01] text-[10px] text-slate-600 font-mono text-left">
            Showing {filtered.length} of {projects.length} records
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      {modal?.type === 'create' && (
        <ProjectFormModal
          mode="create"
          initial={EMPTY_FORM}
          onClose={() => setModal(null)}
          onSave={handleCreate}
        />
      )}
      {modal?.type === 'edit' && (
        <ProjectFormModal
          mode="edit"
          initial={{ ...modal.project }}
          onClose={() => setModal(null)}
          onSave={handleEdit}
        />
      )}
      {modal?.type === 'status' && (
        <StatusModal
          project={modal.project}
          onClose={() => setModal(null)}
          onSave={handleStatusChange}
        />
      )}
    </div>
  );
};

export default MasterData;
