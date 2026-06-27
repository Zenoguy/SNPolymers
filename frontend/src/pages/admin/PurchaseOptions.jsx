import React, { useState, useEffect } from 'react';
import authApi from '../../api/authApi';
import BackgroundShapes from '../../components/BackgroundShapes';
import Sidebar, { MobileHeader } from '../../components/Sidebar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString();
};

const PurchaseOptions = () => {
  const [purchaseOptions, setPurchaseOptions] = useState([]);
  const [loadingPurchase, setLoadingPurchase] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add modal state
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [newPurchaseName, setNewPurchaseName] = useState('');
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);

  // Edit modal state
  const [showEditPurchaseModal, setShowEditPurchaseModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editPurchaseName, setEditPurchaseName] = useState('');
  const [editPurchaseSubmitting, setEditPurchaseSubmitting] = useState(false);

  useEffect(() => {
    fetchPurchaseOptions();
  }, []);

  const fetchPurchaseOptions = async () => {
    setLoadingPurchase(true);
    setError('');
    try {
      const response = await authApi.get('/purchase-data');
      if (response.data?.success) {
        setPurchaseOptions(response.data.options);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch purchase options.');
    } finally {
      setLoadingPurchase(false);
    }
  };

  const handleAddPurchaseOption = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newPurchaseName.trim()) {
      setError('Option name cannot be blank.');
      return;
    }
    setPurchaseSubmitting(true);
    try {
      const response = await authApi.post('/purchase-data', {
        name: newPurchaseName.trim()
      });
      if (response.data?.success) {
        setSuccess('Purchase option created successfully.');
        setShowAddPurchaseModal(false);
        setNewPurchaseName('');
        fetchPurchaseOptions();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create purchase option.');
    } finally {
      setPurchaseSubmitting(false);
    }
  };

  const openEditPurchaseModal = (option) => {
    setEditingPurchase(option);
    setEditPurchaseName(option.name || '');
    setError('');
    setSuccess('');
    setShowEditPurchaseModal(true);
  };

  const handleEditPurchaseOption = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editPurchaseName.trim()) {
      setError('Option name cannot be blank.');
      return;
    }
    setEditPurchaseSubmitting(true);
    try {
      const response = await authApi.put(`/purchase-data/${editingPurchase.id}`, {
        name: editPurchaseName.trim()
      });
      if (response.data?.success) {
        setSuccess('Purchase option updated successfully.');
        setShowEditPurchaseModal(false);
        setEditingPurchase(null);
        fetchPurchaseOptions();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update purchase option.');
    } finally {
      setEditPurchaseSubmitting(false);
    }
  };

  const togglePurchaseOption = async (option) => {
    setError('');
    setSuccess('');
    try {
      const response = await authApi.patch(`/purchase-data/${option.id}/status`, {
        is_active: !option.is_active
      });
      if (response.data?.success) {
        setSuccess(`Purchase option status updated to ${!option.is_active ? 'Active' : 'Inactive'}.`);
        fetchPurchaseOptions();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Option Name',
      className: 'font-bold text-slate-100'
    },
    {
      key: 'created_by',
      header: 'Created By',
      className: 'font-mono text-slate-400',
      render: (val) => val || 'System'
    },
    {
      key: 'created_at',
      header: 'Created At',
      className: 'text-slate-400',
      render: (val) => formatDate(val)
    },
    {
      key: 'is_active',
      header: 'Status',
      align: 'center',
      render: (val, option) => (
        <Button
          onClick={() => togglePurchaseOption(option)}
          variant={val ? 'success' : 'danger'}
          size="sm"
          className="text-[10px]"
        >
          {val ? 'Active' : 'Inactive'}
        </Button>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, option) => (
        <Button
          onClick={() => openEditPurchaseModal(option)}
          variant="secondary"
          size="sm"
          className="text-[10px]"
        >
          Edit
        </Button>
      )
    }
  ];

  return (
    <div className="h-screen bg-black text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Background Silhouettes & Ambient Glows */}
      <BackgroundShapes />

      <Sidebar />
      <MobileHeader />

      {/* Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full relative z-10 font-sans">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-6 border-b border-white/5">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-mono">Console System Policies</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mt-1">
              Material Purchase Options
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1.5">
              Configure material purchase sources available in Phase 2 estimate item selections.
            </p>
          </div>
          <Button
            onClick={() => setShowAddPurchaseModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Purchase Option
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl text-xs text-red-300 mb-6 flex items-center gap-2.5 animate-headShake">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-xs text-emerald-300 mb-6 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {success}
          </div>
        )}

        <Table
          columns={columns}
          data={purchaseOptions}
          isLoading={loadingPurchase}
          emptyMessage="No purchase options discovered. Click button above to initialize."
          className="shadow-2xl"
        />

        {/* ── ADD PURCHASE DATA OPTION MODAL ── */}
        <Modal
          isOpen={showAddPurchaseModal}
          onClose={() => setShowAddPurchaseModal(false)}
          title="Add Purchase Option"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddPurchaseOption} className="space-y-5 text-left">
            <Input
              label="Option Name"
              type="text"
              placeholder="e.g. Local Market"
              value={newPurchaseName}
              onChange={(e) => setNewPurchaseName(e.target.value)}
              required
              disabled={purchaseSubmitting}
            />

            <div className="flex gap-3 justify-end mt-8">
              <Button
                type="button"
                onClick={() => setShowAddPurchaseModal(false)}
                disabled={purchaseSubmitting}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={purchaseSubmitting}
              >
                Add Option
              </Button>
            </div>
          </form>
        </Modal>

        {/* ── EDIT PURCHASE DATA OPTION MODAL ── */}
        <Modal
          isOpen={showEditPurchaseModal && !!editingPurchase}
          onClose={() => { setShowEditPurchaseModal(false); setEditingPurchase(null); }}
          title="Edit Purchase Option"
          maxWidth="max-w-md"
        >
          {editingPurchase && (
            <form onSubmit={handleEditPurchaseOption} className="space-y-5 text-left">
              <Input
                label="Option Name"
                type="text"
                placeholder="e.g. Local Market"
                value={editPurchaseName}
                onChange={(e) => setEditPurchaseName(e.target.value)}
                required
                disabled={editPurchaseSubmitting}
              />

              <div className="flex gap-3 justify-end mt-8">
                <Button
                  type="button"
                  onClick={() => { setShowEditPurchaseModal(false); setEditingPurchase(null); }}
                  disabled={editPurchaseSubmitting}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={editPurchaseSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default PurchaseOptions;
