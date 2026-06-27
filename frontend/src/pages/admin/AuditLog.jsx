import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import BackgroundShapes from '../../components/BackgroundShapes';
import Sidebar, { MobileHeader } from '../../components/Sidebar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString();
};

const AuditLog = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userIdFilter, setUserIdFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    fetchLogs();
    fetchUsersList();
  }, []);

  const fetchUsersList = async () => {
    try {
      const response = await authApi.get('/admin/users');
      if (response.data?.success) {
        setUsersList(response.data.users);
      }
    } catch (err) {
      console.error('Failed to retrieve user filter dropdown data:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (userIdFilter) params.userId = userIdFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await authApi.get('/admin/sessions', { params });
      if (response.data?.success) {
        setSessions(response.data.sessions);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch session audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleResetFilters = () => {
    setUserIdFilter('');
    setDateFrom('');
    setDateTo('');
    setTimeout(() => {
      fetchLogs();
    }, 50);
  };

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return 'Active Operator';
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const columns = [
    {
      key: 'operator',
      header: 'Operator',
      className: 'font-bold text-slate-100',
      render: (_, session) => session.authorised_users?.display_name || <span className="text-slate-500 italic font-normal font-sans">No Display Name</span>
    },
    {
      key: 'verification_token',
      header: 'Verification Token',
      className: 'font-mono text-slate-200 font-semibold',
      render: (_, session) => session.authorised_users?.mobile_number || 'Revoked User'
    },
    {
      key: 'login_at',
      header: 'Verification Login Time',
      className: 'text-[11px] text-slate-300 font-normal',
      render: (val) => formatDate(val)
    },
    {
      key: 'logout_at',
      header: 'Session Expiry/Logout',
      className: 'text-[11px] text-slate-300 font-normal',
      render: (val, session) => session.is_active ? (
        <span className="text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg text-[9px] uppercase tracking-widest">Active session</span>
      ) : (
        formatDate(val)
      )
    },
    {
      key: 'duration_seconds',
      header: 'Elapsed Duration',
      className: 'font-mono text-[11px] text-slate-200 font-semibold',
      render: (val) => formatDuration(val)
    },
    {
      key: 'network_location',
      header: 'Network Location & Environment',
      className: 'text-[11px] text-slate-300 font-normal',
      render: (_, session) => (
        <>
          <div className="font-mono text-slate-200">{session.ip_address || 'Unknown'}</div>
          <div className="truncate max-w-[200px] text-slate-400" title={session.user_agent}>{session.user_agent || 'Unknown'}</div>
        </>
      )
    }
  ];

  return (
    <div className="h-screen bg-black text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Background Silhouettes & Ambient Glows */}
      <BackgroundShapes />

      <Sidebar />
      <MobileHeader />

      {/* Main Grid Panel */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-10 pb-6 border-b border-white/5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-mono">Console Verification Ledger</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mt-1">Session Audit & Integrity Trails</h1>
          <p className="text-xs text-slate-400 font-medium mt-1.5">Review active system authorizations, login times, IP entries, and total elapsed duration.</p>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-5 mb-8 text-left">
          <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <Select
              label="Filter By Operator"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              size="sm"
            >
              <option value="">All Whitelisted Operators</option>
              {usersList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name ? `${user.display_name} (${user.mobile_number})` : user.mobile_number}
                </option>
              ))}
            </Select>

            <Input
              label="Query From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              size="sm"
            />

            <Input
              label="Query To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              size="sm"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleResetFilters}
                variant="secondary"
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Filter Ledger
              </Button>
            </div>
          </form>
        </Card>

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl text-xs text-red-300 mb-6 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            {error}
          </div>
        )}

        <Table
          columns={columns}
          data={sessions}
          isLoading={loading}
          emptyMessage="No session records match requested query specifications."
          className="shadow-2xl"
        />
      </main>
    </div>
  );
};

export default AuditLog;
