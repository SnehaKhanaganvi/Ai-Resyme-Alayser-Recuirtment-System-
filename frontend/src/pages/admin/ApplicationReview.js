import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api, getScoreClass, statusLabel } from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Forward, FileText, Brain, Download } from 'lucide-react';

export default function ApplicationReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    api.get(`/admin/applications/${id}`)
      .then(r => { setApp(r.data); setNotes(r.data.adminNotes || ''); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const decide = async (decision) => {
    setActing(true);
    try {
      const { data } = await api.patch(`/admin/applications/${id}/decision`, { decision, adminNotes: notes });
      setApp(data);
      toast.success(`Application ${decision}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActing(false); }
  };

  const forward = async () => {
    setActing(true);
    try {
      const { data } = await api.patch(`/admin/applications/${id}/forward`);
      setApp(data);
      toast.success('Forwarded to recruitment team');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActing(false); }
  };

  if (loading) return <><Navbar showBack /><div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}><p className="text-muted">Loading...</p></div></>;
  if (!app) return <><Navbar showBack /><div className="page"><p>Not found</p></div></>;

  return (
    <>
      <Navbar title="Review Application" showBack />
      <div className="page page-md" style={{ marginTop: '2rem' }}>
        {/* Header */}
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{app.candidate?.name}</h1>
              <p className="text-muted text-sm">{app.candidate?.email} • {app.candidate?.phone}</p>
            </div>
            <span className={`badge badge-${app.status}`}>{statusLabel(app.status)}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* Academic */}
          <div className="card">
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--accent)' }}>Academic Profile</p>
            {[['College', app.college], ['Department', app.department], ['Year', app.year], ['CGPA', app.cgpa]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm text-muted">{label}</span>
                <span className="text-sm" style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* AI Analysis */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} color="var(--purple)" />
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--purple)' }}>AI Analysis</p>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`score-circle ${getScoreClass(app.aiScore)}`}>{app.aiScore}</div>
              <div>
                <p className="text-sm text-muted">Fit Score: {app.aiFitPercent}%</p>
                <p style={{ fontWeight: 600, color: app.aiRecommendation === 'Hire' ? 'var(--green)' : app.aiRecommendation === 'Review' ? 'var(--amber)' : 'var(--red)' }}>
                  → {app.aiRecommendation}
                </p>
              </div>
            </div>
            {app.aiReport && <p className="text-sm text-muted" style={{ background: 'var(--bg3)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.5 }}>{app.aiReport}</p>}
          </div>
        </div>

        {/* Skills */}
        <div className="card mb-4">
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Skills</p>
          <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {app.skills?.map((s, i) => (
              <span key={i} className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Resume */}
        {app.resumeOriginalName && (
          <div className="card mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} color="var(--text2)" />
                <span className="text-sm">{app.resumeOriginalName}</span>
              </div>
              <a href={`http://localhost:5000${app.resumePath}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <Download size={14} /> Download Resume
              </a>
            </div>
          </div>
        )}

        {/* Admin Notes + Actions */}
        {['pending', 'shortlisted', 'rejected'].includes(app.status) && (
          <div className="card mb-4">
            <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Admin Notes</p>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Add notes about this candidate..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
            <div className="flex gap-3 mt-4">
              {app.status !== 'shortlisted' && (
                <button className="btn btn-success" onClick={() => decide('shortlisted')} disabled={acting}>
                  <CheckCircle size={16} /> Shortlist
                </button>
              )}
              {app.status !== 'rejected' && (
                <button className="btn btn-danger" onClick={() => decide('rejected')} disabled={acting}>
                  <XCircle size={16} /> Reject
                </button>
              )}
              {app.status === 'shortlisted' && (
                <button className="btn btn-amber" onClick={forward} disabled={acting}>
                  <Forward size={16} /> Forward to Recruitment
                </button>
              )}
            </div>
          </div>
        )}

        {app.status === 'forwarded' && (
          <div className="card" style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p style={{ color: 'var(--amber)', fontWeight: 600 }}>✓ Forwarded to Recruitment Team</p>
            <p className="text-sm text-muted mt-1">The recruitment team will conduct deep analysis and set interview decisions.</p>
          </div>
        )}
      </div>
    </>
  );
}
