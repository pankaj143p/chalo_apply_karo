import React, { useState, useEffect } from 'react';
import { FaUser, FaSave, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    skills: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      const data = response.data;
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        title: data.title || '',
        bio: data.bio || '',
        linkedinUrl: data.linkedinUrl || '',
        githubUrl: data.githubUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        skills: data.skills?.join(', ') || ''
      });
    } catch (error) {
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        ...profile,
        skills: profile.skills
          ? profile.skills.split(',').map(skill => skill.trim()).filter(Boolean)
          : []
      };
      
      const response = await authAPI.updateProfile(updateData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card card">
            <div className="profile-avatar">
              {profile.firstName?.charAt(0).toUpperCase() || 'U'}
              {profile.lastName?.charAt(0).toUpperCase() || ''}
            </div>
            <h2>{`${profile.firstName} ${profile.lastName}`.trim() || 'User'}</h2>
            {profile.title && <p className="profile-title">{profile.title}</p>}
            <p className="profile-role">{user?.role?.replace('_', ' ')}</p>
            
            {profile.location && (
              <p className="profile-location">
                <FaMapMarkerAlt /> {profile.location}
              </p>
            )}

            <div className="profile-links">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <FaGlobe />
                </a>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-details card">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Personal Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-input"
                      value={profile.firstName}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-input"
                      value={profile.lastName}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope /> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={profile.email}
                    disabled
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">
                      <FaPhone /> Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-input"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location">
                      <FaMapMarkerAlt /> Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="form-input"
                      value={profile.location}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Professional Information</h3>
                
                <div className="form-group">
                  <label htmlFor="title">
                    <FaBriefcase /> Professional Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    placeholder="e.g., Software Engineer"
                    value={profile.title}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    className="form-input"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={handleChange}
                    disabled={!editing}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="skills">Skills</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    className="form-input"
                    placeholder="e.g., JavaScript, React, Node.js"
                    value={profile.skills}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                  <small className="form-hint">Separate skills with commas</small>
                </div>
              </div>

              <div className="form-section">
                <h3>Social Links</h3>
                
                <div className="form-group">
                  <label htmlFor="linkedinUrl">
                    <FaLinkedin /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    className="form-input"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profile.linkedinUrl}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="githubUrl">
                    <FaGithub /> GitHub URL
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    className="form-input"
                    placeholder="https://github.com/yourusername"
                    value={profile.githubUrl}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="portfolioUrl">
                    <FaGlobe /> Portfolio URL
                  </label>
                  <input
                    type="url"
                    id="portfolioUrl"
                    name="portfolioUrl"
                    className="form-input"
                    placeholder="https://yourportfolio.com"
                    value={profile.portfolioUrl}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
              </div>

              {editing && (
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
