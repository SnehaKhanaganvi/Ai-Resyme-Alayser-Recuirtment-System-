import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import { UserPlus, ToggleLeft, ToggleRight, Copy, Eye, EyeOff } from 'lucide-react';

export default function TeamManagement() {
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get('/admin/recruitment-team').then(r => setTeam(r.data)).finally(() => setLoading(false));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/admin/recruitment-team', form);
      setTeam(prev => [data, ...prev]);
      toast.success(`Account created for ${data.name}`);
      setForm({ name: '', email: '', password: '', phone: '' });
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const toggleActive = async (id) => {
    try {
      const { data } = await api.patch(`/admin/recruitment-team/${id}/toggle`);
      setTeam(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.isActive ? 'Account activated' : 'Account deactivated');
    } catch { toast.error('Failed'); }
  };

  const copyCredentials = (member) => {
    navigator.clipboard.writeText(`Email: ${member.email}\nPassword: (as set during creation)`);
    toast.success('Email copied to clipboard');
  };

  return (
    <>
      <Navbar title="Recruitment Team" showBack />
      <div className="page page-md" style={{ marginTop: '2rem' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Recruitment Team</h1>
            <p className="text-muted text-sm mt-1">Create and manage recruitment team accounts</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <UserPlus size={16} /> {showForm ? 'Cancel' : 'Add Member'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="card card-lg mb-6" style={{ borderLeft: '3px solid var(--accent)' }}>
            <p style={{ fontWeight: 600, marginBottom: '1rem' }}>New Recruitment Account</p>
            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (Login ID)</label>
                  <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="jane@company.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Temporary password" required style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="card mt-3" style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.75rem 1rem' }}>
                <p className="text-sm" style={{ color: 'var(--amber)' }}>⚠ Share these credentials directly with the team member. They can use this email & password to log in.</p>
              </div>
              <button type="submit" className="btn btn-primary mt-4" disabled={creating}>
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {/* Team Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>Loading...</td></tr>
                ) : team.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>No team members yet. Add one above.</td></tr>
                ) : team.map(member => (
                  <tr key={member._id}>
                    <td style={{ fontWeight: 500 }}>{member.name}</td>
                    <td className="font-mono text-sm">{member.email}</td>
                    <td className="text-sm text-muted">{member.phone || '—'}</td>
                    <td>
                      <span className="badge" style={{ background: member.isActive ? 'var(--green-bg)' : 'var(--red-bg)', color: member.isActive ? 'var(--green)' : 'var(--red)' }}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-sm text-muted">{new Date(member.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => copyCredentials(member)} title="Copy email">
                          <Copy size={14} />
                        </button>
                        <button className={`btn btn-sm ${member.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(member._id)}>
                          {member.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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
