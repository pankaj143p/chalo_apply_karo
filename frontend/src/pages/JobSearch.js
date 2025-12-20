import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { jobsAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import './JobSearch.css';

const JobSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, isJobSeeker } = useAuth();

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || ''
  });

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.location && { location: filters.location }),
        ...(filters.jobType && { jobType: filters.jobType })
      };
      
      const response = await jobsAPI.searchJobs(params);
      setJobs(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    
    const params = new URLSearchParams();
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.location) params.set('location', filters.location);
    if (filters.jobType) params.set('jobType', filters.jobType);
    setSearchParams(params);
    
    fetchJobs();
  };

  const handleFavoriteToggle = async (jobId, isFavorite) => {
    if (!isAuthenticated || !isJobSeeker) {
      toast.info('Please login as a job seeker to save jobs');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(jobId);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.addToFavorites(jobId);
        toast.success('Added to favorites');
      }
      
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, isFavorite: !isFavorite } : job
      ));
    } catch (error) {
      toast.error('Error updating favorites');
    }
  };

  return (
    <div className="job-search-page page">
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <h1 className="page-title">Find Your Perfect Job</h1>
          <p className="page-subtitle">Browse through thousands of job listings</p>
        </div>

        {/* Search Form */}
        <form className="search-form card" onSubmit={handleSearch}>
          <div className="search-inputs">
            <div className="search-input-group">
              <FaSearch />
              <input
                type="text"
                placeholder="Job title, keywords..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div className="search-input-group">
              <FaMapMarkerAlt />
              <input
                type="text"
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button
              type="button"
              className="btn btn-secondary filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="search-filters">
              <div className="filter-group">
                <label>Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                  className="form-input form-select"
                >
                  <option value="">All Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>
          )}
        </form>

        {/* Results */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="search-results-info">
              <span>{jobs.length} jobs found</span>
            </div>

            {jobs.length === 0 ? (
              <div className="empty-state">
                <FaSearch className="empty-state-icon" />
                <h3 className="empty-state-title">No jobs found</h3>
                <p className="empty-state-text">
                  Try adjusting your search criteria or browse all jobs
                </p>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onFavoriteToggle={handleFavoriteToggle}
                    showFavorite={isAuthenticated && isJobSeeker}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
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

export default JobSearch;
