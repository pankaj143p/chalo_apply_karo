package com.jobportal.job.service.impl;

import com.jobportal.job.dto.*;
import com.jobportal.job.entity.Job;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.exception.ResourceNotFoundException;
import com.jobportal.job.exception.UnauthorizedException;
import com.jobportal.job.repository.FavoriteJobRepository;
import com.jobportal.job.repository.JobRepository;
import com.jobportal.job.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final FavoriteJobRepository favoriteJobRepository;

    @Override
    @Transactional
    public JobResponse createJob(CreateJobRequest request, Long employerId, String employerEmail) {
        log.info("Creating new job by employer: {}", employerId);

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .companyName(request.getCompanyName())
                .location(request.getLocation())
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .salaryCurrency(request.getSalaryCurrency() != null ? request.getSalaryCurrency() : "INR")
                .skills(request.getSkills())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .employerId(employerId)
                .employerEmail(employerEmail)
                .status(JobStatus.ACTIVE)
                .applicationDeadline(request.getApplicationDeadline())
                .viewsCount(0)
                .applicationsCount(0)
                .build();

        Job savedJob = jobRepository.save(job);
        log.info("Job created successfully with id: {}", savedJob.getId());

        return mapToJobResponse(savedJob, null);
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long jobId, UpdateJobRequest request, Long employerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (!job.getEmployerId().equals(employerId)) {
            throw new UnauthorizedException("You are not authorized to update this job");
        }

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getCompanyName() != null) job.setCompanyName(request.getCompanyName());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getJobType() != null) job.setJobType(request.getJobType());
        if (request.getExperienceLevel() != null) job.setExperienceLevel(request.getExperienceLevel());
        if (request.getSalaryMin() != null) job.setSalaryMin(request.getSalaryMin());
        if (request.getSalaryMax() != null) job.setSalaryMax(request.getSalaryMax());
        if (request.getSalaryCurrency() != null) job.setSalaryCurrency(request.getSalaryCurrency());
        if (request.getSkills() != null) job.setSkills(request.getSkills());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getBenefits() != null) job.setBenefits(request.getBenefits());
        if (request.getStatus() != null) job.setStatus(request.getStatus());
        if (request.getApplicationDeadline() != null) job.setApplicationDeadline(request.getApplicationDeadline());

        Job updatedJob = jobRepository.save(job);
        log.info("Job updated successfully: {}", updatedJob.getId());

        return mapToJobResponse(updatedJob, null);
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, Long employerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (!job.getEmployerId().equals(employerId)) {
            throw new UnauthorizedException("You are not authorized to delete this job");
        }

        // Soft delete - set status to INACTIVE instead of removing from database
        job.setStatus(JobStatus.INACTIVE);
        jobRepository.save(job);
        log.info("Job deactivated successfully: {}", jobId);
    }

    @Override
    public JobResponse getJobById(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        Boolean isFavorite = null;
        if (userId != null) {
            isFavorite = favoriteJobRepository.existsByUserIdAndJobId(userId, jobId);
        }

        return mapToJobResponse(job, isFavorite);
    }

    @Override
    public PagedResponse<JobResponse> getJobsByEmployer(Long employerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobPage = jobRepository.findByEmployerId(employerId, pageable);

        return mapToPagedResponse(jobPage, null);
    }

    @Override
    public PagedResponse<JobResponse> searchJobs(JobSearchRequest request, Long userId) {
        // Convert camelCase to snake_case for native query sorting
        String sortColumn = camelToSnake(request.getSortBy());
        Sort sort = Sort.by(
                request.getSortDirection().equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortColumn
        );
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Job> jobPage = jobRepository.searchJobs(
                request.getKeyword(),
                request.getLocation(),
                request.getJobType() != null ? request.getJobType().name() : null,
                JobStatus.ACTIVE.name(),
                pageable
        );

        return mapToPagedResponse(jobPage, userId);
    }

    // Helper method to convert camelCase to snake_case
    private String camelToSnake(String str) {
        if (str == null) return null;
        return str.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }

    @Override
    public PagedResponse<JobResponse> getActiveJobs(int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobPage = jobRepository.findByStatus(JobStatus.ACTIVE, pageable);

        return mapToPagedResponse(jobPage, userId);
    }

    @Override
    public List<JobResponse> getLatestJobs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Job> jobs = jobRepository.findLatestJobs(pageable);

        return jobs.stream()
                .map(job -> mapToJobResponse(job, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAllLocations() {
        return jobRepository.findAllLocations();
    }

    @Override
    public List<String> getAllSkills() {
        return jobRepository.findAllSkills();
    }

    @Override
    @Transactional
    public void incrementViewCount(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        job.setViewsCount(job.getViewsCount() + 1);
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void incrementApplicationCount(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);
    }

    private JobResponse mapToJobResponse(Job job, Boolean isFavorite) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .companyName(job.getCompanyName())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryCurrency(job.getSalaryCurrency())
                .skills(job.getSkills())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .employerId(job.getEmployerId())
                .employerEmail(job.getEmployerEmail())
                .status(job.getStatus())
                .applicationDeadline(job.getApplicationDeadline())
                .viewsCount(job.getViewsCount())
                .applicationsCount(job.getApplicationsCount())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .isFavorite(isFavorite)
                .build();
    }

    private PagedResponse<JobResponse> mapToPagedResponse(Page<Job> jobPage, Long userId) {
        List<JobResponse> content = jobPage.getContent().stream()
                .map(job -> {
                    Boolean isFavorite = null;
                    if (userId != null) {
                        isFavorite = favoriteJobRepository.existsByUserIdAndJobId(userId, job.getId());
                    }
                    return mapToJobResponse(job, isFavorite);
                })
                .collect(Collectors.toList());

        return PagedResponse.<JobResponse>builder()
                .content(content)
                .pageNumber(jobPage.getNumber())
                .pageSize(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .last(jobPage.isLast())
                .first(jobPage.isFirst())
                .build();
    }
}
