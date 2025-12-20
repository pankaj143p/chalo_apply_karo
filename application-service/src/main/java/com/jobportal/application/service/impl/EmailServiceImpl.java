package com.jobportal.application.service.impl;

import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.entity.JobApplication;
import com.jobportal.application.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@jobportal.com}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean emailEnabled;

    @Override
    @Async
    public void sendApplicationStatusEmail(JobApplication application, ApplicationStatus oldStatus, ApplicationStatus newStatus) {
        if (!emailEnabled) {
            log.info("Email notifications disabled. Would have sent status change email to: {}", application.getApplicantEmail());
            return;
        }

        String subject;
        String body;

        if (newStatus == ApplicationStatus.OFFERED || newStatus == ApplicationStatus.ACCEPTED) {
            subject = "🎉 Congratulations! You've been selected for " + application.getJobTitle();
            body = buildAcceptedEmailBody(application);
        } else if (newStatus == ApplicationStatus.REJECTED) {
            subject = "Update on your application for " + application.getJobTitle();
            body = buildRejectedEmailBody(application);
        } else if (newStatus == ApplicationStatus.REVIEWED) {
            subject = "Your application for " + application.getJobTitle() + " is under review";
            body = buildReviewedEmailBody(application);
        } else if (newStatus == ApplicationStatus.SHORTLISTED) {
            subject = "🌟 Great news! You've been shortlisted for " + application.getJobTitle();
            body = buildShortlistedEmailBody(application);
        } else if (newStatus == ApplicationStatus.INTERVIEW) {
            subject = "📅 Interview scheduled for " + application.getJobTitle();
            body = buildInterviewEmailBody(application);
        } else {
            subject = "Application Status Update - " + application.getJobTitle();
            body = buildGenericEmailBody(application, newStatus);
        }

        sendEmail(application.getApplicantEmail(), subject, body);
    }

    @Override
    @Async
    public void sendApplicationReceivedEmail(JobApplication application) {
        if (!emailEnabled) {
            log.info("Email notifications disabled. Would have sent application received email to: {}", application.getApplicantEmail());
            return;
        }

        String subject = "Application Received - " + application.getJobTitle() + " at " + application.getCompanyName();
        String body = buildApplicationReceivedEmailBody(application);

        sendEmail(application.getApplicantEmail(), subject, body);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildAcceptedEmailBody(JobApplication application) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .highlight { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Congratulations!</h1>
                        <p>You've Been Selected!</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <div class="highlight">
                            <h3 style="margin-top: 0; color: #4caf50;">Great News!</h3>
                            <p>We are thrilled to inform you that your application for the position of <strong>%s</strong> at <strong>%s</strong> has been <strong>ACCEPTED</strong>!</p>
                        </div>
                        
                        <p>The hiring team was impressed with your qualifications and experience. They will be reaching out to you shortly with the next steps in the hiring process.</p>
                        
                        <p><strong>What's Next?</strong></p>
                        <ul>
                            <li>Expect a call or email from the HR team within the next few days</li>
                            <li>Prepare any documents they might request</li>
                            <li>Review the job description once more before your discussion</li>
                        </ul>
                        
                        <p>Best of luck with the next steps!</p>
                        
                        <p>Best Regards,<br><strong>Job Portal Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Job Portal. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                application.getApplicantName(),
                application.getJobTitle(),
                application.getCompanyName()
            );
    }

    private String buildRejectedEmailBody(JobApplication application) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Application Update</h1>
                        <p>%s</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <p>Thank you for your interest in the <strong>%s</strong> position at <strong>%s</strong> and for taking the time to apply.</p>
                        
                        <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current requirements.</p>
                        
                        <div class="info-box">
                            <p><strong>Don't be discouraged!</strong></p>
                            <p>This decision was incredibly difficult, and it does not reflect on your abilities or potential. We encourage you to continue applying for positions that match your skills and experience.</p>
                        </div>
                        
                        <p>We wish you all the best in your job search and future career endeavors.</p>
                        
                        <p>Best Regards,<br><strong>Job Portal Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Job Portal. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                application.getCompanyName(),
                application.getApplicantName(),
                application.getJobTitle(),
                application.getCompanyName()
            );
    }

    private String buildReviewedEmailBody(JobApplication application) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Application Under Review</h1>
                        <p>Good news! Your application is being reviewed</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <div class="info-box">
                            <p>Your application for <strong>%s</strong> at <strong>%s</strong> is now being reviewed by the hiring team.</p>
                        </div>
                        
                        <p>This means your profile has caught their attention and they're taking a closer look at your qualifications.</p>
                        
                        <p><strong>What does this mean?</strong></p>
                        <ul>
                            <li>Your application has moved past the initial screening</li>
                            <li>The hiring team is evaluating your profile in detail</li>
                            <li>You may be contacted for the next steps if you're shortlisted</li>
                        </ul>
                        
                        <p>We'll keep you updated on any further developments. Keep an eye on your inbox!</p>
                        
                        <p>Best Regards,<br><strong>Job Portal Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Job Portal. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                application.getApplicantName(),
                application.getJobTitle(),
                application.getCompanyName()
            );
    }

    private String buildGenericEmailBody(JobApplication application, ApplicationStatus status) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Application Status Update</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <p>Your application for <strong>%s</strong> at <strong>%s</strong> has been updated.</p>
                        
                        <p><strong>New Status:</strong> %s</p>
                        
                        <p>Best Regards,<br><strong>Job Portal Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Job Portal. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                application.getApplicantName(),
                application.getJobTitle(),
                application.getCompanyName(),
                status.name()
            );
    }

    private String buildApplicationReceivedEmailBody(JobApplication application) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Application Received</h1>
                        <p>Thank you for applying!</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <div class="info-box">
                            <p>Your application for <strong>%s</strong> at <strong>%s</strong> has been successfully submitted!</p>
                        </div>
                        
                        <p><strong>What happens next?</strong></p>
                        <ul>
                            <li>The hiring team will review your application</li>
                            <li>If your profile matches their requirements, they'll contact you</li>
                            <li>You can track your application status on the Job Portal</li>
                        </ul>
                        
                        <p>Thank you for using Job Portal. Good luck with your application!</p>
                        
                        <p>Best Regards,<br><strong>Job Portal Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Job Portal. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                application.getApplicantName(),
                application.getJobTitle(),
                application.getCompanyName()
            );
    }

    private String buildShortlistedEmailBody(JobApplication application) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .highlight { background: #fff8e1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌟 You've Been Shortlisted!</h1>
                        <p>Great progress on your application</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <div class="highlight">
                            <h3 style="margin-top: 0; color: #f57c00;">Exciting News!</h3>
                            <p>You have been <strong>shortlisted</strong> for the position of <strong>%s</strong> at <strong>%s</strong>!</p>
                        </div>
                        
                        <p>This means your profile has impressed the hiring team and you're among the top candidates being considered for this role.</p>
                        
                        <p><strong>What to expect next:</strong></p>
                        <ul>
                            <li>The hiring team may reach out to schedule an interview</li>
                            <li>Keep your phone and email accessible</li>
                            <li>Review the job requirements and prepare accordingly</li>
                        </ul>
                        
                        <p>Best of luck!</p>
                        
                        <p>Best Regards,<br><strong>Job Portal Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Job Portal. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                application.getApplicantName(),
                application.getJobTitle(),
                application.getCompanyName()
            );
    }

    private String buildInterviewEmailBody(JobApplication application) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .highlight { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📅 Interview Stage</h1>
                        <p>You're moving forward!</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <div class="highlight">
                            <h3 style="margin-top: 0; color: #1976d2;">Interview Update</h3>
                            <p>Your application for <strong>%s</strong> at <strong>%s</strong> has progressed to the <strong>interview stage</strong>!</p>
                        </div>
                        
                        <p>The hiring team will contact you soon with interview details including date, time, and format (in-person/virtual).</p>
                        
                        <p><strong>Tips to prepare:</strong></p>
                        <ul>
                            <li>Research the company and its culture</li>
                            <li>Review the job description thoroughly</li>
                            <li>Prepare examples of your relevant experience</li>
                            <li>Have questions ready for the interviewer</li>
                        </ul>
                        
                        <p>Good luck with your interview!</p>
                        
                        <p>Best Regards,<br><strong>Job Portal Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Job Portal. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                application.getApplicantName(),
                application.getJobTitle(),
                application.getCompanyName()
            );
    }
}
