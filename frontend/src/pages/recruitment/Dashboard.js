import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api, downloadCSV, statusLabel, getScoreClass } from '../../utils/api';
import toast from 'react-hot-toast';
import { Eye, Brain, Download, Users, CheckCircle, XCircle, Calendar } from 'lucide-react';

export default function RecruitmentDashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/recruitment/candidates').then(r => { setCandidates(r.data); setFiltered(r.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = candidates;
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (search) result = result.filter(a =>
      a.candidate?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.candidate?.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.college?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, statusFilter, candidates]);

  const stats = {
    total: candidates.length,
    forwarded: candidates.filter(a => a.status === 'forwarded').length,
    selected: candidates.filter(a => a.status === 'interview_selected').length,
    notSelected: candidates.filter(a => a.status === 'not_selected').length,
  };

  const handleDownload = async () => {
    try {
      const { data } = await api.get('/recruitment/interview-selected');
      downloadCSV(data, 'interview_selected_candidates.csv');
      toast.success(`Downloaded ${data.length} records`);
    } catch { toast.error('Download failed'); }
  };

  return (
    <>
      <Navbar title="Recruitment Portal" />
      <div className="page" style={{ marginTop: '2rem' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Forwarded Candidates</h1>
            <p className="text-muted text-sm mt-1">Review profiles and schedule interviews</p>
          </div>
          <button className="btn btn-success" onClick={handleDownload}>
            <Download size={16} /> Download Selected
          </button>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          {[
            { label: 'Total Forwarded', val: stats.total, color: 'var(--accent)', Icon: Users },
            { label: 'Pending Review', val: stats.forwarded, color: 'var(--amber)', Icon: Calendar },
            { label: 'Interview Selected', val: stats.selected, color: 'var(--green)', Icon: CheckCircle },
            { label: 'Not Selected', val: stats.notSelected, color: 'var(--red)', Icon: XCircle },
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
          <input className="form-input" style={{ maxWidth: 280 }} placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input" style={{ maxWidth: 200 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="forwarded">Pending Review</option>
            <option value="interview_selected">Interview Selected</option>
            <option value="not_selected">Not Selected</option>
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
                  <th>Deep Analysis</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>No candidates found</td></tr>
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
                      <span className={`score-circle ${getScoreClass(app.aiScore)}`} style={{ width: 40, height: 40, fontSize: '0.8rem' }}>
                        {app.aiScore}
                      </span>
                    </td>
                    <td>
                      {app.deepAnalysis?.rank ? (
                        <span className="badge" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}>Rank #{app.deepAnalysis.rank}</span>
                      ) : <span className="text-sm text-muted">Not run</span>}
                    </td>
                    <td><span className={`badge badge-${app.status}`}>{statusLabel(app.status)}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/recruitment/candidate/${app._id}`)}>
                        <Eye size={14} /> View
                      </button>
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
