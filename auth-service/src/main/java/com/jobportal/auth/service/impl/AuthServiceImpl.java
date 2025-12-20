package com.jobportal.auth.service.impl;

import com.jobportal.auth.dto.*;
import com.jobportal.auth.entity.Role;
import com.jobportal.auth.entity.User;
import com.jobportal.auth.exception.BadRequestException;
import com.jobportal.auth.exception.ResourceNotFoundException;
import com.jobportal.auth.repository.UserRepository;
import com.jobportal.auth.security.JwtTokenProvider;
import com.jobportal.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .companyName(request.getRole() == Role.EMPLOYER ? request.getCompanyName() : null)
                .phoneNumber(request.getPhoneNumber())
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        String token = jwtTokenProvider.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .message("Registration successful")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt for email: {}", request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }

    @Override
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getCompanyName() != null) {
            user.setCompanyName(request.getCompanyName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getId());

        return mapToUserResponse(updatedUser);
    }

    @Override
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return mapToUserResponse(user);
    }

    @Override
    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .companyName(user.getCompanyName())
                .bio(user.getBio())
                .phoneNumber(user.getPhoneNumber())
                .profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
