import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatService } from '../../services/chat.service';
import socketService from '../../services/socket.service';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';

const ChatPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Debug logging
  console.log('ChatPage rendered with user:', user);
  console.log('Current chats:', chats);
  console.log('Active chat:', activeChat);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Connecting to socket with user:', user);
        socketService.connect(token);
      }
    }

    return () => {
      if (activeChat) {
        socketService.leaveChat(activeChat._id);
      }
    };
  }, [user]);

  // Set up socket event listeners
  useEffect(() => {
    const handleNewMessage = (message) => {
      // Add message to current chat if it matches
      if (activeChat && message.chat === activeChat._id) {
        setMessages(prev => [...prev, message]);
      }
      
      // Refresh chat list to update last message
      fetchChats();
    };

    const handleMessageNotification = (notification) => {
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Refresh chat list
      fetchChats();
    };

    const handleTypingStatus = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return prev.includes(data.userId) ? prev : [...prev, data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });
      }
    };

    const handleMessagesRead = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        // Update message read status
        setMessages(prev => prev.map(msg => {
          if (!data.messageIds || data.messageIds.includes(msg._id)) {
            return {
              ...msg,
              readBy: [...(msg.readBy || []), { user: data.userId, readAt: new Date() }]
            };
          }
          return msg;
        }));
      }
    };

    // Register event listeners
    socketService.on('receive_message', handleNewMessage);
    socketService.on('new_message_notification', handleMessageNotification);
    socketService.on('typing_status', handleTypingStatus);
    socketService.on('messages_read', handleMessagesRead);

    return () => {
      socketService.off('receive_message', handleNewMessage);
      socketService.off('new_message_notification', handleMessageNotification);
      socketService.off('typing_status', handleTypingStatus);
      socketService.off('messages_read', handleMessagesRead);
    };
  }, [activeChat]);

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
    fetchChatStats();
  }, []);

  // Join chat room when active chat changes
  useEffect(() => {
    if (activeChat) {
      socketService.joinChat(activeChat._id);
      fetchMessages(activeChat._id);
      
      // Clear typing users when switching chats
      setTypingUsers([]);
    }

    return () => {
      if (activeChat) {
        socketService.leaveChat(activeChat._id);
      }
    };
  }, [activeChat]);

  const fetchChats = async () => {
    try {
      console.log('Fetching chats...');
      const response = await ChatService.getChats();
      console.log('Chats response:', response);
      setChats(response.data || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setMessagesLoading(true);
    try {
      const response = await ChatService.getChatMessages(chatId);
      setMessages(response.data?.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchChatStats = async () => {
    try {
      const response = await ChatService.getChatStats();
      setUnreadCount(response.data?.totalUnreadMessages || 0);
    } catch (err) {
      console.error('Error fetching chat stats:', err);
    }
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
  };

  const handleSendMessage = async (recipientId, content) => {
    try {
      // Send via socket for real-time delivery
      if (activeChat) {
        socketService.sendMessage(activeChat._id, content);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleMarkAsRead = async (chatId) => {
    try {
      await ChatService.markChatAsRead(chatId);
      socketService.markMessagesAsRead(chatId);
      
      // Update local unread count
      const chat = chats.find(c => c._id === chatId);
      if (chat && chat.unreadCount) {
        setUnreadCount(prev => Math.max(0, prev - chat.unreadCount));
      }
      
      // Refresh chats to update unread counts
      fetchChats();
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleTyping = (chatId, isTyping) => {
    socketService.sendTypingStatus(chatId, isTyping);
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await ChatService.deleteChat(chatId);
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        
        if (activeChat && activeChat._id === chatId) {
          setActiveChat(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Error deleting chat:', err);
        setError('Failed to delete chat');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white pt-20">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ChatList
            chats={chats}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            onDeleteChat={handleDeleteChat}
            currentUserId={user?.id}
            loading={loading}
          />
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        <ChatWindow
          chat={activeChat}
          messages={messages}
          currentUserId={user?.id}
          onSendMessage={handleSendMessage}
          onMarkAsRead={handleMarkAsRead}
          onTyping={handleTyping}
          typingUsers={typingUsers}
          loading={messagesLoading}
        />
      </div>
    </div>
  );
};

export default ChatPage;
