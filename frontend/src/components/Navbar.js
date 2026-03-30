import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronLeft, Briefcase } from 'lucide-react';

export default function Navbar({ title, showBack }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="nav">
      <div className="flex items-center gap-3">
        {showBack && (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="nav-brand">
          <Briefcase size={20} color="var(--accent)" />
          Recruit<span>AI</span>
          {title && <span style={{ color: 'var(--text2)', fontWeight: 400, fontSize: '0.9rem' }}> / {title}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-muted">{user.name}</span>
            <span className="badge" style={{
              background: user.role === 'admin' ? 'var(--purple-bg)' : user.role === 'recruitment' ? 'var(--amber-bg)' : 'var(--accent-glow)',
              color: user.role === 'admin' ? 'var(--purple)' : user.role === 'recruitment' ? 'var(--amber)' : 'var(--accent)'
            }}>{user.role}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
