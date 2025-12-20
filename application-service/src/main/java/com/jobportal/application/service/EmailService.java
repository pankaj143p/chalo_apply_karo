package com.jobportal.application.service;

import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.entity.JobApplication;

public interface EmailService {
    void sendApplicationStatusEmail(JobApplication application, ApplicationStatus oldStatus, ApplicationStatus newStatus);
    void sendApplicationReceivedEmail(JobApplication application);
    void sendInterviewScheduleEmail(JobApplication application, String interviewDate, String interviewTime, String interviewType, String interviewLink, String additionalNotes);
    void sendSelectionEmail(JobApplication application, String salary, String joiningDate, String additionalNotes);
}
