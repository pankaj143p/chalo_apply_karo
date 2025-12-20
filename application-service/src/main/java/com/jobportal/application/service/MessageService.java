package com.jobportal.application.service;

import com.jobportal.application.dto.*;

import java.util.List;

public interface MessageService {
    MessageResponse sendMessage(SendMessageRequest request, Long senderId, String senderName);
    List<MessageResponse> getConversation(Long userId1, Long userId2);
    PagedResponse<MessageResponse> getMessagesByApplication(Long applicationId, int page, int size);
    List<ConversationResponse> getConversations(Long userId);
    long getUnreadCount(Long userId);
    void markAsRead(Long userId, Long senderId);
}
