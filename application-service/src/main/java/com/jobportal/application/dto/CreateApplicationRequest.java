package com.jobportal.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateApplicationRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotBlank(message = "Cover letter is required")
    private String coverLetter;

    private String resumeUrl;
}
