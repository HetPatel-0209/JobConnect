import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';

const MessageBubble = ({ message, isOwnMessage, showAvatar = true, isLastInGroup = true }) => {
  const { getMessageStatus } = useChat();

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const messageStatus = getMessageStatus(message._id);

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (messageStatus.read) {
      return (
        <div className="flex items-center" title="Read">
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
          <svg className="w-3 h-3 text-blue-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        </div>
      );
    } else if (messageStatus.delivered) {
      return (
        <div className="flex items-center" title="Delivered">
          <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
          <svg className="w-3 h-3 text-gray-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        </div>
      );
    } else if (messageStatus.sent) {
      return (
        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20" title="Sent">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-3 h-3 text-gray-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20" title="Sending">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className={`flex items-end gap-2 mb-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
          {getInitials(message.sender?.name)}
        </div>
      )}
      
      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
        {/* Sender name (only for received messages) */}
        {!isOwnMessage && showAvatar && (
          <div className="text-xs text-gray-500 mb-1 px-3">
            {message.sender?.name || 'Unknown User'}
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-lg break-words ${
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        
        {/* Timestamp and read status */}
        {isLastInGroup && (
          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
            isOwnMessage ? 'justify-end' : 'justify-start'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {isOwnMessage && (
              <span className="flex items-center gap-1">
                {getStatusIcon()}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Own message avatar space */}
      {showAvatar && isOwnMessage && (
        <div className="w-8 h-8 flex-shrink-0" />
      )}
    </div>
  );
};

export default MessageBubble;
