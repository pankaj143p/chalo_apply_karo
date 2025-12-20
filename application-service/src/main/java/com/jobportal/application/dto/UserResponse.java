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
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String companyName;
    private String bio;
    private String phoneNumber;
    private String profilePicture;
    private LocalDateTime createdAt;
}
