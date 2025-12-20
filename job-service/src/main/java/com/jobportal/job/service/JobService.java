package com.jobportal.job.service;

import com.jobportal.job.dto.*;

import java.util.List;

public interface JobService {
    JobResponse createJob(CreateJobRequest request, Long employerId, String employerEmail);
    JobResponse updateJob(Long jobId, UpdateJobRequest request, Long employerId);
    void deleteJob(Long jobId, Long employerId);
    JobResponse getJobById(Long jobId, Long userId);
    PagedResponse<JobResponse> getJobsByEmployer(Long employerId, int page, int size);
    PagedResponse<JobResponse> searchJobs(JobSearchRequest request, Long userId);
    PagedResponse<JobResponse> getActiveJobs(int page, int size, Long userId);
    List<JobResponse> getLatestJobs(int limit);
    List<String> getAllLocations();
    List<String> getAllSkills();
    void incrementViewCount(Long jobId);
    void incrementApplicationCount(Long jobId);
}
