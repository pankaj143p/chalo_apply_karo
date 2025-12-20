package com.jobportal.application.service;

import com.jobportal.application.dto.*;
import com.jobportal.application.entity.ApplicationStatus;

public interface JobApplicationService {
    ApplicationResponse applyForJob(CreateApplicationRequest request, Long applicantId, String applicantName, String applicantEmail);
    ApplicationResponse updateApplication(Long applicationId, UpdateApplicationRequest request, Long userId, String userRole);
    ApplicationResponse getApplicationById(Long applicationId, Long userId);
    PagedResponse<ApplicationResponse> getMyApplications(Long applicantId, int page, int size);
    PagedResponse<ApplicationResponse> getApplicationsForEmployer(Long employerId, int page, int size);
    PagedResponse<ApplicationResponse> getApplicationsByJob(Long jobId, Long userId, int page, int size);
    PagedResponse<ApplicationResponse> getApplicationsByStatus(Long userId, String userRole, ApplicationStatus status, int page, int size);
    void withdrawApplication(Long applicationId, Long applicantId);
    boolean hasApplied(Long jobId, Long applicantId);
}
