import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { jobsAPI } from '../../services/api';
import './PostJob.css';

const PostJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: '',
    salaryMax: '',
    skills: '',
    companyName: '',
    status: 'ACTIVE',
    applicationDeadline: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchJob();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getJobById(id);
      const job = response.data;
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        location: job.location || '',
        jobType: job.jobType || 'FULL_TIME',
        experienceLevel: job.experienceLevel || 'MID',
        salaryMin: job.salaryMin || '',
        salaryMax: job.salaryMax || '',
        skills: job.skills?.join(', ') || '',
        companyName: job.companyName || '',
        status: job.status || 'ACTIVE',
        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.substring(0, 16) : ''
      });
    } catch (error) {
      toast.error('Error fetching job details');
      navigate('/employer/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    if (formData.title.trim().length < 3) {
      toast.error('Job title must be at least 3 characters');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return;
    }
    if (formData.description.trim().length < 50) {
      toast.error('Job description must be at least 50 characters');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSaving(true);
    try {
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        companyName: formData.companyName.trim(),
        location: formData.location.trim(),
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        salaryCurrency: 'INR',
        requirements: formData.requirements?.trim() || null,
        skills: formData.skills
          ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
          : [],
        applicationDeadline: formData.applicationDeadline ? formData.applicationDeadline + ':00' : null
      };

      if (isEditing) {
        // Include status only when editing
        jobData.status = formData.status;
        await jobsAPI.updateJob(id, jobData);
        toast.success('Job updated successfully');
      } else {
        await jobsAPI.createJob(jobData);
        toast.success('Job posted successfully');
      }
      navigate('/employer/jobs');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.validationErrors?.join(', ') ||
                          'Error saving job';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="post-job-page page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-job-page page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="form-card card">
          <div className="form-header">
            <h1>{isEditing ? 'Edit Job Posting' : 'Post New Job'}</h1>
            <p>{isEditing ? 'Update your job posting details' : 'Fill in the details to create a new job posting'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="form-group">
                <label htmlFor="title">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  className="form-input"
                  placeholder="e.g., Tech Corp Inc."
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-input"
                    placeholder="e.g., New York, NY"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jobType">Job Type</label>
                  <select
                    id="jobType"
                    name="jobType"
                    className="form-input form-select"
                    value={formData.jobType}
                    onChange={handleChange}
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="experienceLevel">Experience Level</label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    className="form-input form-select"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                  >
                    <option value="ENTRY">Entry Level</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid Level</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Lead</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="form-input form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="applicationDeadline">Application Deadline</label>
                <input
                  type="datetime-local"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  className="form-input"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <small className="form-hint">Leave empty if there's no deadline</small>
              </div>
            </div>

            <div className="form-section">
              <h2>Salary Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="salaryMin">Minimum Salary (₹ INR)</label>
                  <input
                    type="number"
                    id="salaryMin"
                    name="salaryMin"
                    className="form-input"
                    placeholder="e.g., 500000"
                    value={formData.salaryMin}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="salaryMax">Maximum Salary (₹ INR)</label>
                  <input
                    type="number"
                    id="salaryMax"
                    name="salaryMax"
                    className="form-input"
                    placeholder="e.g., 1200000"
                    value={formData.salaryMax}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Job Details</h2>
              
              <div className="form-group">
                <label htmlFor="description">Job Description *</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input"
                  rows="6"
                  placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="requirements">Requirements</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  className="form-input"
                  rows="4"
                  placeholder="List the qualifications, education, and experience required..."
                  value={formData.requirements}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="skills">Required Skills</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  className="form-input"
                  placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                  value={formData.skills}
                  onChange={handleChange}
                />
                <small className="form-hint">Separate skills with commas</small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/employer/jobs')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                <FaSave /> {saving ? 'Saving...' : isEditing ? 'Update Job' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
