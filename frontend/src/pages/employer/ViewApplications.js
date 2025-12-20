import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { applicationsAPI, jobsAPI } from '../../services/api';
import './ViewApplications.css';

const ViewApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, [id, page, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch job details
      const jobResponse = await jobsAPI.getJobById(id);
      setJob(jobResponse.data);

      // Fetch applications for this job
      const params = { 
        page, 
        size: 10,
        ...(filter !== 'ALL' && { status: filter })
      };
      const appsResponse = await applicationsAPI.getApplicationsForJob(id, params);
      setApplications(appsResponse.data.content);
      setTotalPages(appsResponse.data.totalPages);
    } catch (error) {
      toast.error('Error fetching applications');
      navigate('/employer/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application ${newStatus.toLowerCase()}`);
      fetchData();
      setSelectedApp(null);
    } catch (error) {
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

  if (loading) {
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
        <button className="back-btn" onClick={() => navigate('/employer/jobs')}>
          <FaArrowLeft /> Back to Jobs
        </button>

        <div className="page-header">
          <div>
            <h1>Applications for {job?.title}</h1>
            <p>{applications.length} applications received</p>
          </div>
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
              <p>Applications will appear here when candidates apply</p>
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
                    <h3>Status</h3>
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

                  <div className="detail-actions">
                    {selectedApp.status === 'PENDING' && (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleStatusUpdate(selectedApp.id, 'REVIEWED')}
                        >
                          <FaEye /> Mark as Reviewed
                        </button>
                      </>
                    )}
                    {(selectedApp.status === 'PENDING' || selectedApp.status === 'REVIEWED') && (
                      <>
                        <button
                          className="btn btn-warning"
                          onClick={() => handleStatusUpdate(selectedApp.id, 'SHORTLISTED')}
                        >
                          <FaCheck /> Shortlist
                        </button>
                      </>
                    )}
                    {(selectedApp.status === 'SHORTLISTED') && (
                      <>
                        <button
                          className="btn btn-info"
                          onClick={() => handleStatusUpdate(selectedApp.id, 'INTERVIEW')}
                        >
                          <FaCheck /> Schedule Interview
                        </button>
                      </>
                    )}
                    {(selectedApp.status === 'PENDING' || selectedApp.status === 'REVIEWED' || selectedApp.status === 'SHORTLISTED' || selectedApp.status === 'INTERVIEW') && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => handleStatusUpdate(selectedApp.id, 'ACCEPTED')}
                        >
                          <FaCheck /> Accept
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleStatusUpdate(selectedApp.id, 'REJECTED')}
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
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
                  <p>Select an application to view details</p>
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

export default ViewApplications;
