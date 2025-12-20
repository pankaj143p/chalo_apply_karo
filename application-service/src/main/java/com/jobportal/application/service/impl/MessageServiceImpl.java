package com.jobportal.application.service.impl;

import com.jobportal.application.client.AuthServiceClient;
import com.jobportal.application.dto.*;
import com.jobportal.application.entity.Message;
import com.jobportal.application.repository.MessageRepository;
import com.jobportal.application.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final AuthServiceClient authServiceClient;

    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, Long senderId, String senderName) {
        log.info("User {} sending message to user {}", senderId, request.getReceiverId());

        // Get receiver name
        String receiverName = "User";
        try {
            UserResponse receiver = authServiceClient.getUserById(request.getReceiverId());
            receiverName = receiver.getName();
        } catch (Exception e) {
            log.warn("Could not fetch receiver details: {}", e.getMessage());
        }

        Message message = Message.builder()
                .senderId(senderId)
                .senderName(senderName)
                .receiverId(request.getReceiverId())
                .receiverName(receiverName)
                .applicationId(request.getApplicationId())
                .jobId(request.getJobId())
                .content(request.getContent())
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        log.info("Message sent successfully with id: {}", savedMessage.getId());

        return mapToResponse(savedMessage);
    }

    @Override
    public List<MessageResponse> getConversation(Long userId1, Long userId2) {
        List<Message> messages = messageRepository.findConversation(userId1, userId2);
        return messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PagedResponse<MessageResponse> getMessagesByApplication(Long applicationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "sentAt"));
        Page<Message> messagePage = messageRepository.findByApplicationId(applicationId, pageable);

        List<MessageResponse> content = messagePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<MessageResponse>builder()
                .content(content)
                .pageNumber(messagePage.getNumber())
                .pageSize(messagePage.getSize())
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .last(messagePage.isLast())
                .first(messagePage.isFirst())
                .build();
    }

    @Override
    public List<ConversationResponse> getConversations(Long userId) {
        List<Long> partnerIds = messageRepository.findAllConversationPartners(userId);
        List<ConversationResponse> conversations = new ArrayList<>();

        for (Long partnerId : partnerIds) {
            List<Message> messages = messageRepository.findConversation(userId, partnerId);
            if (!messages.isEmpty()) {
                Message lastMessage = messages.get(messages.size() - 1);
                
                String partnerName = "User";
                try {
                    UserResponse partner = authServiceClient.getUserById(partnerId);
                    partnerName = partner.getName();
                } catch (Exception e) {
                    log.warn("Could not fetch partner details: {}", e.getMessage());
                }

                long unreadCount = messages.stream()
                        .filter(m -> m.getReceiverId().equals(userId) && !m.getIsRead())
                        .count();

                conversations.add(ConversationResponse.builder()
                        .partnerId(partnerId)
                        .partnerName(partnerName)
                        .lastMessage(lastMessage.getContent())
                        .lastMessageTime(lastMessage.getSentAt())
                        .unreadCount(unreadCount)
                        .build());
            }
        }

        // Sort by last message time
        conversations.sort((a, b) -> b.getLastMessageTime().compareTo(a.getLastMessageTime()));

        return conversations;
    }

    @Override
    public long getUnreadCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long senderId) {
        messageRepository.markMessagesAsRead(userId, senderId);
        log.info("Messages from {} to {} marked as read", senderId, userId);
    }

    private MessageResponse mapToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .receiverId(message.getReceiverId())
                .receiverName(message.getReceiverName())
                .applicationId(message.getApplicationId())
                .jobId(message.getJobId())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .sentAt(message.getSentAt())
                .build();
    }
}
