import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import { Upload, Plus, X, Send } from 'lucide-react';

export default function Apply() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdFromUrl = searchParams.get('jobId');

  const [jobId, setJobId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ college: '', department: '', year: '', cgpa: '', phone: '' });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Fetch available jobs on mount
  useEffect(() => {
    api.get('/jobs')
      .then(res => setJobs(res.data))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoadingJobs(false));
  }, []);

  // If jobId is in URL, set it
  useEffect(() => {
    if (jobIdFromUrl) setJobId(jobIdFromUrl);
  }, [jobIdFromUrl]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills(prev => [...prev, s]); setSkillInput(''); }
  };
  const removeSkill = s => setSkills(prev => prev.filter(x => x !== s));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!jobId) return toast.error('Please select a job');
    if (!resume) return toast.error('Please upload your resume');
    if (skills.length === 0) return toast.error('Add at least one skill');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('skills', skills.join(','));
      fd.append('resume', resume);
      // Use the jobId in URL
      await api.post(`/candidate/apply/${jobId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted! AI is analysing your profile.');
      navigate('/candidate/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar title="Apply" showBack />
      <div className="page page-md" style={{ marginTop: '2rem' }}>
        <div className="mb-6">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Submit Application</h1>
          <p className="text-muted text-sm mt-1">Fill in your academic profile and upload your resume</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Job Selection */}
          <div className="card card-lg mb-4">
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--accent)' }}>Job Posting</p>
            <div className="form-group">
              <label className="form-label">Select Job</label>
              <select
                className="form-input"
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                required
                disabled={loadingJobs}
              >
                <option value="">{loadingJobs ? 'Loading jobs...' : 'Select a job'}</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card card-lg mb-4">
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--accent)' }}>Academic Information</p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">College / University</label>
                <input className="form-input" value={form.college} onChange={set('college')} placeholder="IIT Delhi" required />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={form.department} onChange={set('department')} placeholder="Computer Science" required />
              </div>
              <div className="form-group">
                <label className="form-label">Year of Study</label>
                <select className="form-input" value={form.year} onChange={set('year')} required>
                  <option value="">Select year</option>
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Graduated'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CGPA (out of 10)</label>
                <input className="form-input" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={set('cgpa')} placeholder="8.5" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" required />
              </div>
            </div>
          </div>

          <div className="card card-lg mb-4">
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--accent)' }}>Skills</p>
            <div className="flex gap-2 mb-3">
              <input
                className="form-input" value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                placeholder="e.g. React, Python, Node.js..."
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-ghost" onClick={addSkill}><Plus size={16} /> Add</button>
            </div>
            {skills.length > 0 && (
              <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((s, i) => (
                  <span key={i} className="badge flex items-center gap-1" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', cursor: 'pointer' }} onClick={() => removeSkill(s)}>
                    {s} <X size={12} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card card-lg mb-6">
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--accent)' }}>Resume Upload</p>
            <label style={{ display: 'block', border: '2px dashed var(--border2)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setResume(f); }}>
              <Upload size={32} color="var(--accent)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 500 }}>{resume ? resume.name : 'Drag & drop or click to upload'}</p>
              <p className="text-sm text-muted mt-1">PDF or DOC/DOCX — max 5MB</p>
              <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setResume(e.target.files[0])} />
            </label>
          </div>

          <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/candidate/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}