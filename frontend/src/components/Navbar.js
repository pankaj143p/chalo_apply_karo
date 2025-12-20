import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBriefcase, FaBars, FaTimes, FaUser, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isEmployer, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    return isEmployer ? '/employer/dashboard' : '/jobseeker/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <FaBriefcase />
          <span>JobPortal</span>
        </Link>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/jobs" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Find Jobs
          </Link>
          
          {isAuthenticated && isEmployer && (
            <>
              <Link to="/employer/jobs/new" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Post a Job
              </Link>
              <Link to="/employer/jobs" className="navbar-link" onClick={() => setMenuOpen(false)}>
                My Jobs
              </Link>
              <Link to="/employer/applications" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Applications
              </Link>
            </>
          )}

          {isAuthenticated && !isEmployer && (
            <>
              <Link to="/jobseeker/applications" className="navbar-link" onClick={() => setMenuOpen(false)}>
                My Applications
              </Link>
              <Link to="/jobseeker/favorites" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Saved Jobs
              </Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/messages" className="navbar-icon-btn">
                <FaEnvelope />
              </Link>
              
              <div className="navbar-dropdown">
                <button 
                  className="navbar-user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="navbar-avatar">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="navbar-user-name">{user?.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="navbar-dropdown-menu">
                    <Link 
                      to={getDashboardLink()} 
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaBriefcase /> Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUser /> Profile
                    </Link>
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          <button 
            className="navbar-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
