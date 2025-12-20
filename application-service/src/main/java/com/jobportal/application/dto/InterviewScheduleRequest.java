package com.jobportal.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InterviewScheduleRequest {
    
    @NotBlank(message = "Interview date is required")
    private String interviewDate;
    
    @NotBlank(message = "Interview time is required")
    private String interviewTime;
    
    @NotBlank(message = "Interview type is required")
    private String interviewType; // Online, In-Person, Phone
    
    private String interviewLink; // For online interviews
    
    private String additionalNotes;
}
