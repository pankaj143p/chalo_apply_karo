import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaHeart, FaClock, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { applicationsAPI, favoritesAPI, jobsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/JobCard';
import '../employer/Dashboard.css';
import './Dashboard.css';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    favoriteJobs: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch applications
      const applicationsResponse = await applicationsAPI.getMyApplications({ page: 0, size: 5 });
      const applications = applicationsResponse.data.content;
      setRecentApplications(applications);

      // Fetch favorites count
      const favoritesResponse = await favoritesAPI.getMyFavorites({ page: 0, size: 1 });
      
      // Fetch recommended jobs (latest jobs)
      const jobsResponse = await jobsAPI.getRecentJobs({ page: 0, size: 4 });
      setRecommendedJobs(jobsResponse.data.content);

      // Calculate stats
      const pendingApps = applications.filter(app => app.status === 'PENDING').length;
      
      setStats({
        totalApplications: applicationsResponse.data.totalElements,
        pendingApplications: pendingApps,
        favoriteJobs: favoritesResponse.data.totalElements
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <FaCheckCircle className="status-icon accepted" />;
      case 'PENDING':
        return <FaClock className="status-icon pending" />;
      default:
        return null;
    }
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
            <h1>Welcome back, {user?.firstName || 'Job Seeker'}!</h1>
            <p>Track your applications and discover new opportunities</p>
          </div>
          <Link to="/jobs" className="btn btn-primary">
            <FaSearch /> Find Jobs
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon applications">
              <FaBriefcase />
            </div>
            <div className="stat-info">
              <h3>{stats.totalApplications}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-info">
              <h3>{stats.pendingApplications}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon favorites">
              <FaHeart />
            </div>
            <div className="stat-info">
              <h3>{stats.favoriteJobs}</h3>
              <p>Saved Jobs</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Recent Applications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/jobseeker/applications" className="view-all-link">View All</Link>
            </div>
            <div className="card">
              {recentApplications.length === 0 ? (
                <div className="empty-section">
                  <p>No applications yet</p>
                  <Link to="/jobs" className="btn btn-primary btn-sm">
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="applications-list">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="application-item">
                      <div className="applicant-info">
                        <div className="applicant-avatar">
                          {app.companyName?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <h4>{app.jobTitle}</h4>
                          <p>{app.companyName}</p>
                        </div>
                      </div>
                      <div className="application-meta">
                        <span className={`status-badge ${app.status?.toLowerCase()}`}>
                          {app.status}
                        </span>
                        <span className="apply-date">{formatDate(app.appliedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recommended for You</h2>
              <Link to="/jobs" className="view-all-link">View All Jobs</Link>
            </div>
            {recommendedJobs.length === 0 ? (
              <div className="card empty-section">
                <p>No recommended jobs at the moment</p>
              </div>
            ) : (
              <div className="recommended-jobs-grid">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} compact />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/jobs" className="quick-action-btn">
                <FaSearch /> Search Jobs
              </Link>
              <Link to="/jobseeker/favorites" className="quick-action-btn">
                <FaHeart /> Saved Jobs
              </Link>
              <Link to="/jobseeker/applications" className="quick-action-btn">
                <FaBriefcase /> My Applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
