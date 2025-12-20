package com.jobportal.auth.controller;

import com.jobportal.auth.dto.*;
import com.jobportal.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @RequestHeader("X-User-Id") Long userId) {
        log.info("Get current user request for userId: {}", userId);
        UserResponse response = authService.getCurrentUser(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateUserRequest request) {
        log.info("Update user request for userId: {}", userId);
        UserResponse response = authService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        log.info("Get user by id request for userId: {}", userId);
        UserResponse response = authService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestParam(name = "token") String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(isValid);
    }
}
