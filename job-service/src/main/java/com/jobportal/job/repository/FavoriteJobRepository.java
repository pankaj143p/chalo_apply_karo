package com.jobportal.job.repository;

import com.jobportal.job.entity.FavoriteJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteJobRepository extends JpaRepository<FavoriteJob, Long> {
    
    Page<FavoriteJob> findByUserId(Long userId, Pageable pageable);
    
    Optional<FavoriteJob> findByUserIdAndJobId(Long userId, Long jobId);
    
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    
    void deleteByUserIdAndJobId(Long userId, Long jobId);
}
