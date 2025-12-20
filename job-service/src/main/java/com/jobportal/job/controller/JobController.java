package com.jobportal.job.controller;

import com.jobportal.job.dto.*;
import com.jobportal.job.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobController {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Email") String userEmail,
            @RequestHeader(name = "X-User-Role") String userRole) {
        
        if (!"EMPLOYER".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Create job request from employer: {}", userId);
        JobResponse response = jobService.createJob(request, userId, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable(name = "jobId") Long jobId,
            @Valid @RequestBody UpdateJobRequest request,
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Role") String userRole) {
        
        if (!"EMPLOYER".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Update job request for jobId: {} from employer: {}", jobId, userId);
        JobResponse response = jobService.updateJob(jobId, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable(name = "jobId") Long jobId,
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Role") String userRole) {
        
        if (!"EMPLOYER".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Delete job request for jobId: {} from employer: {}", jobId, userId);
        jobService.deleteJob(jobId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable(name = "jobId") Long jobId,
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        
        log.info("Get job by id: {}", jobId);
        jobService.incrementViewCount(jobId);
        JobResponse response = jobService.getJobById(jobId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employer/my-jobs")
    public ResponseEntity<PagedResponse<JobResponse>> getMyJobs(
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Role") String userRole,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        
        if (!"EMPLOYER".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Get jobs for employer: {}", userId);
        PagedResponse<JobResponse> response = jobService.getJobsByEmployer(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<JobResponse>> searchJobs(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "jobType", required = false) String jobType,
            @RequestParam(name = "skill", required = false) String skill,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortDirection", defaultValue = "DESC") String sortDirection,
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        
        log.info("Search jobs with keyword: {}, location: {}", keyword, location);
        
        JobSearchRequest request = JobSearchRequest.builder()
                .keyword(keyword)
                .location(location)
                .jobType(jobType != null ? com.jobportal.job.entity.JobType.valueOf(jobType) : null)
                .skill(skill)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();
        
        PagedResponse<JobResponse> response = jobService.searchJobs(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/active")
    public ResponseEntity<PagedResponse<JobResponse>> getActiveJobs(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        
        log.info("Get active jobs, page: {}, size: {}", page, size);
        PagedResponse<JobResponse> response = jobService.getActiveJobs(page, size, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/latest")
    public ResponseEntity<List<JobResponse>> getLatestJobs(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        
        log.info("Get latest {} jobs", limit);
        List<JobResponse> response = jobService.getLatestJobs(limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/locations")
    public ResponseEntity<List<String>> getAllLocations() {
        List<String> locations = jobService.getAllLocations();
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/public/skills")
    public ResponseEntity<List<String>> getAllSkills() {
        List<String> skills = jobService.getAllSkills();
        return ResponseEntity.ok(skills);
    }

    @PostMapping("/{jobId}/increment-applications")
    public ResponseEntity<Void> incrementApplicationCount(@PathVariable(name = "jobId") Long jobId) {
        jobService.incrementApplicationCount(jobId);
        return ResponseEntity.ok().build();
    }
}
