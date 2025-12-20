package com.jobportal.application.repository;

import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Page<JobApplication> findByApplicantId(Long applicantId, Pageable pageable);

    Page<JobApplication> findByEmployerId(Long employerId, Pageable pageable);

    Page<JobApplication> findByJobId(Long jobId, Pageable pageable);

    Optional<JobApplication> findByJobIdAndApplicantId(Long jobId, Long applicantId);

    boolean existsByJobIdAndApplicantId(Long jobId, Long applicantId);

    Page<JobApplication> findByEmployerIdAndStatus(Long employerId, ApplicationStatus status, Pageable pageable);

    Page<JobApplication> findByApplicantIdAndStatus(Long applicantId, ApplicationStatus status, Pageable pageable);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.jobId = :jobId")
    long countByJobId(@Param("jobId") Long jobId);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.employerId = :employerId AND a.status = :status")
    long countByEmployerIdAndStatus(@Param("employerId") Long employerId, @Param("status") ApplicationStatus status);

    List<JobApplication> findByJobIdIn(List<Long> jobIds);
}
