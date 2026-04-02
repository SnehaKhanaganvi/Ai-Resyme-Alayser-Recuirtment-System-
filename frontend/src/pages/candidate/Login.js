import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  UserCheck,
  CheckCircle,
  Zap,
  BarChart3,
  Clock
} from 'lucide-react';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Clear form fields when role changes (no auto-fill)
    setForm({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select a role first');
      return;
    }
    if (!form.email || !form.password) {
      toast.error('Please enter email and password');
      return;
    }
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

  const roles = [
    {
      id: 'admin',
      title: 'Administrator',
      icon: Shield,
      description: 'Full control over jobs, applications, and team',
      color: '#8B5CF6'
    },
    {
      id: 'recruitment',
      title: 'Recruitment Team',
      icon: Users,
      description: 'Review candidates, schedule interviews',
      color: '#3B82F6'
    },
    {
      id: 'candidate',
      title: 'Candidate',
      icon: UserCheck,
      description: 'Apply for jobs and track your status',
      color: '#10B981'
    }
  ];

  const features = [
    { icon: Zap, text: 'AI-powered resume screening' },
    { icon: BarChart3, text: 'Real-time candidate ranking' },
    { icon: Clock, text: 'Faster hiring workflow' }
  ];

  const selectedRoleObj = selectedRole ? roles.find(r => r.id === selectedRole) : null;

  return (
    <div className="split-layout">
      {/* LEFT SIDEBAR */}
      <div className="sidebar-panel">
        <div className="sidebar-content">
          <div className="logo-large">
            <Briefcase size={40} color="var(--accent)" />
            <h1>Recruit<span style={{ color: 'var(--accent)' }}>AI</span></h1>
          </div>
          <p className="tagline">Intelligent recruitment platform</p>
          <div className="features-list">
            {features.map((feat, idx) => (
              <div key={idx} className="feature-item">
                <feat.icon size={20} color="var(--accent)" />
                <span>{feat.text}</span>
              </div>
            ))}
          </div>
          <div className="testimonial">
            <div className="quote">“Reduced screening time by 80% using AI analysis.”</div>
            <div className="author">— HR Manager, TechCorp</div>
          </div>
          <div className="sidebar-footer">
            <Link to="/register">New candidate? Create account →</Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="main-panel">
        <div className="panel-container">
          {!selectedRole ? (
            // Role Selection View
            <div className="role-selection">
              <div className="welcome-text">
                <h2>Welcome back</h2>
                <p>Select your role to continue</p>
              </div>
              <div className="roles-container">
                {roles.map(role => (
                  <button
                    key={role.id}
                    className="role-card-select"
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <div className="role-icon" style={{ background: `${role.color}20`, color: role.color }}>
                      <role.icon size={28} />
                    </div>
                    <div className="role-info">
                      <h3>{role.title}</h3>
                      <p>{role.description}</p>
                    </div>
                    <div className="role-arrow">→</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Login Form View (empty fields, no demo data)
            <div className="login-form-view">
              <button className="back-to-roles" onClick={() => setSelectedRole(null)}>
                ← Back to roles
              </button>
              <div className="form-header">
                <div className="role-badge" style={{ background: `${selectedRoleObj.color}20`, color: selectedRoleObj.color }}>
                  <selectedRoleObj.icon size={20} />
                  <span>{selectedRoleObj.title}</span>
                </div>
                <h2>Sign in to your account</h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="toggle-password"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .split-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg1);
        }
        .sidebar-panel {
          width: 380px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .sidebar-panel::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: var(--accent);
          filter: blur(100px);
          opacity: 0.1;
          bottom: -100px;
          left: -100px;
        }
        .sidebar-content {
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
        }
        .logo-large {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .logo-large h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }
        .tagline {
          color: var(--text2);
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 2rem 0;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: var(--text);
        }
        .testimonial {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 1rem;
          margin: 2rem 0;
          border-left: 3px solid var(--accent);
        }
        .quote {
          font-style: italic;
          font-size: 0.85rem;
          color: var(--text2);
          margin-bottom: 0.5rem;
        }
        .author {
          font-size: 0.75rem;
          color: var(--accent);
        }
        .sidebar-footer a {
          color: var(--accent);
          text-decoration: none;
          font-size: 0.85rem;
        }
        .sidebar-footer a:hover {
          text-decoration: underline;
        }
        .main-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .panel-container {
          width: 100%;
          max-width: 480px;
        }
        .role-selection {
          animation: fadeIn 0.3s ease;
        }
        .welcome-text {
          text-align: center;
          margin-bottom: 2rem;
        }
        .welcome-text h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .welcome-text p {
          color: var(--text2);
        }
        .roles-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .role-card-select {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }
        .role-card-select:hover {
          transform: translateX(4px);
          border-color: var(--accent);
          background: var(--bg2);
        }
        .role-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .role-info {
          flex: 1;
        }
        .role-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .role-info p {
          font-size: 0.8rem;
          color: var(--text2);
        }
        .role-arrow {
          font-size: 1.25rem;
          color: var(--accent);
          opacity: 0.5;
        }
        .role-card-select:hover .role-arrow {
          opacity: 1;
        }
        .login-form-view {
          animation: fadeIn 0.3s ease;
        }
        .back-to-roles {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .back-to-roles:hover {
          text-decoration: underline;
        }
        .form-header {
          margin-bottom: 1.5rem;
        }
        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .form-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .password-wrapper {
          position: relative;
        }
        .password-wrapper input {
          padding-right: 2.5rem;
        }
        .toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text2);
          cursor: pointer;
        }
        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          background: var(--accent);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: opacity 0.2s;
          margin-top: 0.5rem;
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .split-layout {
            flex-direction: column;
          }
          .sidebar-panel {
            width: 100%;
            padding: 2rem;
            text-align: center;
          }
          .features-list, .testimonial {
            display: none;
          }
          .sidebar-content {
            padding: 1rem;
          }
          .logo-large {
            justify-content: center;
          }
          .main-panel {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}