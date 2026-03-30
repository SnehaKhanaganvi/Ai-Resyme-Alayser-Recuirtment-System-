import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import Login from './pages/candidate/Login';
import Register from './pages/candidate/Register';
import CandidateDashboard from './pages/candidate/Dashboard';
import Apply from './pages/candidate/Apply';
import Jobs from './pages/candidate/Jobs';          // <-- import new page
import AdminDashboard from './pages/admin/Dashboard';
import AddJob from './pages/admin/AddJob';
import ApplicationReview from './pages/admin/ApplicationReview';
import TeamManagement from './pages/admin/TeamManagement';
import RecruitmentDashboard from './pages/recruitment/Dashboard';
import CandidateDetail from './pages/recruitment/CandidateDetail';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'recruitment') return <Navigate to="/recruitment/dashboard" replace />;
  return <Navigate to="/candidate/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Candidate */}
      <Route path="/candidate/dashboard" element={<ProtectedRoute roles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
      <Route path="/candidate/apply" element={<ProtectedRoute roles={['candidate']}><Apply /></ProtectedRoute>} />
      <Route path="/candidate/jobs" element={<ProtectedRoute roles={['candidate']}><Jobs /></ProtectedRoute>} />  {/* <-- new route */}

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/application/:id" element={<ProtectedRoute roles={['admin']}><ApplicationReview /></ProtectedRoute>} />
      <Route path="/admin/team" element={<ProtectedRoute roles={['admin']}><TeamManagement /></ProtectedRoute>} />
      <Route path="/admin/add-job" element={<ProtectedRoute roles={['admin']}><AddJob /></ProtectedRoute>} />
      
      {/* Recruitment */}
      <Route path="/recruitment/dashboard" element={<ProtectedRoute roles={['recruitment']}><RecruitmentDashboard /></ProtectedRoute>} />
      <Route path="/recruitment/candidate/:id" element={<ProtectedRoute roles={['recruitment']}><CandidateDetail /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.875rem' },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--card)' } },
            error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--card)' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}