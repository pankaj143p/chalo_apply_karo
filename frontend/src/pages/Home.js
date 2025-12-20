import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaUsers, FaBuilding, FaArrowRight } from 'react-icons/fa';
import { jobsAPI } from '../services/api';
import JobCard from '../components/JobCard';
import './Home.css';

const Home = () => {
  const [latestJobs, setLatestJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchLatestJobs();
  }, []);

  const fetchLatestJobs = async () => {
    try {
      const response = await jobsAPI.getLatestJobs(6);
      setLatestJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.append('keyword', searchKeyword);
    if (searchLocation) params.append('location', searchLocation);
    window.location.href = `/jobs?${params.toString()}`;
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Your <span>Dream Job</span> Today
            </h1>
            <p className="hero-subtitle">
              Connect with top employers and discover opportunities that match your skills and aspirations.
            </p>
            
            <form className="hero-search" onSubmit={handleSearch}>
              <div className="hero-search-input">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="hero-search-input">
                <FaMapMarkerAlt />
                <input
                  type="text"
                  placeholder="City or location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg">
                Search Jobs
              </button>
            </form>

            <div className="hero-stats">
              <div className="hero-stat">
                <FaBriefcase />
                <span><strong>10,000+</strong> Jobs</span>
              </div>
              <div className="hero-stat">
                <FaBuilding />
                <span><strong>5,000+</strong> Companies</span>
              </div>
              <div className="hero-stat">
                <FaUsers />
                <span><strong>50,000+</strong> Job Seekers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="latest-jobs">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Latest Job Openings</h2>
              <p className="section-subtitle">Discover the most recent opportunities from top companies</p>
            </div>
            <Link to="/jobs" className="btn btn-secondary">
              View All Jobs <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="jobs-grid">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} showFavorite={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <p className="section-subtitle text-center">Get started in three simple steps</p>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Create Account</h3>
              <p className="step-description">Sign up as a job seeker or employer to get started</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Find or Post Jobs</h3>
              <p className="step-description">Search for jobs or post openings to find the perfect match</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Connect & Succeed</h3>
              <p className="step-description">Apply for jobs or review applications and hire talent</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Take the Next Step?</h2>
            <p className="cta-subtitle">Join thousands of job seekers and employers already using our platform</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/jobs" className="btn btn-secondary btn-lg">
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
