import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api', // absolute URL – change to your backend
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401 globally – redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Download CSV helper
export function downloadCSV(data, filename) {
  if (!data.length) return;
  const headers = ['Name', 'Email', 'Phone', 'College', 'Department', 'CGPA', 'AI Score', 'Status', 'Applied On'];
  const rows = data.map(a => [
    a.candidate?.name || '',
    a.candidate?.email || '',
    a.candidate?.phone || a.phone || '',
    a.college || '',
    a.department || '',
    a.cgpa || '',
    a.aiScore || '',
    a.status || '',
    new Date(a.createdAt).toLocaleDateString()
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function getScoreClass(score) {
  if (score >= 70) return 'score-high';
  if (score >= 45) return 'score-mid';
  return 'score-low';
}

export function statusLabel(status) {
  const map = {
    pending: 'Pending', shortlisted: 'Shortlisted', rejected: 'Rejected',
    forwarded: 'Forwarded', interview_selected: 'Interview Selected', not_selected: 'Not Selected'
  };
  return map[status] || status;
}