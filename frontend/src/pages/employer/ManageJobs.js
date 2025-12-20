import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaBan, FaEye, FaUsers, FaCheckCircle, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { jobsAPI } from '../../services/api';
import './ManageJobs.css';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [jobToDeactivate, setJobToDeactivate] = useState(null);
  const [jobToActivate, setJobToActivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getMyJobs({ page, size: 10 });
      setJobs(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    setJobToDeactivate(job);
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    if (!jobToDeactivate) return;
    
    setDeactivating(true);
    try {
      // Use updateJob to set status to INACTIVE (soft delete)
      await jobsAPI.updateJob(jobToDeactivate.id, { status: 'INACTIVE' });
      toast.success('Job deactivated successfully');
      setShowDeactivateModal(false);
      setJobToDeactivate(null);
      fetchJobs();
    } catch (error) {
      toast.error('Error deactivating job');
    } finally {
      setDeactivating(false);
    }
  };

  const cancelDeactivate = () => {
    setShowDeactivateModal(false);
    setJobToDeactivate(null);
  };

  const handleActivate = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    setJobToActivate(job);
    setShowActivateModal(true);
  };

  const confirmActivate = async () => {
    if (!jobToActivate) return;
    
    setActivating(true);
    try {
      await jobsAPI.updateJob(jobToActivate.id, { status: 'ACTIVE' });
      toast.success('Job activated successfully! It is now visible to job seekers.');
      setShowActivateModal(false);
      setJobToActivate(null);
      fetchJobs();
    } catch (error) {
      toast.error('Error activating job');
    } finally {
      setActivating(false);
    }
  };

  const cancelActivate = () => {
    setShowActivateModal(false);
    setJobToActivate(null);
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobsAPI.updateJob(jobId, { status: newStatus });
      toast.success('Job status updated');
      fetchJobs();
    } catch (error) {
      toast.error('Error updating job status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="manage-jobs-page page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Manage Jobs</h1>
            <p>View and manage all your job postings</p>
          </div>
          <Link to="/employer/jobs/new" className="btn btn-primary">
            <FaPlus /> Post New Job
          </Link>
        </div>

        {/* Status Filter */}
        <div className="filter-bar">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <span className="filter-label">Filter by Status:</span>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All Jobs
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ACTIVE')}
              >
                Active
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'INACTIVE' ? 'active' : ''}`}
                onClick={() => setStatusFilter('INACTIVE')}
              >
                Inactive
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'CLOSED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CLOSED')}
              >
                Closed
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'DRAFT' ? 'active' : ''}`}
                onClick={() => setStatusFilter('DRAFT')}
              >
                Draft
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card empty-state-card">
            <div className="empty-state">
              <FaPlus className="empty-state-icon" />
              <h3>No jobs posted yet</h3>
              <p>Start attracting talent by posting your first job</p>
              <Link to="/employer/jobs/new" className="btn btn-primary">
                Post Your First Job
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Applications</th>
                      <th>Posted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs
                      .filter(job => statusFilter === 'ALL' || job.status === statusFilter)
                      .length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-results">
                          <div className="no-results-message">
                            <FaFilter className="no-results-icon" />
                            <p>No {statusFilter.toLowerCase()} jobs found</p>
                            <button 
                              className="btn btn-secondary"
                              onClick={() => setStatusFilter('ALL')}
                            >
                              Show All Jobs
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      jobs
                        .filter(job => statusFilter === 'ALL' || job.status === statusFilter)
                        .map((job) => (
                      <tr key={job.id} className={job.status === 'INACTIVE' ? 'inactive-row' : ''}>
                        <td>
                          <div className="job-title-cell">
                            <Link to={`/jobs/${job.id}`} className="job-title-link">
                              {job.title}
                            </Link>
                            {job.status === 'INACTIVE' && (
                              <span className="inactive-badge">Inactive</span>
                            )}
                          </div>
                        </td>
                        <td>{job.location}</td>
                        <td>{job.jobType?.replace('_', ' ')}</td>
                        <td>
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job.id, e.target.value)}
                            className={`status-select ${job.status?.toLowerCase()}`}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="CLOSED">Closed</option>
                            <option value="DRAFT">Draft</option>
                          </select>
                        </td>
                        <td>
                          <Link 
                            to={`/employer/jobs/${job.id}/applications`} 
                            className="applications-link"
                          >
                            <FaUsers /> {job.applicationCount || 0}
                          </Link>
                        </td>
                        <td>{formatDate(job.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <Link to={`/jobs/${job.id}`} className="action-btn-small" title="View">
                              <FaEye />
                            </Link>
                            <Link to={`/employer/jobs/${job.id}/edit`} className="action-btn-small" title="Edit">
                              <FaEdit />
                            </Link>
                            {job.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleDeactivate(job.id)}
                                className="action-btn-small warning"
                                title="Deactivate"
                              >
                                <FaBan />
                              </button>
                            )}
                            {(job.status === 'INACTIVE' || job.status === 'CLOSED' || job.status === 'DRAFT') && (
                              <button
                                onClick={() => handleActivate(job.id)}
                                className="action-btn-small success"
                                title="Activate"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages - 1}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="modal-overlay" onClick={cancelDeactivate}>
          <div className="deactivate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="deactivate-modal-header">
              <div className="deactivate-icon">
                <FaBan />
              </div>
              <h2>Deactivate Job</h2>
            </div>
            <div className="deactivate-modal-body">
              <p className="deactivate-title">{jobToDeactivate?.title}</p>
              <p className="deactivate-message">
                Are you sure you want to deactivate this job posting? 
                It will no longer be visible to job seekers.
              </p>
              <p className="deactivate-note">
                You can reactivate it later from the status dropdown.
              </p>
            </div>
            <div className="deactivate-modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={cancelDeactivate}
                disabled={deactivating}
              >
                Cancel
              </button>
              <button 
                className="btn btn-warning" 
                onClick={confirmDeactivate}
                disabled={deactivating}
              >
                {deactivating ? 'Deactivating...' : 'Yes, Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Confirmation Modal */}
      {showActivateModal && (
        <div className="modal-overlay" onClick={cancelActivate}>
          <div className="activate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="activate-modal-header">
              <div className="activate-icon">
                <FaCheckCircle />
              </div>
              <h2>Activate Job</h2>
            </div>
            <div className="activate-modal-body">
              <p className="activate-title">{jobToActivate?.title}</p>
              <p className="activate-message">
                Are you sure you want to activate this job posting? 
                It will become visible to job seekers immediately.
              </p>
              <p className="activate-note">
                Job seekers will be able to view and apply for this position.
              </p>
            </div>
            <div className="activate-modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={cancelActivate}
                disabled={activating}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={confirmActivate}
                disabled={activating}
              >
                {activating ? 'Activating...' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
