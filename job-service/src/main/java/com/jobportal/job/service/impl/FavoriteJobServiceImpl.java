package com.jobportal.job.service.impl;

import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.dto.PagedResponse;
import com.jobportal.job.entity.FavoriteJob;
import com.jobportal.job.entity.Job;
import com.jobportal.job.exception.BadRequestException;
import com.jobportal.job.exception.ResourceNotFoundException;
import com.jobportal.job.repository.FavoriteJobRepository;
import com.jobportal.job.repository.JobRepository;
import com.jobportal.job.service.FavoriteJobService;
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
public class FavoriteJobServiceImpl implements FavoriteJobService {

    private final FavoriteJobRepository favoriteJobRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional
    public void addToFavorites(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (favoriteJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new BadRequestException("Job is already in favorites");
        }

        FavoriteJob favoriteJob = FavoriteJob.builder()
                .userId(userId)
                .job(job)
                .build();

        favoriteJobRepository.save(favoriteJob);
        log.info("Job {} added to favorites for user {}", jobId, userId);
    }

    @Override
    @Transactional
    public void removeFromFavorites(Long jobId, Long userId) {
        if (!favoriteJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new ResourceNotFoundException("Job is not in favorites");
        }

        favoriteJobRepository.deleteByUserIdAndJobId(userId, jobId);
        log.info("Job {} removed from favorites for user {}", jobId, userId);
    }

    @Override
    public PagedResponse<JobResponse> getFavoriteJobs(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<FavoriteJob> favoritePage = favoriteJobRepository.findByUserId(userId, pageable);

        List<JobResponse> content = favoritePage.getContent().stream()
                .map(fav -> mapToJobResponse(fav.getJob(), true))
                .collect(Collectors.toList());

        return PagedResponse.<JobResponse>builder()
                .content(content)
                .pageNumber(favoritePage.getNumber())
                .pageSize(favoritePage.getSize())
                .totalElements(favoritePage.getTotalElements())
                .totalPages(favoritePage.getTotalPages())
                .last(favoritePage.isLast())
                .first(favoritePage.isFirst())
                .build();
    }

    @Override
    public boolean isFavorite(Long jobId, Long userId) {
        return favoriteJobRepository.existsByUserIdAndJobId(userId, jobId);
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
}
