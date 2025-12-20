package com.jobportal.job.dto;

import com.jobportal.job.entity.ExperienceLevel;
import com.jobportal.job.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CreateJobRequest {

    @NotBlank(message = "Job title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    @Size(min = 50, max = 10000, message = "Description must be between 50 and 10000 characters")
    private String description;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Job type is required")
    private JobType jobType;

    private ExperienceLevel experienceLevel;

    private BigDecimal salaryMin;

    private BigDecimal salaryMax;

    private String salaryCurrency;

    private List<String> skills;

    private String requirements;

    private String benefits;

    private LocalDateTime applicationDeadline;
}
