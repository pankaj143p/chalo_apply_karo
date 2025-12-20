package com.jobportal.application.dto;

import com.jobportal.application.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private Long employerId;
    private String coverLetter;
    private String resumeUrl;
    private ApplicationStatus status;
    private String notes;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
