package com.jobportal.application.service.impl;

import com.jobportal.application.client.AuthServiceClient;
import com.jobportal.application.client.JobServiceClient;
import com.jobportal.application.dto.*;
import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.entity.JobApplication;
import com.jobportal.application.exception.BadRequestException;
import com.jobportal.application.exception.ResourceNotFoundException;
import com.jobportal.application.exception.UnauthorizedException;
import com.jobportal.application.repository.JobApplicationRepository;
import com.jobportal.application.service.EmailService;
import com.jobportal.application.service.JobApplicationService;
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
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobServiceClient jobServiceClient;
    private final AuthServiceClient authServiceClient;
    private final EmailService emailService;

    private static final String EMPLOYER_ROLE = "EMPLOYER";
    private static final String APPLICATION_NOT_FOUND = "Application not found with id: ";

    @Override
    @Transactional
    public ApplicationResponse applyForJob(CreateApplicationRequest request, Long applicantId, 
                                           String applicantName, String applicantEmail) {
        log.info("User {} applying for job {}", applicantId, request.getJobId());

        // Check if already applied
        if (applicationRepository.existsByJobIdAndApplicantId(request.getJobId(), applicantId)) {
            throw new BadRequestException("You have already applied for this job");
        }

        // Get job details
        JobResponse job;
        try {
            job = jobServiceClient.getJobById(request.getJobId(), applicantId);
        } catch (Exception e) {
            log.error("Error fetching job details: {}", e.getMessage());
            throw new ResourceNotFoundException("Job not found with id: " + request.getJobId());
        }

        // Cannot apply to own job
        if (job.getEmployerId().equals(applicantId)) {
            throw new BadRequestException("You cannot apply to your own job");
        }

        JobApplication application = JobApplication.builder()
                .jobId(request.getJobId())
                .jobTitle(job.getTitle())
                .companyName(job.getCompanyName())
                .applicantId(applicantId)
                .applicantName(applicantName)
                .applicantEmail(applicantEmail)
                .employerId(job.getEmployerId())
                .coverLetter(request.getCoverLetter())
                .resumeUrl(request.getResumeUrl())
                .status(ApplicationStatus.PENDING)
                .build();

        JobApplication savedApplication = applicationRepository.save(application);

        // Increment application count on job
        try {
            jobServiceClient.incrementApplicationCount(request.getJobId());
        } catch (Exception e) {
            log.warn("Failed to increment application count for job {}: {}", request.getJobId(), e.getMessage());
        }

        log.info("Application created successfully with id: {}", savedApplication.getId());

        // Send application received email to the applicant
        try {
            emailService.sendApplicationReceivedEmail(savedApplication);
        } catch (Exception e) {
            log.warn("Failed to send application received email: {}", e.getMessage());
        }

        return mapToResponse(savedApplication);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplication(Long applicationId, UpdateApplicationRequest request, 
                                                  Long userId, String userRole) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(APPLICATION_NOT_FOUND + applicationId));

        // Store old status for email notification
        ApplicationStatus oldStatus = application.getStatus();

        // Only employer can update status
        if (EMPLOYER_ROLE.equals(userRole)) {
            if (!application.getEmployerId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to update this application");
            }
            if (request.getStatus() != null) {
                application.setStatus(request.getStatus());
            }
            if (request.getNotes() != null) {
                application.setNotes(request.getNotes());
            }
        } else {
            throw new UnauthorizedException("Only employers can update application status");
        }

        JobApplication updatedApplication = applicationRepository.save(application);
        log.info("Application {} updated successfully", applicationId);

        // Send email notification if status changed
        if (request.getStatus() != null && oldStatus != request.getStatus()) {
            try {
                emailService.sendApplicationStatusEmail(updatedApplication, oldStatus, request.getStatus());
                log.info("Status change email queued for application {} ({}->{})", 
                    applicationId, oldStatus, request.getStatus());
            } catch (Exception e) {
                log.warn("Failed to send status change email: {}", e.getMessage());
            }
        }

        return mapToResponse(updatedApplication);
    }

    @Override
    public ApplicationResponse getApplicationById(Long applicationId, Long userId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(APPLICATION_NOT_FOUND + applicationId));

        // Check if user is authorized to view this application
        if (!application.getApplicantId().equals(userId) && !application.getEmployerId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to view this application");
        }

        return mapToResponse(application);
    }

    @Override
    public PagedResponse<ApplicationResponse> getMyApplications(Long applicantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<JobApplication> applicationPage = applicationRepository.findByApplicantId(applicantId, pageable);

        return mapToPagedResponse(applicationPage);
    }

    @Override
    public PagedResponse<ApplicationResponse> getApplicationsForEmployer(Long employerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<JobApplication> applicationPage = applicationRepository.findByEmployerId(employerId, pageable);

        return mapToPagedResponse(applicationPage);
    }

    @Override
    public PagedResponse<ApplicationResponse> getApplicationsByJob(Long jobId, Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<JobApplication> applicationPage = applicationRepository.findByJobId(jobId, pageable);

        // Verify that user is the employer of this job
        if (!applicationPage.isEmpty()) {
            JobApplication firstApp = applicationPage.getContent().get(0);
            if (!firstApp.getEmployerId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to view these applications");
            }
        }

        return mapToPagedResponse(applicationPage);
    }

    @Override
    public PagedResponse<ApplicationResponse> getApplicationsByStatus(Long userId, String userRole, 
                                                                       ApplicationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<JobApplication> applicationPage;

        if (EMPLOYER_ROLE.equals(userRole)) {
            applicationPage = applicationRepository.findByEmployerIdAndStatus(userId, status, pageable);
        } else {
            applicationPage = applicationRepository.findByApplicantIdAndStatus(userId, status, pageable);
        }

        return mapToPagedResponse(applicationPage);
    }

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, Long applicantId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(APPLICATION_NOT_FOUND + applicationId));

        if (!application.getApplicantId().equals(applicantId)) {
            throw new UnauthorizedException("You are not authorized to withdraw this application");
        }

        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Application is already withdrawn");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
        log.info("Application {} withdrawn successfully", applicationId);
    }

    @Override
    public boolean hasApplied(Long jobId, Long applicantId) {
        return applicationRepository.existsByJobIdAndApplicantId(jobId, applicantId);
    }

    private ApplicationResponse mapToResponse(JobApplication application) {
        return ApplicationResponse.builder()
                .id(application.getId())
                .jobId(application.getJobId())
                .jobTitle(application.getJobTitle())
                .companyName(application.getCompanyName())
                .applicantId(application.getApplicantId())
                .applicantName(application.getApplicantName())
                .applicantEmail(application.getApplicantEmail())
                .employerId(application.getEmployerId())
                .coverLetter(application.getCoverLetter())
                .resumeUrl(application.getResumeUrl())
                .status(application.getStatus())
                .notes(application.getNotes())
                .appliedAt(application.getAppliedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }

    private PagedResponse<ApplicationResponse> mapToPagedResponse(Page<JobApplication> applicationPage) {
        List<ApplicationResponse> content = applicationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<ApplicationResponse>builder()
                .content(content)
                .pageNumber(applicationPage.getNumber())
                .pageSize(applicationPage.getSize())
                .totalElements(applicationPage.getTotalElements())
                .totalPages(applicationPage.getTotalPages())
                .last(applicationPage.isLast())
                .first(applicationPage.isFirst())
                .build();
    }
}
