import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Navbar from '../../components/Navbar';
import { Briefcase, MapPin, Clock } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs')
      .then(res => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApply = (jobId) => {
    navigate(`/candidate/apply?jobId=${jobId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar title="Jobs" showBack />
        <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
          <div className="spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Available Jobs" showBack />
      <div className="page">
        {jobs.length === 0 ? (
          <div className="card text-center py-8">
            <Briefcase size={48} className="mx-auto mb-3 text-muted" />
            <p className="text-muted">No jobs available at the moment.</p>
          </div>
        ) : (
          <div className="grid" style={{ gap: '1.5rem' }}>
            {jobs.map(job => (
              <div key={job._id} className="card card-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{job.title}</h2>
                    <p className="text-muted text-sm mt-1 flex items-center gap-1">
                      <Clock size={14} />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApply(job._id)}
                    className="btn btn-primary"
                  >
                    Apply
                  </button>
                </div>
                <p className="mt-3">{job.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}