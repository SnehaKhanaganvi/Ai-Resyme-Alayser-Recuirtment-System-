import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api, getScoreClass, statusLabel } from '../../utils/api';
import toast from 'react-hot-toast';
import { Brain, CheckCircle, XCircle, FileText, Download, Zap } from 'lucide-react';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [acting, setActing] = useState(false);
  const [interview, setInterview] = useState({ date: '', time: '', venue: '' });

  useEffect(() => {
    api.get(`/recruitment/candidates/${id}`)
      .then(r => setApp(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const runDeepAnalysis = async () => {
    setAnalysing(true);
    try {
      const { data } = await api.post(`/recruitment/candidates/${id}/deep-analyse`);
      setApp(data);
      toast.success('Deep AI analysis complete!');
    } catch { toast.error('Analysis failed'); }
    finally { setAnalysing(false); }
  };

  const decide = async (decision) => {
    if (decision === 'interview_selected' && (!interview.date || !interview.time || !interview.venue)) {
      return toast.error('Please fill in interview date, time, and venue');
    }
    setActing(true);
    try {
      const { data } = await api.patch(`/recruitment/candidates/${id}/interview`, {
        decision, interviewDate: interview.date, interviewTime: interview.time, interviewVenue: interview.venue
      });
      setApp(data);
      toast.success(decision === 'interview_selected' ? 'Interview scheduled!' : 'Marked as not selected');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActing(false); }
  };

  if (loading) return <><Navbar showBack /><div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}><p className="text-muted">Loading...</p></div></>;
  if (!app) return <><Navbar showBack /><div className="page"><p>Not found</p></div></>;

  return (
    <>
      <Navbar title="Candidate Detail" showBack />
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

          {/* AI Score */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} color="var(--purple)" />
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--purple)' }}>AI Score</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`score-circle ${getScoreClass(app.aiScore)}`}>{app.aiScore}</div>
              <div>
                <p className="text-sm text-muted">Fit: {app.aiFitPercent}%</p>
                <p style={{ fontWeight: 600, color: app.aiRecommendation === 'Hire' ? 'var(--green)' : app.aiRecommendation === 'Review' ? 'var(--amber)' : 'var(--red)' }}>→ {app.aiRecommendation}</p>
              </div>
            </div>
            {app.aiReport && <p className="text-sm text-muted mt-3" style={{ background: 'var(--bg3)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>{app.aiReport}</p>}
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

        {/* Deep Analysis */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} color="var(--amber)" />
              <p style={{ fontWeight: 600, color: 'var(--amber)' }}>Deep AI Analysis</p>
            </div>
            {app.status === 'forwarded' && (
              <button className="btn btn-amber btn-sm" onClick={runDeepAnalysis} disabled={analysing}>
                <Brain size={14} /> {analysing ? 'Analysing...' : 'Run Deep Analysis'}
              </button>
            )}
          </div>
          {app.deepAnalysis?.skillsMatch ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ background: 'var(--bg3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <p className="text-sm text-muted mb-1">Skills Match</p>
                <p className="text-sm">{app.deepAnalysis.skillsMatch}</p>
              </div>
              <div style={{ background: 'var(--bg3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <p className="text-sm text-muted mb-1">Gap Report</p>
                <p className="text-sm">{app.deepAnalysis.gapReport}</p>
              </div>
              <div style={{ background: 'var(--purple-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p className="text-sm" style={{ color: 'var(--purple)', fontWeight: 600 }}>Rank Score: {app.deepAnalysis.rank}/10</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Run deep analysis to see skills match, gap report and ranking.</p>
          )}
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
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        )}

        {/* Interview Decision */}
        {app.status === 'forwarded' && (
          <div className="card mb-4">
            <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Set Interview Decision</p>
            <div className="form-grid mb-4">
              <div className="form-group">
                <label className="form-label">Interview Date</label>
                <input className="form-input" type="date" value={interview.date} onChange={e => setInterview(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Interview Time</label>
                <input className="form-input" type="time" value={interview.time} onChange={e => setInterview(p => ({ ...p, time: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Venue</label>
                <input className="form-input" value={interview.venue} onChange={e => setInterview(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Room 201, Main Building" />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-success" onClick={() => decide('interview_selected')} disabled={acting}>
                <CheckCircle size={16} /> Select for Interview
              </button>
              <button className="btn btn-danger" onClick={() => decide('not_selected')} disabled={acting}>
                <XCircle size={16} /> Not Selected
              </button>
            </div>
          </div>
        )}

        {/* Interview details if selected */}
        {app.status === 'interview_selected' && (
          <div className="card" style={{ background: 'var(--purple-bg)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p style={{ color: 'var(--purple)', fontWeight: 600, marginBottom: '0.75rem' }}>✓ Interview Scheduled</p>
            <div className="form-grid">
              <div><p className="text-sm text-muted">Date</p><p style={{ fontWeight: 500 }}>{app.interviewDate}</p></div>
              <div><p className="text-sm text-muted">Time</p><p style={{ fontWeight: 500 }}>{app.interviewTime}</p></div>
              <div><p className="text-sm text-muted">Venue</p><p style={{ fontWeight: 500 }}>{app.interviewVenue}</p></div>
            </div>
          </div>
        )}

        {app.status === 'not_selected' && (
          <div className="card" style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ color: 'var(--red)', fontWeight: 600 }}>✗ Not Selected</p>
            <p className="text-sm text-muted mt-1">This candidate was not selected for an interview.</p>
          </div>
        )}
      </div>
    </>
  );
}
