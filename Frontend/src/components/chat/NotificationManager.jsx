import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import NotificationToast from './NotificationToast';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const { } = useChat();

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Listen for new message notifications
  useEffect(() => {
    const handleNewMessageNotification = (notification) => {
      // Only show toast if user is not on the chat page
      const isOnChatPage = window.location.pathname.includes('/chat');
      
      if (!isOnChatPage) {
        addNotification(notification);
      }
    };

    // This would be connected to the socket service
    // socketService.on('new_message_notification', handleNewMessageNotification);

    return () => {
      // socketService.off('new_message_notification', handleNewMessageNotification);
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationManager;
