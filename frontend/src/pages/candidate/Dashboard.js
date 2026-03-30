import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { api, getScoreClass, statusLabel } from '../../utils/api';
import toast from 'react-hot-toast';
import { FileText, CheckCircle, Clock, XCircle, Calendar, AlertCircle } from 'lucide-react';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/candidate/my-application')
      .then(r => setApplication(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const StatusIcon = ({ status }) => {
    if (status === 'shortlisted' || status === 'interview_selected' || status === 'forwarded') return <CheckCircle size={18} color="var(--green)" />;
    if (status === 'rejected' || status === 'not_selected') return <XCircle size={18} color="var(--red)" />;
    return <Clock size={18} color="var(--amber)" />;
  };

  return (
    <>
      <Navbar title="Candidate Portal" />
      <div className="page page-md" style={{ marginTop: '2rem' }}>
        <div className="mb-6">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome, {user?.name} 👋</h1>
          <p className="text-muted text-sm mt-2">Track your application status below</p>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-muted">Loading...</p>
          </div>
        ) : !application ? (
          <div className="card card-lg" style={{ textAlign: 'center' }}>
            <FileText size={48} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>No Application Yet</h2>
            <p className="text-muted text-sm mb-6">Submit your application to get started. Our AI will analyse your profile instantly.</p>
            <button className="btn btn-primary" onClick={() => navigate('/candidate/apply')}>
              Start Application
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Status Card */}
            <div className="card" style={{ borderLeft: `3px solid ${
              application.status === 'interview_selected' ? 'var(--purple)' :
              application.status === 'shortlisted' || application.status === 'forwarded' ? 'var(--green)' :
              application.status === 'rejected' || application.status === 'not_selected' ? 'var(--red)' : 'var(--amber)'
            }` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status={application.status} />
                  <div>
                    <p className="text-sm text-muted">Application Status</p>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{statusLabel(application.status)}</p>
                  </div>
                </div>
                <span className={`badge badge-${application.status}`}>{statusLabel(application.status)}</span>
              </div>
            </div>

            {/* Interview Details */}
            {application.status === 'interview_selected' && (
              <div className="card" style={{ background: 'var(--purple-bg)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} color="var(--purple)" />
                  <span style={{ fontWeight: 600, color: 'var(--purple)' }}>Interview Scheduled!</span>
                </div>
                <div className="form-grid">
                  <div><p className="text-sm text-muted">Date</p><p style={{ fontWeight: 500 }}>{application.interviewDate || '—'}</p></div>
                  <div><p className="text-sm text-muted">Time</p><p style={{ fontWeight: 500 }}>{application.interviewTime || '—'}</p></div>
                  <div><p className="text-sm text-muted">Venue</p><p style={{ fontWeight: 500 }}>{application.interviewVenue || '—'}</p></div>
                </div>
              </div>
            )}

            {/* AI Score */}
            {application.aiScore !== null && (
              <div className="card">
                <p style={{ fontWeight: 600, marginBottom: '1rem' }}>AI Analysis Result</p>
                <div className="flex items-center gap-4">
                  <div className={`score-circle ${getScoreClass(application.aiScore)}`}>
                    {application.aiScore}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="text-sm text-muted mb-1">Fit Score</p>
                    <div style={{ background: 'var(--bg3)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${application.aiFitPercent}%`, height: '100%', borderRadius: '100px', background: application.aiScore >= 70 ? 'var(--green)' : application.aiScore >= 45 ? 'var(--amber)' : 'var(--red)', transition: 'width 0.8s ease' }} />
                    </div>
                    <p className="text-sm text-muted mt-1">{application.aiFitPercent}% match</p>
                  </div>
                  <span style={{ fontWeight: 600, color: application.aiRecommendation === 'Hire' ? 'var(--green)' : application.aiRecommendation === 'Review' ? 'var(--amber)' : 'var(--red)' }}>
                    {application.aiRecommendation}
                  </span>
                </div>
                {application.aiReport && (
                  <p className="text-sm text-muted mt-3" style={{ background: 'var(--bg3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    {application.aiReport}
                  </p>
                )}
              </div>
            )}

            {/* Profile Summary */}
            <div className="card">
              <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Your Profile</p>
              <div className="form-grid">
                <div><p className="text-sm text-muted">College</p><p style={{ fontWeight: 500 }}>{application.college}</p></div>
                <div><p className="text-sm text-muted">Department</p><p style={{ fontWeight: 500 }}>{application.department}</p></div>
                <div><p className="text-sm text-muted">Year</p><p style={{ fontWeight: 500 }}>{application.year}</p></div>
                <div><p className="text-sm text-muted">CGPA</p><p style={{ fontWeight: 500 }}>{application.cgpa}</p></div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted mb-2">Skills</p>
                <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                  {application.skills?.map((s, i) => (
                    <span key={i} className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{s}</span>
                  ))}
                </div>
              </div>
              {application.resumeOriginalName && (
                <div className="mt-4 flex items-center gap-2">
                  <FileText size={16} color="var(--text2)" />
                  <span className="text-sm text-muted">{application.resumeOriginalName}</span>
                  <a href={`http://localhost:5000${application.resumePath}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Download</a>
                </div>
              )}
            </div>

            {/* Admin notes if any */}
            {application.adminNotes && (
              <div className="card" style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} color="var(--amber)" />
                  <span style={{ fontWeight: 600, color: 'var(--amber)', fontSize: '0.875rem' }}>Admin Notes</span>
                </div>
                <p className="text-sm">{application.adminNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
