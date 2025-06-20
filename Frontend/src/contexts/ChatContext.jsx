import React, { createContext, useState, useContext, useEffect } from 'react';
import { ChatService } from '../services/chat.service';
import socketService from '../services/socket.service';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [messageStatuses, setMessageStatuses] = useState(new Map()); // messageId -> status

    // Initialize socket connection when user changes
    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            if (token) {
                // Add a small delay to ensure the component is mounted
                setTimeout(() => {
                    socketService.connect(token);
                }, 100);
            }
            fetchChats();
            fetchChatStats();

            // Request notification permission
            requestNotificationPermission();
        } else {
            socketService.disconnect();
            setChats([]);
            setActiveChat(null);
            setMessages([]);
            setUnreadCount(0);
            setTypingUsers([]);
            setIsSocketConnected(false);
            setOnlineUsers(new Set());
            setMessageStatuses(new Map());
        }
    }, [user]);

    // Set up socket event listeners
    useEffect(() => {
        const handleAuthenticated = (data) => {
            setIsSocketConnected(true);
            console.log('Socket authenticated:', data);
        };

        const handleAuthError = (error) => {
            setIsSocketConnected(false);
            console.error('Socket auth error:', error);
        };

        const handleNewMessage = (message) => {
            // Add message to current chat if it matches
            if (activeChat && message.chat === activeChat._id) {
                setMessages(prev => [...prev, message]);

                // Confirm message delivery if it's not from current user
                if (message.sender._id !== user?.id && message.sender._id !== user?._id) {
                    socketService.confirmMessageDelivery(message._id, message.chat);
                }
            }

            // Update message status
            setMessageStatuses(prev => new Map(prev.set(message._id, {
                sent: true,
                delivered: message.status?.delivered || false,
                read: message.status?.read || false
            })));

            // Refresh chat list to update last message
            fetchChats();
        };

        const handleMessageNotification = (notification) => {
            // Update unread count with the actual count from notification
            if (notification.unreadCount) {
                setUnreadCount(prev => prev + notification.unreadCount);
            } else {
                setUnreadCount(prev => prev + 1);
            }

            // Show browser notification if supported and permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`New message from ${notification.message.sender.name}`, {
                    body: notification.message.content,
                    icon: '/favicon.ico'
                });
            }

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

        const handleUserOnline = (data) => {
            setOnlineUsers(prev => new Set([...prev, data.userId]));
        };

        const handleUserOffline = (data) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        };

        const handleMessageDelivered = (data) => {
            setMessageStatuses(prev => {
                const newMap = new Map(prev);
                const currentStatus = newMap.get(data.messageId) || {};
                newMap.set(data.messageId, {
                    ...currentStatus,
                    delivered: true,
                    deliveredAt: data.deliveredAt
                });
                return newMap;
            });
        };

        const handleMessageRead = (data) => {
            setMessageStatuses(prev => {
                const newMap = new Map(prev);
                const currentStatus = newMap.get(data.messageId) || {};
                newMap.set(data.messageId, {
                    ...currentStatus,
                    read: true,
                    readAt: data.readAt
                });
                return newMap;
            });
        };

        // Register event listeners
        socketService.on('authenticated', handleAuthenticated);
        socketService.on('auth_error', handleAuthError);
        socketService.on('receive_message', handleNewMessage);
        socketService.on('new_message_notification', handleMessageNotification);
        socketService.on('typing_status', handleTypingStatus);
        socketService.on('messages_read', handleMessagesRead);
        socketService.on('user_online', handleUserOnline);
        socketService.on('user_offline', handleUserOffline);
        socketService.on('message_delivered', handleMessageDelivered);
        socketService.on('message_read', handleMessageRead);

        return () => {
            socketService.off('authenticated', handleAuthenticated);
            socketService.off('auth_error', handleAuthError);
            socketService.off('receive_message', handleNewMessage);
            socketService.off('new_message_notification', handleMessageNotification);
            socketService.off('typing_status', handleTypingStatus);
            socketService.off('messages_read', handleMessagesRead);
            socketService.off('user_online', handleUserOnline);
            socketService.off('user_offline', handleUserOffline);
            socketService.off('message_delivered', handleMessageDelivered);
            socketService.off('message_read', handleMessageRead);
        };
    }, [activeChat]);

    // Join chat room when active chat changes
    useEffect(() => {
        if (activeChat && isSocketConnected) {
            socketService.joinChat(activeChat._id);
            fetchMessages(activeChat._id);

            // Clear typing users when switching chats
            setTypingUsers([]);
        }

        return () => {
            if (activeChat && isSocketConnected) {
                socketService.leaveChat(activeChat._id);
            }
        };
    }, [activeChat, isSocketConnected]);

    const fetchChats = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await ChatService.getChats();
            setChats(response.data || []);
        } catch (err) {
            console.error('Error fetching chats:', err);
            setError('Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId) => {
        setLoading(true);
        try {
            const response = await ChatService.getChatMessages(chatId);
            setMessages(response.data?.messages || []);
        } catch (err) {
            console.error(`Error fetching messages for chat ${chatId}:`, err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (recipientId, content) => {
        try {
            // Send via socket for real-time delivery
            if (activeChat && isSocketConnected) {
                socketService.sendMessage(activeChat._id, content);
            } else {
                // Fallback to HTTP API
                const response = await ChatService.sendMessage(recipientId, content);

                // Update messages if this is for the active chat
                if (activeChat && response.data) {
                    setMessages(prevMessages => [...prevMessages, response.data]);
                }

                // Refresh chat list to update latest message preview
                fetchChats();

                return response.data;
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message');
            throw err;
        }
    };

    const initiateChat = async (recipientId, content = 'Hello!') => {
        setLoading(true);
        try {
            const response = await ChatService.initiateChat(recipientId, content);

            // Refresh chat list to include new chat
            fetchChats();

            return response.data;
        } catch (err) {
            console.error(`Error initiating chat with user ${recipientId}:`, err);
            setError('Failed to create chat');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const markChatAsRead = async (chatId) => {
        try {
            await ChatService.markChatAsRead(chatId);

            if (isSocketConnected) {
                socketService.markMessagesAsRead(chatId);
            }

            // Update local unread count
            const chat = chats.find(c => c._id === chatId);
            if (chat && chat.unreadCount) {
                setUnreadCount(prev => Math.max(0, prev - chat.unreadCount));
            }

            // Refresh chats to update unread counts
            fetchChats();
        } catch (err) {
            console.error(`Error marking chat ${chatId} as read:`, err);
        }
    };

    const fetchChatStats = async () => {
        if (!user) return;

        try {
            const response = await ChatService.getChatStats();
            setUnreadCount(response.data?.totalUnreadMessages || 0);
        } catch (err) {
            console.error('Error fetching chat stats:', err);
        }
    };

    const deleteChat = async (chatId) => {
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
            throw err;
        }
    };

    const sendTypingStatus = (chatId, isTyping) => {
        if (isSocketConnected) {
            socketService.sendTypingStatus(chatId, isTyping);
        }
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    };

    const isUserOnline = (userId) => {
        return onlineUsers.has(userId);
    };

    const getMessageStatus = (messageId) => {
        return messageStatuses.get(messageId) || { sent: false, delivered: false, read: false };
    };

    const value = {
        chats,
        activeChat,
        messages,
        unreadCount,
        loading,
        error,
        typingUsers,
        isSocketConnected,
        onlineUsers,
        messageStatuses,
        setActiveChat,
        fetchChats,
        fetchMessages,
        sendMessage,
        initiateChat,
        markChatAsRead,
        deleteChat,
        sendTypingStatus,
        fetchChatStats,
        requestNotificationPermission,
        isUserOnline,
        getMessageStatus
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
