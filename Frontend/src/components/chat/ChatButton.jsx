import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChatService } from '../../services/chat.service';

const ChatButton = ({
  recipientId,
  recipientName,
  recipientRole,
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  initialMessage = 'Hello! I would like to connect with you.'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!recipientId) {
    console.log('ChatButton: No recipientId provided');
    return null;
  }

  const handleChatClick = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }    if (!recipientId || recipientId === (user.id || user.id)) {
      setError('Cannot start chat with yourself');
      return;
    }

    console.log('Starting chat with:', { recipientId, recipientName, user: user });
    setLoading(true);
    setError(null);

    try {
      const response = await ChatService.initiateChat(recipientId, initialMessage);
      console.log('Chat initiated successfully:', response);
      if (user.role === 'recruiter') {
        navigate('/chat');
      } else {
        navigate('/user/chat');
      }
    } catch (err) {
      console.error('Error initiating chat:', err);
      setError(err.message || 'Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    icon: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 p-2'
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleChatClick}
          disabled={disabled || loading}
          className={buttonClasses}
          title={`Chat with ${recipientName || 'user'}`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
        
        {error && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 text-red-700 text-xs rounded shadow-lg whitespace-nowrap z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleChatClick}
        disabled={disabled || loading}
        className={buttonClasses}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
            Starting chat...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {recipientRole === 'recruiter' ? 'Message Recruiter' : 'Message Job Seeker'}
          </>
        )}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 text-red-700 text-xs rounded shadow-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatButton;
