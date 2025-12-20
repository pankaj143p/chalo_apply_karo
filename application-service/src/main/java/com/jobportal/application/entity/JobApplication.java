package com.jobportal.application.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"job_id", "applicant_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "applicant_id", nullable = false)
    private Long applicantId;

    @Column(name = "applicant_name")
    private String applicantName;

    @Column(name = "applicant_email")
    private String applicantEmail;

    @Column(name = "employer_id", nullable = false)
    private Long employerId;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
