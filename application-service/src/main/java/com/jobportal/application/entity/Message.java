package com.jobportal.application.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Column(name = "receiver_name")
    private String receiverName;

    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "job_id")
    private Long jobId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;
}
