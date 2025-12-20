import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaPaperPlane, FaUser, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Messages.css';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    // Check if redirected with userId
    const userId = searchParams.get('userId');
    if (userId) {
      // Start new conversation or select existing
      handleStartConversation(userId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data);
      
      // Auto-select first conversation if exists
      if (response.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data[0]);
        fetchMessages(response.data[0].id);
      }
    } catch (error) {
      toast.error('Error fetching conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messagesAPI.getMessages(conversationId);
      setMessages(response.data);
    } catch (error) {
      toast.error('Error fetching messages');
    }
  };

  const handleStartConversation = async (userId) => {
    try {
      const response = await messagesAPI.startConversation(userId);
      setSelectedConversation(response.data);
      fetchConversations();
      fetchMessages(response.data.id);
    } catch (error) {
      toast.error('Error starting conversation');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await messagesAPI.sendMessage({
        conversationId: selectedConversation.id,
        content: newMessage.trim()
      });
      setNewMessage('');
      fetchMessages(selectedConversation.id);
      fetchConversations(); // Update last message in conversation list
    } catch (error) {
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="messages-page page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page page">
      <div className="container">
        <div className="messages-container card">
          {/* Conversations List */}
          <div className="conversations-sidebar">
            <div className="sidebar-header">
              <h2>Messages</h2>
            </div>
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="conversations-list">
              {filteredConversations.length === 0 ? (
                <div className="empty-conversations">
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="conversation-avatar">
                      {conv.participantName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="conversation-info">
                      <h4>{conv.participantName}</h4>
                      <p className="last-message">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                    {conv.lastMessageTime && (
                      <span className="message-time">{formatTime(conv.lastMessageTime)}</span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <div className="chat-participant">
                    <div className="participant-avatar">
                      {selectedConversation.participantName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3>{selectedConversation.participantName}</h3>
                  </div>
                </div>

                <div className="messages-list">
                  {messages.length === 0 ? (
                    <div className="empty-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.senderId === user?.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">{formatTime(message.sentAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="message-input-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()}>
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="no-conversation-selected">
                <FaUser className="icon" />
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
