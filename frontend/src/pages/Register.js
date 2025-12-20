import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaBriefcase, FaBuilding, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'JOB_SEEKER',
    companyName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.role === 'EMPLOYER' ? formData.companyName : null,
        phoneNumber: formData.phoneNumber
      });
      
      toast.success('Registration successful!');
      
      if (user.role === 'EMPLOYER') {
        navigate('/employer/dashboard');
      } else {
        navigate('/jobseeker/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <FaBriefcase />
              <span>JobPortal</span>
            </Link>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join us to find your dream job or hire talent</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'JOB_SEEKER' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'JOB_SEEKER' })}
              >
                <FaUser />
                Job Seeker
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'EMPLOYER' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
              >
                <FaBuilding />
                Employer
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <FaUser />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.role === 'EMPLOYER' && (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <div className="input-with-icon">
                  <FaBuilding />
                  <input
                    type="text"
                    name="companyName"
                    className="form-input"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <div className="input-with-icon">
                <FaPhone />
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FaLock />
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <FaLock />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg auth-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
