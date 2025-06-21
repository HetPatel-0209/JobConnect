import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useChat } from '../../contexts/ChatContext';

const ChatWindow = ({
  chat,
  messages = [],
  currentUserId,
  onSendMessage,
  onMarkAsRead,
  onTyping = null,
  typingUsers = [],
  loading = false,
  onLoadMore = null,
  hasMore = false
}) => {
  const { isUserOnline } = useChat();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldScrollToBottom]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chat && messages.length > 0 && onMarkAsRead) {
      const unreadMessages = messages.filter(msg => 
        msg.sender._id !== currentUserId && 
        !msg.readBy?.some(read => read.user === currentUserId)
      );
      
      if (unreadMessages.length > 0) {
        onMarkAsRead(chat._id);
      }
    }
  }, [chat, messages, currentUserId, onMarkAsRead]);

  // Handle scroll to detect if user is at bottom
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
      setShouldScrollToBottom(isAtBottom);
      
      // Load more messages if scrolled to top
      if (scrollTop === 0 && hasMore && onLoadMore) {
        onLoadMore();
      }
    }
  };

  const handleSendMessage = (content) => {
    if (onSendMessage && chat) {
      const otherParticipant = chat.participants.find(p =>
        p.user._id !== currentUserId &&
        p.user.id !== currentUserId
      );
      if (otherParticipant) {
        onSendMessage(otherParticipant.user._id, content);
        setShouldScrollToBottom(true);
      }
    }
  };

  const handleTyping = (typing) => {
    setIsTyping(typing);
    if (onTyping && chat) {
      onTyping(chat._id, typing);
    }
  };

  const getOtherParticipant = () => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find(p =>
      p.user._id !== currentUserId &&
      p.user.id !== currentUserId
    )?.user;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const groupMessages = (messages) => {
    const groups = [];
    let currentGroup = [];
    let lastSenderId = null;
    let lastTimestamp = null;

    messages.forEach((message, index) => {
      const timeDiff = lastTimestamp ? new Date(message.timestamp) - new Date(lastTimestamp) : 0;
      const shouldGroup = message.sender._id === lastSenderId && timeDiff < 5 * 60 * 1000; // 5 minutes

      if (shouldGroup) {
        currentGroup.push(message);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      }

      lastSenderId = message.sender._id;
      lastTimestamp = message.timestamp;

      // Add the last group
      if (index === messages.length - 1) {
        groups.push(currentGroup);
      }
    });

    return groups;
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium">Select a conversation</h3>
          <p className="text-sm">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();
  const messageGroups = groupMessages(messages);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            {getInitials(otherParticipant?.name)}
          </div>
          {/* Online indicator */}
          {isUserOnline(otherParticipant?._id) && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {otherParticipant?.name || 'Unknown User'}
          </h2>
          <p className="text-sm text-gray-500">
            {isUserOnline(otherParticipant?._id) ? (
              <span className="text-green-600">Online</span>
            ) : (
              <span>{otherParticipant?.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
      >
        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {hasMore && !loading && (
          <div className="text-center py-2">
            <button 
              onClick={onLoadMore}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Load more messages
            </button>
          </div>
        )}

        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {group.map((message, messageIndex) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={message.sender._id === currentUserId}
                showAvatar={messageIndex === 0}
                isLastInGroup={messageIndex === group.length - 1}
              />
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <span className="text-sm text-gray-500 italic">
              {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={loading}
        placeholder={`Message ${otherParticipant?.name || 'user'}...`}
      />
    </div>
  );
};

export default ChatWindow;
