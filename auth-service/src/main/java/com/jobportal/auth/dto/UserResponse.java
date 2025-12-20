package com.jobportal.auth.dto;

import com.jobportal.auth.entity.Role;
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
    private Role role;
    private String companyName;
    private String bio;
    private String phoneNumber;
    private String profilePicture;
    private LocalDateTime createdAt;
}
