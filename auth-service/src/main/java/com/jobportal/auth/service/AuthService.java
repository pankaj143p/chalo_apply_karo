package com.jobportal.auth.service;

import com.jobportal.auth.dto.*;
import com.jobportal.auth.entity.User;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser(Long userId);
    UserResponse updateUser(Long userId, UpdateUserRequest request);
    UserResponse getUserById(Long userId);
    boolean validateToken(String token);
}
