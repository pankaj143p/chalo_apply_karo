package com.jobportal.job.service;

import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.dto.PagedResponse;

public interface FavoriteJobService {
    void addToFavorites(Long jobId, Long userId);
    void removeFromFavorites(Long jobId, Long userId);
    PagedResponse<JobResponse> getFavoriteJobs(Long userId, int page, int size);
    boolean isFavorite(Long jobId, Long userId);
}
