package com.jobportal.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private Long applicationId;
    private Long jobId;
    private String content;
    private Boolean isRead;
    private LocalDateTime sentAt;
}
