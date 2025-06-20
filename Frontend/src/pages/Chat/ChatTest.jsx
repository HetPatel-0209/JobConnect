import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { ChatService } from '../../services/chat.service';
import ChatButton from '../../components/chat/ChatButton';

const ChatTest = () => {
  const { user } = useAuth();
  const {
    unreadCount,
    isSocketConnected,
    onlineUsers,
    messageStatuses,
    requestNotificationPermission,
    isUserOnline
  } = useChat();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date() }]);
  };

  const testChatService = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Get chats
      addTestResult('Get Chats', 'RUNNING', 'Fetching user chats...');
      const chatsResponse = await ChatService.getChats();
      addTestResult('Get Chats', 'SUCCESS', `Found ${chatsResponse.data?.length || 0} chats`);

      // Test 2: Get chat stats
      addTestResult('Get Chat Stats', 'RUNNING', 'Fetching chat statistics...');
      const statsResponse = await ChatService.getChatStats();
      addTestResult('Get Chat Stats', 'SUCCESS', `Unread messages: ${statsResponse.data?.totalUnreadMessages || 0}`);

      // Test 3: Search users (if implemented)
      try {
        addTestResult('Search Users', 'RUNNING', 'Searching for users...');
        const searchResponse = await ChatService.searchUsers('test');
        addTestResult('Search Users', 'SUCCESS', `Found ${searchResponse.data?.length || 0} users`);
      } catch (err) {
        addTestResult('Search Users', 'FAILED', err.message);
      }

    } catch (error) {
      addTestResult('Chat Service Test', 'FAILED', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testChatInitiation = async () => {
    if (!user) {
      addTestResult('Chat Initiation', 'FAILED', 'No user logged in');
      return;
    }

    // Test with a dummy recipient ID (you can replace with actual user ID)
    const testRecipientId = '68554cfc180d00a782c8eed3'; // Replace with actual user ID
    
    try {
      addTestResult('Chat Initiation', 'RUNNING', `Initiating chat with ${testRecipientId}...`);
      const response = await ChatService.initiateChat(testRecipientId, 'Test message from chat test page');
      addTestResult('Chat Initiation', 'SUCCESS', 'Chat initiated successfully');
    } catch (error) {
      addTestResult('Chat Initiation', 'FAILED', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Chat Feature Test</h1>
          
          {/* User Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User</h2>
            {user ? (
              <div>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>ID:</strong> {user.id || user._id}</p>
              </div>
            ) : (
              <p className="text-red-600">No user logged in</p>
            )}
          </div>

          {/* Chat Status */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-2">Chat Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Socket Connected:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    isSocketConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {isSocketConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </p>
                <p><strong>Unread Messages:</strong> {unreadCount}</p>
                <p><strong>Online Users:</strong> {onlineUsers.size}</p>
                <p><strong>Message Statuses:</strong> {messageStatuses.size}</p>
              </div>
              <div>
                <p><strong>Notification Permission:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    Notification.permission === 'granted' ? 'bg-green-200 text-green-800' :
                    Notification.permission === 'denied' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {Notification.permission}
                  </span>
                </p>
                <button
                  onClick={requestNotificationPermission}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Request Permission
                </button>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="mb-6 space-y-4">
            <button
              onClick={testChatService}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Chat Service'}
            </button>

            <button
              onClick={testChatInitiation}
              disabled={loading || !user}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
            >
              Test Chat Initiation
            </button>
          </div>

          {/* Sample Chat Button */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Chat Button</h2>
            <ChatButton
              recipientId="68554cfc180d00a782c8eed3" // Replace with actual user ID
              recipientName="Test User"
              recipientRole="recruiter"
              variant="primary"
              initialMessage="Hello! This is a test message from the chat test page."
            />
          </div>

          {/* Test Results */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.result === 'SUCCESS'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : result.result === 'FAILED'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{result.test}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          result.result === 'SUCCESS'
                            ? 'bg-green-200 text-green-800'
                            : result.result === 'FAILED'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {result.result}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {result.details && (
                      <p className="mt-1 text-sm">{result.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
              <li>Make sure you're logged in as a user</li>
              <li>Click "Test Chat Service" to verify API connectivity</li>
              <li>Click "Test Chat Initiation" to test creating a chat</li>
              <li>Try the sample chat button to test the UI component</li>
              <li>Check the browser console for detailed logs</li>
              <li>Check the backend terminal for API calls</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTest;
