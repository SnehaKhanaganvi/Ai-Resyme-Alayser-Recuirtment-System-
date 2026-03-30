import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api, downloadCSV, statusLabel, getScoreClass } from '../../utils/api';
import toast from 'react-hot-toast';
import { Briefcase, Users, CheckCircle, XCircle, Clock, Download, Eye, UserPlus, Forward } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/applications').then(r => { setApps(r.data); setFiltered(r.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = apps;
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (search) result = result.filter(a =>
      a.candidate?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.candidate?.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.college?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, statusFilter, apps]);

  const stats = {
    total: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    shortlisted: apps.filter(a => ['shortlisted', 'forwarded', 'interview_selected'].includes(a.status)).length,
    rejected: apps.filter(a => ['rejected', 'not_selected'].includes(a.status)).length,
  };

  const handleDownload = async () => {
    try {
      const { data } = await api.get('/admin/shortlisted');
      downloadCSV(data, 'shortlisted_candidates.csv');
      toast.success(`Downloaded ${data.length} records`);
    } catch { toast.error('Download failed'); }
  };

  return (
    <>
      <Navbar title="Admin Dashboard" />
      <div className="page" style={{ marginTop: '2rem' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Applications</h1>
            <p className="text-muted text-sm mt-1">Review and manage all candidate applications</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={() => navigate('/admin/add-job')}>
              <Briefcase size={16} /> New Job
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/admin/team')}>
              <UserPlus size={16} /> Manage Team
            </button>
            <button className="btn btn-success" onClick={handleDownload}>
              <Download size={16} /> Download Shortlisted
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          {[
            { label: 'Total', val: stats.total, color: 'var(--accent)', Icon: Users },
            { label: 'Pending', val: stats.pending, color: 'var(--amber)', Icon: Clock },
            { label: 'Shortlisted', val: stats.shortlisted, color: 'var(--green)', Icon: CheckCircle },
            { label: 'Rejected', val: stats.rejected, color: 'var(--red)', Icon: XCircle },
          ].map(({ label, val, color, Icon }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">{label}</span>
                <Icon size={16} color={color} />
              </div>
              <div className="stat-val" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
          <input className="form-input" style={{ maxWidth: 280 }} placeholder="Search name, email, college..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input" style={{ maxWidth: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            {['pending', 'shortlisted', 'rejected', 'forwarded', 'interview_selected', 'not_selected'].map(s => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>College / Dept</th>
                  <th>CGPA</th>
                  <th>AI Score</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>No applications found</td></tr>
                ) : filtered.map(app => (
                  <tr key={app._id}>
                    <td>
                      <p style={{ fontWeight: 500 }}>{app.candidate?.name}</p>
                      <p className="text-sm text-muted">{app.candidate?.email}</p>
                    </td>
                    <td>
                      <p>{app.college}</p>
                      <p className="text-sm text-muted">{app.department}</p>
                    </td>
                    <td style={{ fontWeight: 500 }}>{app.cgpa}</td>
                    <td>
                      {app.aiScore !== null ? (
                        <span className={`score-circle ${getScoreClass(app.aiScore)}`} style={{ width: 40, height: 40, fontSize: '0.8rem' }}>
                          {app.aiScore}
                        </span>
                      ) : '—'}
                    </td>
                    <td><span className={`badge badge-${app.status}`}>{statusLabel(app.status)}</span></td>
                    <td className="text-sm text-muted">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/application/${app._id}`)}>
                          <Eye size={14} /> Review
                        </button>
                        {app.status === 'shortlisted' && (
                          <button className="btn btn-amber btn-sm" onClick={async () => {
                            try { await api.patch(`/admin/applications/${app._id}/forward`); setApps(prev => prev.map(a => a._id === app._id ? { ...a, status: 'forwarded' } : a)); toast.success('Forwarded to recruitment'); }
                            catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
                          }}>
                            <Forward size={14} /> Forward
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
