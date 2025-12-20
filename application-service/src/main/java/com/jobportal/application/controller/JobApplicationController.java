package com.jobportal.application.controller;

import com.jobportal.application.dto.*;
import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
public class JobApplicationController {

    private final JobApplicationService applicationService;

    private static final String JOB_SEEKER_ROLE = "JOB_SEEKER";

    @PostMapping
    public ResponseEntity<ApplicationResponse> applyForJob(
            @Valid @RequestBody CreateApplicationRequest request,
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Email") String userEmail,
            @RequestHeader(name = "X-User-Role") String userRole) {

        if (!JOB_SEEKER_ROLE.equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("Apply for job request from user: {}", userId);
        // Using email as name for now, could be enhanced to fetch from auth service
        ApplicationResponse response = applicationService.applyForJob(request, userId, userEmail, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> updateApplication(
            @PathVariable(name = "applicationId") Long applicationId,
            @Valid @RequestBody UpdateApplicationRequest request,
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Role") String userRole) {

        log.info("Update application request for applicationId: {}", applicationId);
        ApplicationResponse response = applicationService.updateApplication(applicationId, request, userId, userRole);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable(name = "applicationId") Long applicationId,
            @RequestBody Map<String, String> statusRequest,
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Role") String userRole) {

        log.info("Update application status for applicationId: {} to {}", applicationId, statusRequest.get("status"));
        
        UpdateApplicationRequest request = new UpdateApplicationRequest();
        request.setStatus(ApplicationStatus.valueOf(statusRequest.get("status")));
        
        ApplicationResponse response = applicationService.updateApplication(applicationId, request, userId, userRole);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplicationById(
            @PathVariable(name = "applicationId") Long applicationId,
            @RequestHeader(name = "X-User-Id") Long userId) {

        log.info("Get application by id: {}", applicationId);
        ApplicationResponse response = applicationService.getApplicationById(applicationId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-applications")
    public ResponseEntity<PagedResponse<ApplicationResponse>> getMyApplications(
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        log.info("Get applications for user: {}", userId);
        PagedResponse<ApplicationResponse> response = applicationService.getMyApplications(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employer/applications")
    public ResponseEntity<PagedResponse<ApplicationResponse>> getApplicationsForEmployer(
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Role") String userRole,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        if (!"EMPLOYER".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("Get applications for employer: {}", userId);
        PagedResponse<ApplicationResponse> response = applicationService.getApplicationsForEmployer(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<PagedResponse<ApplicationResponse>> getApplicationsByJob(
            @PathVariable(name = "jobId") Long jobId,
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        log.info("Get applications for job: {}", jobId);
        PagedResponse<ApplicationResponse> response = applicationService.getApplicationsByJob(jobId, userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<PagedResponse<ApplicationResponse>> getApplicationsByStatus(
            @PathVariable(name = "status") ApplicationStatus status,
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Role") String userRole,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        log.info("Get applications by status: {} for user: {}", status, userId);
        PagedResponse<ApplicationResponse> response = applicationService.getApplicationsByStatus(userId, userRole, status, page, size);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{applicationId}/withdraw")
    public ResponseEntity<Map<String, String>> withdrawApplication(
            @PathVariable(name = "applicationId") Long applicationId,
            @RequestHeader(name = "X-User-Id") Long userId) {

        log.info("Withdraw application: {} by user: {}", applicationId, userId);
        applicationService.withdrawApplication(applicationId, userId);
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }

    @GetMapping("/check/{jobId}")
    public ResponseEntity<Map<String, Boolean>> checkIfApplied(
            @PathVariable(name = "jobId") Long jobId,
            @RequestHeader(name = "X-User-Id") Long userId) {

        boolean hasApplied = applicationService.hasApplied(jobId, userId);
        return ResponseEntity.ok(Map.of("hasApplied", hasApplied));
    }
}
