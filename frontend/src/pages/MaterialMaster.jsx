import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import BackgroundShapes from '../components/BackgroundShapes';
import Sidebar, { MobileHeader } from '../components/Sidebar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMaterials,
  getMaterialCategories,
  createMaterial,
  updateMaterial,
  updateMaterialStatus
} from '../api/materialsApi';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';

const MaterialMaster = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();

  // Core Messaging & Modal / Form States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering & Pagination States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mainHeadFilter, setMainHeadFilter] = useState('');
  const [subHeadFilter, setSubHeadFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState(isAdmin ? 'true' : ''); // Admins see active by default, non-admins only see active (forced by backend)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('Material_Details');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentMaterialId, setCurrentMaterialId] = useState(null);
  
  const [formData, setFormData] = useState({
    Material_Main_Head: '',
    Material_Sub_Head: '',
    Material_Details: '',
    M_Unit: '',
    is_active: true
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, mainHeadFilter, subHeadFilter, activeFilter]);

  // Fetch unique categories for filtering dropdowns using React Query
  const { data: categoriesData } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: async () => {
      const res = await getMaterialCategories();
      return res.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 60 minutes
  });

  const categories = {
    mainHeads: Array.from(new Set(categoriesData?.mainHeads || [])),
    subHeads: Array.from(new Set(categoriesData?.subHeads || []))
  };

  // Fetch main material records using React Query
  const {
    data: materialsData,
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: [
      'materials',
      {
        page,
        limit,
        search: debouncedSearch,
        main_head: mainHeadFilter,
        sub_head: subHeadFilter,
        is_active: activeFilter,
        sortBy,
        sortOrder
      }
    ],
    queryFn: async () => {
      const params = {
        page,
        limit,
        search: debouncedSearch,
        main_head: mainHeadFilter,
        sub_head: subHeadFilter,
        is_active: activeFilter,
        sortBy,
        sortOrder
      };
      const res = await getMaterials(params);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  const materials = materialsData?.materials || [];
  const totalItems = materialsData?.pagination?.totalItems || 0;
  const totalPages = materialsData?.pagination?.totalPages || 1;

  // Sync query error with error state
  useEffect(() => {
    if (queryError) {
      setErrorMsg('Failed to load Material Master items. Please try again.');
    } else {
      setErrorMsg('');
    }
  }, [queryError]);

  // Prefetch the next page of results
  useEffect(() => {
    if (page < totalPages) {
      const nextPage = page + 1;
      queryClient.prefetchQuery({
        queryKey: [
          'materials',
          {
            page: nextPage,
            limit,
            search: debouncedSearch,
            main_head: mainHeadFilter,
            sub_head: subHeadFilter,
            is_active: activeFilter,
            sortBy,
            sortOrder
          }
        ],
        queryFn: async () => {
          const params = {
            page: nextPage,
            limit,
            search: debouncedSearch,
            main_head: mainHeadFilter,
            sub_head: subHeadFilter,
            is_active: activeFilter,
            sortBy,
            sortOrder
          };
          const res = await getMaterials(params);
          return res.data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      });
    }
  }, [page, totalPages, limit, debouncedSearch, mainHeadFilter, subHeadFilter, activeFilter, sortBy, sortOrder, queryClient]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setDebouncedSearch(search);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setMainHeadFilter('');
    setSubHeadFilter('');
    setActiveFilter(isAdmin ? 'true' : '');
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Form handlers
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      Material_Main_Head: '',
      Material_Sub_Head: '',
      Material_Details: '',
      M_Unit: '',
      is_active: true
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (material) => {
    setModalMode('edit');
    setCurrentMaterialId(material.id);
    setFormData({
      Material_Main_Head: material.Material_Main_Head,
      Material_Sub_Head: material.Material_Sub_Head,
      Material_Details: material.Material_Details,
      M_Unit: material.M_Unit,
      is_active: material.is_active
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.Material_Main_Head || !formData.Material_Sub_Head || !formData.Material_Details || !formData.M_Unit) {
      setErrorMsg('Please populate all fields correctly.');
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await createMaterial(formData);
        if (res.data?.success) {
          setSuccessMsg('Material created successfully!');
          setTimeout(() => setIsModalOpen(false), 1200);
          queryClient.invalidateQueries({ queryKey: ['materials'] });
          queryClient.invalidateQueries({ queryKey: ['materialCategories'] });
        }
      } else {
        const res = await updateMaterial(currentMaterialId, formData);
        if (res.data?.success) {
          setSuccessMsg('Material updated successfully!');
          setTimeout(() => setIsModalOpen(false), 1200);
          queryClient.invalidateQueries({ queryKey: ['materials'] });
          queryClient.invalidateQueries({ queryKey: ['materialCategories'] });
        }
      }
    } catch (err) {
      console.error('Failed to save material:', err);
      setErrorMsg(err.response?.data?.message || 'Server error occurred while saving.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const targetStatus = !currentStatus;
      const res = await updateMaterialStatus(id, targetStatus);
      if (res.data?.success) {
        setSuccessMsg(`Material status updated to ${targetStatus ? 'Active' : 'Inactive'}.`);
        queryClient.invalidateQueries({ queryKey: ['materials'] });
        queryClient.invalidateQueries({ queryKey: ['materialCategories'] });
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle material status:', err);
      setErrorMsg('Failed to change status. Please check your admin privileges.');
    }
  };

  const columns = [
    {
      key: 'Material_Main_Head',
      header: (
        <span
          onClick={() => handleSort('Material_Main_Head')}
          className="cursor-pointer hover:text-slate-200 transition-colors"
        >
          Main Head {sortBy === 'Material_Main_Head' && (sortOrder === 'asc' ? '▲' : '▼')}
        </span>
      ),
      className: 'font-semibold text-slate-200 max-w-[180px] truncate'
    },
    {
      key: 'Material_Sub_Head',
      header: (
        <span
          onClick={() => handleSort('Material_Sub_Head')}
          className="cursor-pointer hover:text-slate-200 transition-colors"
        >
          Sub Head {sortBy === 'Material_Sub_Head' && (sortOrder === 'asc' ? '▲' : '▼')}
        </span>
      ),
      className: 'text-slate-300 max-w-[180px] truncate'
    },
    {
      key: 'Material_Details',
      header: (
        <span
          onClick={() => handleSort('Material_Details')}
          className="cursor-pointer hover:text-slate-200 transition-colors"
        >
          Material Description {sortBy === 'Material_Details' && (sortOrder === 'asc' ? '▲' : '▼')}
        </span>
      ),
      className: 'text-slate-100 font-medium max-w-sm whitespace-pre-wrap'
    },
    {
      key: 'M_Unit',
      header: 'Unit',
      className: 'font-mono text-slate-400'
    },
    ...(isAdmin ? [
      {
        key: 'is_active',
        header: 'Status',
        align: 'center',
        render: (val, material) => (
          <Button
            onClick={() => handleToggleStatus(material.id, val)}
            variant={val ? 'success' : 'danger'}
            size="sm"
            className="text-[9px] py-1 px-2.5"
          >
            {val ? 'Active' : 'Inactive'}
          </Button>
        )
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (_, material) => (
          <Button
            onClick={() => openEditModal(material)}
            variant="secondary"
            size="sm"
            className="text-[9px] py-1.5 px-2.5"
          >
            Edit
          </Button>
        )
      }
    ] : [])
  ];

  return (
    <div className="h-screen bg-black text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      <BackgroundShapes />
      <Sidebar />
      <MobileHeader />

      <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
        
        {/* Module Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Inventory Registry</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mt-1">Material Master</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Centralised catalog of construction resources, aggregates, components, and tools.</p>
          </div>
          {isAdmin && (
            <Button
              onClick={openCreateModal}
              variant="primary"
            >
              + Create Material
            </Button>
          )}
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl animate-fade-in">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Search and Filters Bar */}
        <Card className="p-4 mb-6 space-y-4 text-left">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Search by Main Head, Sub Head or Material Details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={
                  search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )
                }
                size="sm"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
            >
              Search
            </Button>
          </form>

          {/* Filtering Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <Select
              label="Main Head"
              value={mainHeadFilter}
              onChange={(e) => { setMainHeadFilter(e.target.value); setPage(1); }}
              size="sm"
            >
              <option value="">All Categories</option>
              {categories.mainHeads.map((mh) => (
                <option key={mh} value={mh}>{mh}</option>
              ))}
            </Select>

            <Select
              label="Sub Head"
              value={subHeadFilter}
              onChange={(e) => { setSubHeadFilter(e.target.value); setPage(1); }}
              size="sm"
            >
              <option value="">All Sub categories</option>
              {categories.subHeads.map((sh) => (
                <option key={sh} value={sh}>{sh}</option>
              ))}
            </Select>

            {isAdmin ? (
              <Select
                label="Operational Status"
                value={activeFilter}
                onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
                size="sm"
              >
                <option value="">All Statuses</option>
                <option value="true">Active Materials Only</option>
                <option value="false">Inactive Materials Only</option>
              </Select>
            ) : (
              <div className="hidden md:block" />
            )}

            <div className="flex items-end">
              <Button
                onClick={handleClearFilters}
                variant="secondary"
                className="w-full border-dashed"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        </Card>

        <Table
          columns={columns}
          data={materials}
          isLoading={loading}
          emptyMessage="No materials found matching criteria."
          className="mb-6 shadow-2xl"
          pagination={{
            page,
            totalPages,
            total: totalItems,
            onPageChange: (newPage) => setPage(newPage)
          }}
        />
      </main>

      {/* Create / Edit Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Catalog Entry' : 'Modify Catalog Entry'}
        subtitle={modalMode === 'create' ? 'Create Material Record' : 'Edit Material Record'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          <Input
            label="Main Head (Category)"
            type="text"
            name="Material_Main_Head"
            value={formData.Material_Main_Head}
            onChange={handleFormChange}
            placeholder="e.g. Raw Materials"
            required
          />

          <Input
            label="Sub Head (Sub category)"
            type="text"
            name="Material_Sub_Head"
            value={formData.Material_Sub_Head}
            onChange={handleFormChange}
            placeholder="e.g. Cement (OPC/PPC)"
            required
          />

          <Textarea
            label="Material Description / Details"
            name="Material_Details"
            value={formData.Material_Details}
            onChange={handleFormChange}
            placeholder="Enter detailed description of the material size, grade, brand info..."
            rows="3"
            required
          />

          <Input
            label="Unit of Measurement"
            type="text"
            name="M_Unit"
            value={formData.M_Unit}
            onChange={handleFormChange}
            placeholder="e.g. Bag, Cum / CFT, Kg"
            required
          />

          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleFormChange}
              className="h-4 w-4 bg-white/5 border border-white/10 rounded focus:ring-0 accent-amber-500"
            />
            <label htmlFor="is_active" className="text-xs text-slate-300 font-bold cursor-pointer select-none">
              Available for Operations (Active status)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              {modalMode === 'create' ? 'Create Record' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialMaster;
