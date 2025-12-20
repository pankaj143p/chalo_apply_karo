package com.jobportal.application.client;

import com.jobportal.application.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "AUTH-SERVICE")
public interface AuthServiceClient {

    @GetMapping("/api/auth/users/{userId}")
    UserResponse getUserById(@PathVariable("userId") Long userId);
}
