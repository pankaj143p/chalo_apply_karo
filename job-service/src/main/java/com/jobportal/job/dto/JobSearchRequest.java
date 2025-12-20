package com.jobportal.job.dto;

import com.jobportal.job.entity.JobType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSearchRequest {
    private String keyword;
    private String location;
    private JobType jobType;
    private String skill;
    private String company;
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}
