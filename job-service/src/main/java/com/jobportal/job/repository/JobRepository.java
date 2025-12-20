package com.jobportal.job.repository;

import com.jobportal.job.entity.Job;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.entity.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByEmployerId(Long employerId, Pageable pageable);

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = :status AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Job> searchByKeyword(@Param("keyword") String keyword, @Param("status") JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = :status AND LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    Page<Job> findByLocationContainingIgnoreCaseAndStatus(@Param("location") String location, @Param("status") JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = :status AND j.jobType = :jobType")
    Page<Job> findByJobTypeAndStatus(@Param("jobType") JobType jobType, @Param("status") JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j JOIN j.skills s WHERE j.status = :status AND LOWER(s) LIKE LOWER(CONCAT('%', :skill, '%'))")
    Page<Job> findBySkillAndStatus(@Param("skill") String skill, @Param("status") JobStatus status, Pageable pageable);

    @Query(value = "SELECT * FROM jobs j WHERE j.status = :status AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR :location = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:jobType IS NULL OR j.job_type = :jobType)",
           countQuery = "SELECT COUNT(*) FROM jobs j WHERE j.status = :status AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR :location = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:jobType IS NULL OR j.job_type = :jobType)",
           nativeQuery = true)
    Page<Job> searchJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("jobType") String jobType,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' ORDER BY j.createdAt DESC")
    List<Job> findLatestJobs(Pageable pageable);

    @Query("SELECT DISTINCT j.location FROM Job j WHERE j.status = 'ACTIVE'")
    List<String> findAllLocations();

    @Query("SELECT DISTINCT s FROM Job j JOIN j.skills s WHERE j.status = 'ACTIVE'")
    List<String> findAllSkills();
}
