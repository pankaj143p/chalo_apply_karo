package com.jobportal.application.service;

import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.entity.JobApplication;

public interface EmailService {
    void sendApplicationStatusEmail(JobApplication application, ApplicationStatus oldStatus, ApplicationStatus newStatus);
    void sendApplicationReceivedEmail(JobApplication application);
}
