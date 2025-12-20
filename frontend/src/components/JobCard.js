import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaBuilding, FaHeart, FaRegHeart } from 'react-icons/fa';
import './JobCard.css';

const JobCard = ({ job, onFavoriteToggle, showFavorite = true }) => {
  const formatSalary = () => {
    const symbol = '₹'; // Always use INR
    if (job.salaryMin && job.salaryMax) {
      return `${symbol}${job.salaryMin.toLocaleString('en-IN')} - ${symbol}${job.salaryMax.toLocaleString('en-IN')}`;
    }
    if (job.salaryMin) {
      return `From ${symbol}${job.salaryMin.toLocaleString('en-IN')}`;
    }
    if (job.salaryMax) {
      return `Up to ${symbol}${job.salaryMax.toLocaleString('en-IN')}`;
    }
    return 'Salary not specified';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getJobTypeBadge = () => {
    const typeMap = {
      FULL_TIME: 'Full Time',
      PART_TIME: 'Part Time',
      CONTRACT: 'Contract',
      INTERNSHIP: 'Internship',
      REMOTE: 'Remote',
      HYBRID: 'Hybrid'
    };
    return typeMap[job.jobType] || job.jobType;
  };

  const getExperienceLevelBadge = () => {
    const levelMap = {
      ENTRY: 'Entry Level',
      JUNIOR: 'Junior',
      MID: 'Mid Level',
      SENIOR: 'Senior',
      LEAD: 'Lead',
      EXECUTIVE: 'Executive'
    };
    return levelMap[job.experienceLevel] || job.experienceLevel;
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-card-company-logo">
          {job.companyName?.charAt(0).toUpperCase()}
        </div>
        <div className="job-card-header-info">
          <h3 className="job-card-title">
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          <div className="job-card-company">
            <FaBuilding />
            <span>{job.companyName}</span>
          </div>
        </div>
        {showFavorite && onFavoriteToggle && (
          <button 
            className={`job-card-favorite ${job.isFavorite ? 'active' : ''}`}
            onClick={() => onFavoriteToggle(job.id, job.isFavorite)}
          >
            {job.isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>

      <div className="job-card-meta">
        <span className="job-card-meta-item">
          <FaMapMarkerAlt />
          {job.location}
        </span>
        <span className="job-card-meta-item">
          {formatSalary()}
        </span>
        <span className="job-card-meta-item">
          <FaClock />
          {formatDate(job.createdAt)}
        </span>
      </div>

      <p className="job-card-description">
        {job.description?.length > 150 
          ? `${job.description.substring(0, 150)}...` 
          : job.description}
      </p>

      <div className="job-card-footer">
        <div className="job-card-tags">
          <span className="badge badge-primary">{getJobTypeBadge()}</span>
          {job.experienceLevel && (
            <span className="badge badge-gray">{getExperienceLevelBadge()}</span>
          )}
        </div>
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
