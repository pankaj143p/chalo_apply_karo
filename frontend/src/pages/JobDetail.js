import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaBuilding,
  FaUsers,
  FaHeart,
  FaRegHeart,
  FaArrowLeft,
  FaShareAlt,
  FaPaperPlane,
  FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { jobsAPI, applicationsAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

// Helper function to format experience level for display
const getExperienceLevelDisplay = (level) => {
  const levelMap = {
    'ENTRY': 'Entry Level',
    'JUNIOR': 'Junior',
    'MID': 'Mid Level',
    'SENIOR': 'Senior',
    'LEAD': 'Lead',
    'EXECUTIVE': 'Executive'
  };
  return levelMap[level] || level?.replace('_', ' ');
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isJobSeeker, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getJobById(id);
      setJob(response.data);
      setIsFavorite(response.data.isFavorite || false);
      
      // Check if user has already applied
      if (isAuthenticated && isJobSeeker) {
        try {
          const applicationsResponse = await applicationsAPI.getMyApplications();
          const applications = applicationsResponse.data?.content || [];
          const applied = applications.some(
            app => app.jobId === parseInt(id)
          );
          setHasApplied(applied);
        } catch (error) {
          // Ignore error if user hasn't applied
        }
      }
    } catch (error) {
      toast.error('Error fetching job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please login to apply for this job');
      navigate('/login');
      return;
    }

    if (!isJobSeeker) {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      await applicationsAPI.apply({
        jobId: parseInt(id),
        coverLetter,
        resumeUrl
      });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setShowApplyModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !isJobSeeker) {
      toast.info('Please login as a job seeker to save jobs');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(id);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.addToFavorites(id);
        toast.success('Added to favorites');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error('Error updating favorites');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.companyName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency] || '₹';
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    const symbol = '₹'; // Always use INR
    if (min && max) return `${symbol}${min.toLocaleString('en-IN')} - ${symbol}${max.toLocaleString('en-IN')}`;
    if (min) return `From ${symbol}${min.toLocaleString('en-IN')}`;
    return `Up to ${symbol}${max.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="job-detail-page page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Jobs
        </button>

        <div className="job-detail-content">
          {/* Main Content */}
          <div className="job-main">
            <div className="job-header-card card">
              <div className="job-header">
                <div className="company-logo">
                  {job.companyName?.charAt(0).toUpperCase()}
                </div>
                <div className="job-header-info">
                  <h1 className="job-title">{job.title}</h1>
                  <p className="company-name">
                    <FaBuilding /> {job.companyName}
                  </p>
                  <div className="job-meta-tags">
                    <span className="meta-tag">
                      <FaMapMarkerAlt /> {job.location}
                    </span>
                    <span className="meta-tag">
                      <FaBriefcase /> {job.jobType?.replace('_', ' ')}
                    </span>
                    <span className="meta-tag">
                      <FaClock /> {getExperienceLevelDisplay(job.experienceLevel)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="job-actions">
                {isJobSeeker && (
                  <button
                    className={`action-btn favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={handleFavoriteToggle}
                  >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  </button>
                )}
                <button className="action-btn share-btn" onClick={handleShare}>
                  <FaShareAlt />
                </button>
              </div>
            </div>

            <div className="job-description-card card">
              <h2>Job Description</h2>
              <div className="job-description">
                <p>{job.description}</p>
              </div>

              {job.requirements && (
                <>
                  <h2>Requirements</h2>
                  <div className="job-requirements">
                    <p>{job.requirements}</p>
                  </div>
                </>
              )}

              {job.skills && job.skills.length > 0 && (
                <>
                  <h2>Required Skills</h2>
                  <div className="skills-list">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="job-sidebar">
            <div className="apply-card card">
              <h3>Apply for this position</h3>
              <div className="salary-info">
                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
              <p className="posted-date">
                <FaClock /> Posted {formatDate(job.createdAt)}
              </p>
              
              {job.applicationDeadline && (
                <p className={`deadline-date ${new Date(job.applicationDeadline) < new Date() ? 'expired' : ''}`}>
                  <FaCalendarAlt /> Deadline: {formatDate(job.applicationDeadline)}
                  {new Date(job.applicationDeadline) < new Date() && <span className="deadline-expired"> (Expired)</span>}
                </p>
              )}

              {hasApplied ? (
                <button className="btn btn-primary" disabled>
                  Already Applied
                </button>
              ) : isJobSeeker ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowApplyModal(true)}
                >
                  <FaPaperPlane /> Apply Now
                </button>
              ) : isAuthenticated ? (
                <p className="apply-note">
                  Sign in as a job seeker to apply
                </p>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Login to Apply
                </button>
              )}
            </div>

            <div className="company-card card">
              <h3>About the Company</h3>
              <div className="company-info">
                <div className="company-logo-large">
                  {job.companyName?.charAt(0).toUpperCase()}
                </div>
                <h4>{job.companyName}</h4>
                {job.employeeCount && (
                  <p>
                    <FaUsers /> {job.employeeCount} employees
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {job.title}</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleApply}>
              <div className="form-group">
                <label>Resume URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/your-resume.pdf"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Cover Letter</label>
                <textarea
                  className="form-input"
                  rows="6"
                  placeholder="Tell us why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={applying}
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
