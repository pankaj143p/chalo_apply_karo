package com.jobportal.application.repository;

import com.jobportal.application.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :userId OR m.receiverId = :userId) " +
           "ORDER BY m.sentAt DESC")
    Page<Message> findAllMessagesByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE " +
           "((m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1)) " +
           "ORDER BY m.sentAt ASC")
    List<Message> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    Page<Message> findByApplicationId(Long applicationId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.receiverId = :userId AND m.senderId = :senderId")
    void markMessagesAsRead(@Param("userId") Long userId, @Param("senderId") Long senderId);

    @Query("SELECT DISTINCT CASE WHEN m.senderId = :userId THEN m.receiverId ELSE m.senderId END " +
           "FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId")
    List<Long> findAllConversationPartners(@Param("userId") Long userId);
}
