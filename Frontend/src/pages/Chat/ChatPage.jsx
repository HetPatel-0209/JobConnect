import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';

const ChatPage = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    chats,
    activeChat,
    messages,
    loading,
    error,
    typingUsers,
    unreadCount,
    initialized,
    setActiveChat,
    fetchMessages,
    sendMessage,
    markChatAsRead,
    deleteChat,
    sendTypingStatus,
    fetchChats
  } = useChat();

  const [messagesLoading, setMessagesLoading] = useState(false);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      setMessagesLoading(true);
      fetchMessages(activeChat._id).finally(() => {
        setMessagesLoading(false);
      });
    }
  }, [activeChat]); // Removed fetchMessages from dependencies to prevent infinite loop  // Simple backup mechanism for ChatPage
  useEffect(() => {
    if (user && !authLoading && initialized && chats.length === 0 && !loading) {
      console.log('ChatPage: User ready but no chats, triggering fetch');
      const timer = setTimeout(() => {
        fetchChats(true);
      }, 3000); // Increased delay to prevent rapid firing

      return () => clearTimeout(timer);
    }
  }, [user, authLoading, initialized]); // Removed chats.length and loading to prevent infinite loop// Handle page reload recovery (run only when user/auth state changes)
  useEffect(() => {
    if (user && !authLoading && !initialized) {
      console.log('ChatPage: Ensuring chat functionality after potential page reload');
      // Small delay to allow context to initialize
      const timer = setTimeout(() => {
        console.log('ChatPage: Context not initialized, triggering initialization');
        fetchChats(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, authLoading, initialized]); // Removed fetchChats from dependencies to prevent infinite loop

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
  };

  const handleSendMessage = async (recipientId, content) => {
    try {
      await sendMessage(recipientId, content);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (chatId) => {
    try {
      await markChatAsRead(chatId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = (chatId, isTyping) => {
    sendTypingStatus(chatId, isTyping);
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteChat(chatId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Add a manual refresh button for debugging
  const handleRefreshChats = () => {
    console.log('Manual refresh triggered');
    fetchChats(true);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">
            {authLoading ? 'Loading authentication...' : 'Loading chats...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white pt-20">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button
              onClick={handleRefreshChats}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Chats: {chats.length} | User: {user?.name || 'None'} | Auth: {authLoading ? 'Loading' : 'Ready'} | Init: {initialized ? 'Yes' : 'No'}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 && !loading && (
            <div className="p-4 text-center">
              <p className="text-gray-500 mb-4">No chats found</p>
              <button
                onClick={handleRefreshChats}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load Chats
              </button>
            </div>
          )}
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
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Reload Page
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
