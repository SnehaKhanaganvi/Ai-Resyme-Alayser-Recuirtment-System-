import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function AddJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/jobs', { title, description });
      toast.success('Job created successfully');
      setTitle('');
      setDescription('');
      navigate('/admin/dashboard'); // optional: redirect back to dashboard
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="Add Job" showBack />
      <div className="page page-md" style={{ marginTop: '2rem' }}>
        <div className="mb-6">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create New Job</h1>
          <p className="text-muted text-sm mt-1">Define the role and description for candidates to apply</p>
        </div>

        <form onSubmit={handleSubmit} className="card card-lg">
          <div className="form-group mb-4">
            <label className="form-label">Job Title</label>
            <input
              className="form-input"
              placeholder="e.g. MERN Stack Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Job Description</label>
            <textarea
              className="form-input"
              rows="8"
              placeholder="Describe the role, responsibilities, required skills, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}