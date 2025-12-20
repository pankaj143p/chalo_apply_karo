package com.jobportal.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String location;
    private String jobType;
    private String experienceLevel;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency;
    private List<String> skills;
    private String requirements;
    private String benefits;
    private Long employerId;
    private String employerEmail;
    private String status;
    private LocalDateTime applicationDeadline;
    private Integer viewsCount;
    private Integer applicationsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
