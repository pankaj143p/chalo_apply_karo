package com.jobportal.application.controller;

import com.jobportal.application.dto.*;
import com.jobportal.application.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Email") String userEmail) {

        log.info("Send message request from user: {}", userId);
        MessageResponse response = messageService.sendMessage(request, userId, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/conversation/{partnerId}")
    public ResponseEntity<List<MessageResponse>> getConversation(
            @PathVariable Long partnerId,
            @RequestHeader("X-User-Id") Long userId) {

        log.info("Get conversation between {} and {}", userId, partnerId);
        
        // Mark messages as read
        messageService.markAsRead(userId, partnerId);
        
        List<MessageResponse> response = messageService.getConversation(userId, partnerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<PagedResponse<MessageResponse>> getMessagesByApplication(
            @PathVariable Long applicationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        log.info("Get messages for application: {}", applicationId);
        PagedResponse<MessageResponse> response = messageService.getMessagesByApplication(applicationId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @RequestHeader("X-User-Id") Long userId) {

        log.info("Get all conversations for user: {}", userId);
        List<ConversationResponse> response = messageService.getConversations(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("X-User-Id") Long userId) {

        long count = messageService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping("/mark-read/{senderId}")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long senderId,
            @RequestHeader("X-User-Id") Long userId) {

        log.info("Mark messages from {} as read for user: {}", senderId, userId);
        messageService.markAsRead(userId, senderId);
        return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
    }
}
