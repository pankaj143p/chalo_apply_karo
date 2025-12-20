import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaBuilding, FaClock, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { applicationsAPI } from '../../services/api';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchApplications();
  }, [page, filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = { 
        page, 
        size: 10,
        ...(filter !== 'ALL' && { status: filter })
      };
      const response = await applicationsAPI.getMyApplications(params);
      setApplications(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await applicationsAPI.withdrawApplication(applicationId);
      toast.success('Application withdrawn');
      fetchApplications();
    } catch (error) {
      toast.error('Error withdrawing application');
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'accepted';
      case 'REJECTED': return 'rejected';
      case 'REVIEWED': return 'reviewed';
      case 'SHORTLISTED': return 'shortlisted';
      case 'INTERVIEW': return 'interview';
      case 'OFFERED': return 'offered';
      case 'WITHDRAWN': return 'withdrawn';
      default: return 'pending';
    }
  };

  return (
    <div className="my-applications-page page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Applications</h1>
            <p>Track the status of your job applications</p>
          </div>
          <div className="filter-group">
            <label>Filter:</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
              }}
              className="form-select"
            >
              <option value="ALL">All Applications</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFERED">Offered</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="card empty-state-card">
            <div className="empty-state">
              <FaBriefcase className="empty-state-icon" />
              <h3>No applications found</h3>
              <p>Start applying for jobs to see your applications here</p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="applications-list-grid">
              {applications.map((app) => (
                <div key={app.id} className="application-card card">
                  <div className="application-header">
                    <div className="company-logo">
                      {app.companyName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="application-info">
                      <h3>{app.jobTitle}</h3>
                      <p className="company-name">
                        <FaBuilding /> {app.companyName}
                      </p>
                    </div>
                    <span className={`status-badge ${getStatusClass(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="application-details">
                    <div className="detail-item">
                      <FaClock />
                      <span>Applied {formatDate(app.appliedAt)}</span>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="cover-letter-preview">
                      <strong>Cover Letter:</strong>
                      <p>{app.coverLetter.substring(0, 150)}...</p>
                    </div>
                  )}

                  <div className="application-actions">
                    <Link to={`/jobs/${app.jobId}`} className="btn btn-secondary btn-sm">
                      <FaExternalLinkAlt /> View Job
                    </Link>
                    {app.status === 'PENDING' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleWithdraw(app.id)}
                      >
                        <FaTrash /> Withdraw
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default MyApplications;
