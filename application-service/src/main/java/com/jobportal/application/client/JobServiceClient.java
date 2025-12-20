package com.jobportal.application.client;

import com.jobportal.application.dto.JobResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "JOB-SERVICE")
public interface JobServiceClient {

    @GetMapping("/api/jobs/{jobId}")
    JobResponse getJobById(
            @PathVariable("jobId") Long jobId,
            @RequestHeader("X-User-Id") Long userId);

    @PostMapping("/api/jobs/{jobId}/increment-applications")
    void incrementApplicationCount(@PathVariable("jobId") Long jobId);
}
