import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { favoritesAPI } from '../../services/api';
import JobCard from '../../components/JobCard';
import './FavoriteJobs.css';

const FavoriteJobs = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoritesAPI.getMyFavorites({ page, size: 10 });
      setFavorites(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error fetching favorite jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (jobId) => {
    try {
      await favoritesAPI.removeFromFavorites(jobId);
      toast.success('Removed from favorites');
      setFavorites(favorites.filter(job => job.id !== jobId));
    } catch (error) {
      toast.error('Error removing from favorites');
    }
  };

  return (
    <div className="favorite-jobs-page page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Saved Jobs</h1>
            <p>Jobs you've saved for later</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="card empty-state-card">
            <div className="empty-state">
              <FaHeart className="empty-state-icon" />
              <h3>No saved jobs yet</h3>
              <p>Start saving jobs you're interested in to easily find them later</p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="favorites-grid">
              {favorites.map((job) => (
                <div key={job.id} className="favorite-item">
                  <JobCard 
                    job={job} 
                    onFavoriteToggle={() => handleRemoveFavorite(job.id)}
                    showFavorite={true}
                    isFavorite={true}
                  />
                </div>
              ))}
            </div>

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

export default FavoriteJobs;
