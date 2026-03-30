import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import { Briefcase, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else if (data.user.role === 'recruitment') navigate('/recruitment/dashboard');
      else navigate('/candidate/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="card card-lg" style={{ width: '100%', maxWidth: 440 }}>
        <div className="flex items-center gap-2 mb-6">
          <Briefcase size={24} color="var(--accent)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recruit<span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sign in</h1>
        <p className="text-muted text-sm mb-6">Enter your credentials to continue</p>

        <div className="card" style={{ background: 'var(--bg3)', marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
          <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Default admin credentials:</p>
          <p className="font-mono text-sm" style={{ color: 'var(--accent)' }}>admin@recruit.com / Admin@123</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Your password" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-muted text-sm mt-4" style={{ textAlign: 'center' }}>
          New candidate? <Link to="/register" style={{ color: 'var(--accent)' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
