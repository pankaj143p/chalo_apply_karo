package com.jobportal.job.controller;

import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.dto.PagedResponse;
import com.jobportal.job.service.FavoriteJobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs/favorites")
@RequiredArgsConstructor
@Slf4j
public class FavoriteJobController {

    private final FavoriteJobService favoriteJobService;

    @PostMapping("/{jobId}")
    public ResponseEntity<Map<String, String>> addToFavorites(
            @PathVariable(name = "jobId") Long jobId,
            @RequestHeader(name = "X-User-Id") Long userId) {
        
        log.info("Add job {} to favorites for user {}", jobId, userId);
        favoriteJobService.addToFavorites(jobId, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Job added to favorites"));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Map<String, String>> removeFromFavorites(
            @PathVariable(name = "jobId") Long jobId,
            @RequestHeader(name = "X-User-Id") Long userId) {
        
        log.info("Remove job {} from favorites for user {}", jobId, userId);
        favoriteJobService.removeFromFavorites(jobId, userId);
        return ResponseEntity.ok(Map.of("message", "Job removed from favorites"));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<JobResponse>> getFavoriteJobs(
            @RequestHeader(name = "X-User-Id") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        
        log.info("Get favorite jobs for user {}", userId);
        PagedResponse<JobResponse> response = favoriteJobService.getFavoriteJobs(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{jobId}/status")
    public ResponseEntity<Map<String, Boolean>> checkFavoriteStatus(
            @PathVariable(name = "jobId") Long jobId,
            @RequestHeader(name = "X-User-Id") Long userId) {
        
        boolean isFavorite = favoriteJobService.isFavorite(jobId, userId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
}
