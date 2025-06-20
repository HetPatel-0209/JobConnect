import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';

const ChatList = ({
  chats = [],
  activeChat,
  onChatSelect,
  loading = false,
  onDeleteChat = null,
  currentUserId
}) => {
  const { isUserOnline } = useChat();

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat.participants || !Array.isArray(chat.participants)) return null;
    return chat.participants.find(p =>
      p.user._id !== currentUserId &&
      p.user.id !== currentUserId
    )?.user;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (!content) return 'No messages yet';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!chats.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-lg font-medium">No conversations yet</p>
        <p className="text-sm">Start a conversation to see it here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {chats.map((chat) => {
        const otherParticipant = getOtherParticipant(chat);
        const isActive = activeChat && activeChat._id === chat._id;
        
        if (!otherParticipant) return null;

        return (
          <div
            key={chat._id}
            onClick={() => onChatSelect(chat)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
              isActive ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar with online indicator */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {getInitials(otherParticipant.name)}
                </div>
                {/* Online indicator */}
                {isUserOnline(otherParticipant._id) && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {otherParticipant.name}
                  </h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.updatedAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage 
                      ? truncateMessage(chat.lastMessage.content)
                      : 'No messages yet'
                    }
                  </p>
                  
                  {/* Unread count */}
                  {chat.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  )}
                </div>
                
                {/* User role badge */}
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    otherParticipant.role === 'recruiter' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {otherParticipant.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                  </span>
                </div>
              </div>
              
              {/* Delete button */}
              {onDeleteChat && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat._id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  title="Delete chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
