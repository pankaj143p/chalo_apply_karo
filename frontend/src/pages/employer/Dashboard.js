import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaUsers, FaEye, FaPlus, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { jobsAPI, applicationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentApplications: []
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch employer's jobs
      const jobsResponse = await jobsAPI.getMyJobs({ page: 0, size: 5 });
      const jobs = jobsResponse.data.content;
      setRecentJobs(jobs);

      // Calculate stats
      const activeJobs = jobs.filter(job => job.status === 'ACTIVE').length;
      
      // Fetch applications for employer's jobs
      const applicationsResponse = await applicationsAPI.getEmployerApplications({ page: 0, size: 5 });
      const applications = applicationsResponse.data.content;

      setStats({
        totalJobs: jobsResponse.data.totalElements,
        activeJobs,
        totalApplications: applicationsResponse.data.totalElements,
        recentApplications: applications
      });
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
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
      <div className="dashboard-page page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page page">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.firstName || 'Employer'}!</h1>
            <p>Manage your job postings and review applications</p>
          </div>
          <Link to="/employer/jobs/new" className="btn btn-primary">
            <FaPlus /> Post New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon jobs">
              <FaBriefcase />
            </div>
            <div className="stat-info">
              <h3>{stats.totalJobs}</h3>
              <p>Total Jobs Posted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <FaChartLine />
            </div>
            <div className="stat-info">
              <h3>{stats.activeJobs}</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon applications">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>{stats.totalApplications}</h3>
              <p>Total Applications</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Recent Jobs */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Job Postings</h2>
              <Link to="/employer/jobs" className="view-all-link">View All</Link>
            </div>
            <div className="card">
              {recentJobs.length === 0 ? (
                <div className="empty-section">
                  <p>No jobs posted yet</p>
                  <Link to="/employer/jobs/new" className="btn btn-primary btn-sm">
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Posted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map((job) => (
                        <tr key={job.id}>
                          <td className="job-title-cell">{job.title}</td>
                          <td>{job.location}</td>
                          <td>
                            <span className={`status-badge ${job.status?.toLowerCase()}`}>
                              {job.status}
                            </span>
                          </td>
                          <td>{formatDate(job.createdAt)}</td>
                          <td>
                            <div className="table-actions">
                              <Link to={`/jobs/${job.id}`} className="action-link">
                                <FaEye /> View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/employer/applications" className="view-all-link">View All</Link>
            </div>
            <div className="card">
              {stats.recentApplications.length === 0 ? (
                <div className="empty-section">
                  <p>No applications received yet</p>
                </div>
              ) : (
                <div className="applications-list">
                  {stats.recentApplications.map((app) => (
                    <Link 
                      key={app.id} 
                      to={`/employer/jobs/${app.jobId}/applications`}
                      className="application-item clickable"
                    >
                      <div className="applicant-info">
                        <div className="applicant-avatar">
                          {app.applicantName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <h4>{app.applicantName}</h4>
                          <p>Applied for: {app.jobTitle}</p>
                        </div>
                      </div>
                      <div className="application-meta">
                        <span className={`status-badge ${app.status?.toLowerCase()}`}>
                          {app.status}
                        </span>
                        <span className="apply-date">{formatDate(app.appliedAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
