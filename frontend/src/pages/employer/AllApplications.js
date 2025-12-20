import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaCheck, FaTimes, FaEye, FaBriefcase } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { applicationsAPI } from '../../services/api';
import './ViewApplications.css';

const AllApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);
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
      const response = await applicationsAPI.getEmployerApplications(params);
      setApplications(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application status updated to ${newStatus.toLowerCase()}`);
      fetchApplications();
      // Update selected app status locally
      if (selectedApp && selectedApp.id === applicationId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Error updating application status');
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

  if (loading && applications.length === 0) {
    return (
      <div className="view-applications-page page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-applications-page page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>All Applications</h1>
            <p>Manage all job applications received</p>
          </div>
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
              }}
              className="form-select"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="card empty-state-card">
            <div className="empty-state">
              <FaEnvelope className="empty-state-icon" />
              <h3>No applications yet</h3>
              <p>Applications will appear here when candidates apply to your jobs</p>
            </div>
          </div>
        ) : (
          <div className="applications-grid">
            <div className="applications-list-container card">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`application-card ${selectedApp?.id === app.id ? 'selected' : ''}`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="applicant-avatar">
                    {app.applicantName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="applicant-details">
                    <h3>{app.applicantName}</h3>
                    <p className="job-applied">
                      <FaBriefcase /> {app.jobTitle}
                    </p>
                    <p>{app.applicantEmail}</p>
                    <div className="application-meta">
                      <span className={`status-badge ${app.status?.toLowerCase()}`}>
                        {app.status}
                      </span>
                      <span className="apply-date">{formatDate(app.appliedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="application-detail-container">
              {selectedApp ? (
                <div className="card application-detail">
                  <div className="detail-header">
                    <div className="applicant-avatar large">
                      {selectedApp.applicantName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <h2>{selectedApp.applicantName}</h2>
                      <p>{selectedApp.applicantEmail}</p>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Applied For</h3>
                    <Link to={`/jobs/${selectedApp.jobId}`} className="job-link">
                      <FaBriefcase /> {selectedApp.jobTitle} at {selectedApp.companyName}
                    </Link>
                  </div>

                  <div className="detail-section">
                    <h3>Current Status</h3>
                    <span className={`status-badge ${selectedApp.status?.toLowerCase()}`}>
                      {selectedApp.status}
                    </span>
                  </div>

                  <div className="detail-section">
                    <h3>Applied On</h3>
                    <p>{formatDate(selectedApp.appliedAt)}</p>
                  </div>

                  {selectedApp.resumeUrl && (
                    <div className="detail-section">
                      <h3>Resume</h3>
                      <a 
                        href={selectedApp.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="resume-link"
                      >
                        <FaEye /> View Resume
                      </a>
                    </div>
                  )}

                  {selectedApp.coverLetter && (
                    <div className="detail-section">
                      <h3>Cover Letter</h3>
                      <p className="cover-letter">{selectedApp.coverLetter}</p>
                    </div>
                  )}

                  <div className="detail-section">
                    <h3>Update Status</h3>
                    <div className="status-buttons">
                      {selectedApp.status !== 'REVIEWED' && selectedApp.status !== 'SHORTLISTED' && 
                       selectedApp.status !== 'INTERVIEW' && selectedApp.status !== 'ACCEPTED' && 
                       selectedApp.status !== 'REJECTED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStatusUpdate(selectedApp.id, 'REVIEWED')}
                        >
                          <FaEye /> Mark Reviewed
                        </button>
                      )}
                      {selectedApp.status !== 'SHORTLISTED' && selectedApp.status !== 'INTERVIEW' && 
                       selectedApp.status !== 'ACCEPTED' && selectedApp.status !== 'REJECTED' && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleStatusUpdate(selectedApp.id, 'SHORTLISTED')}
                        >
                          <FaCheck /> Shortlist
                        </button>
                      )}
                      {selectedApp.status !== 'INTERVIEW' && selectedApp.status !== 'ACCEPTED' && 
                       selectedApp.status !== 'REJECTED' && (
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleStatusUpdate(selectedApp.id, 'INTERVIEW')}
                        >
                          <FaCheck /> Interview
                        </button>
                      )}
                      {selectedApp.status !== 'ACCEPTED' && selectedApp.status !== 'REJECTED' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusUpdate(selectedApp.id, 'ACCEPTED')}
                          >
                            <FaCheck /> Accept
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusUpdate(selectedApp.id, 'REJECTED')}
                          >
                            <FaTimes /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="detail-actions">
                    <Link 
                      to={`/messages?userId=${selectedApp.applicantId}`} 
                      className="btn btn-secondary"
                    >
                      <FaEnvelope /> Send Message
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="card empty-detail">
                  <FaEnvelope className="empty-icon" />
                  <p>Select an application to view details and change status</p>
                </div>
              )}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default AllApplications;
