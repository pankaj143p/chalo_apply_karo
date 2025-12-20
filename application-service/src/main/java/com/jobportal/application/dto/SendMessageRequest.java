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
public class SendMessageRequest {

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    private Long applicationId;

    private Long jobId;

    @NotBlank(message = "Message content is required")
    private String content;
}
