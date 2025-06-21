import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatService } from '../services/chat.service';
import socketService from '../services/socket.service';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
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
    const [initialized, setInitialized] = useState(false); // Track if we've attempted to load chats
    const [lastFetchTime, setLastFetchTime] = useState(0); // Prevent rapid-fire fetches
    const [isActive, setIsActive] = useState(true); // Track if context should be active

    // Helper function to check if we're on a chat page
    const isOnChatPage = useCallback(() => {
        const chatPaths = ['/chat', '/user/chat', '/chat-debug', '/user/chat-debug', '/chat-test', '/user/chat-test'];
        return chatPaths.includes(location.pathname);
    }, [location.pathname]);    // Initialize socket connection when user changes
    useEffect(() => {
        console.log('ChatContext: User changed:', user, 'Auth loading:', authLoading);

        // Don't do anything while auth is still loading
        if (authLoading) {
            console.log('ChatContext: Auth still loading, waiting...');
            return;
        }

        if (user) {
            const token = localStorage.getItem('token');
            console.log('ChatContext: Token found:', !!token);
            if (token) {
                // Connect socket immediately only if not already connected
                if (!socketService.isSocketConnected()) {
                    console.log('ChatContext: Connecting socket...');
                    socketService.connect(token);
                }

                // Set up socket reconnection handler (only once)
                const handleReconnect = () => {
                    console.log('ChatContext: Socket reconnected, checking if should refresh data...');
                    const onChatPage = isOnChatPage();
                    if (!loading && isActive && onChatPage) { // Only fetch if not already loading, context is active, and on chat page
                        console.log('ChatContext: Refreshing data after reconnect');
                        fetchChats(true);
                        fetchChatStats();
                    } else {
                        console.log('ChatContext: Skipping data refresh - loading:', loading, 'active:', isActive, 'onChatPage:', onChatPage);
                    }
                };

                const handleAuthenticated = (data) => {
                    console.log('ChatContext: Socket authenticated, checking if should initialize...');
                    setIsSocketConnected(true);

                    // Set online users from authentication response
                    if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
                        const userIds = data.onlineUsers.map(u => u.userId).filter(Boolean);
                        setOnlineUsers(new Set(userIds));
                    }

                    // Fetch initial data after authentication (only once, if context is active, and on chat page)
                    const onChatPage = isOnChatPage();
                    if (!initialized && isActive && onChatPage) {
                        console.log('ChatContext: Initializing data after authentication');
                        fetchChats(true);
                        fetchChatStats();
                        setInitialized(true);
                    } else {
                        console.log('ChatContext: Skipping initialization - initialized:', initialized, 'active:', isActive, 'onChatPage:', onChatPage);
                    }
                };

                socketService.on('reconnect', handleReconnect);
                socketService.on('authenticated', handleAuthenticated);

                // If already connected and authenticated, just fetch data once
                if (socketService.isSocketConnected() && !initialized && isActive && isOnChatPage()) {
                    console.log('ChatContext: Socket already connected, fetching data...');
                    fetchChats(true);
                    fetchChatStats();
                    setInitialized(true);
                }

                // Cleanup reconnect handler
                return () => {
                    socketService.off('reconnect', handleReconnect);
                    socketService.off('authenticated', handleAuthenticated);
                };
            }

            // Request notification permission
            requestNotificationPermission();
        } else {
            console.log('ChatContext: No user, clearing data and deactivating context');
            setIsActive(false); // Deactivate context to prevent API calls
            socketService.disconnect();
            setChats([]);
            setActiveChat(null);
            setMessages([]);
            setUnreadCount(0);
            setTypingUsers([]);
            setIsSocketConnected(false);
            setOnlineUsers(new Set());
            setMessageStatuses(new Map());
            setInitialized(false);
        }
    }, [user, authLoading]); // Removed loading and initialized from dependencies// Backup mechanism to ensure chats are loaded if initial fetch fails
    useEffect(() => {
        if (!user || authLoading || !initialized || !isActive) return;

        // Only run backup if we have a user but no chats after initialization and on chat page
        const timer = setTimeout(() => {
            if (chats.length === 0 && !loading && isActive && isOnChatPage()) {
                console.log('ChatContext: Backup fetch triggered - no chats after initialization');
                fetchChats(true);
            }
        }, 5000); // Increased delay to 5 seconds to prevent rapid firing

        return () => clearTimeout(timer);
    }, [user, authLoading, initialized, isActive]); // Added isActive to dependencies

    // Handle page reload - ensure socket reconnection (run only once)
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Store current state before page unload
            if (user && isSocketConnected) {
                localStorage.setItem('chatWasConnected', 'true');
            }
        };

        // Check on mount if we need to reconnect after page load
        const wasConnected = localStorage.getItem('chatWasConnected');
        if (wasConnected && user && !authLoading) {
            console.log('ChatContext: Reconnecting after page reload...');
            const token = localStorage.getItem('token');
            if (token) {
                socketService.connect(token);
            }
            localStorage.removeItem('chatWasConnected');
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []); // Empty dependency array - run only once on mount

    // Cleanup effect to deactivate context when component unmounts
    useEffect(() => {
        return () => {
            console.log('ChatContext: Component unmounting, deactivating context');
            setIsActive(false);
        };
    }, []);

    // Set up socket event listeners
    useEffect(() => {
        const handleNewMessage = (message) => {
            console.log('Received new message:', message);

            // Add message to current chat if it matches
            if (activeChat && message.chat === activeChat._id) {
                // Check if message is from current user (to avoid duplicates from optimistic updates)
                const isFromCurrentUser = message.sender._id === user?.id || message.sender._id === user?._id;
                console.log('Message from current user:', isFromCurrentUser);

                if (!isFromCurrentUser) {
                    // Only add messages from other users (avoid duplicating our own optimistic messages)
                    setMessages(prev => {
                        // Check if message already exists to prevent duplicates
                        const messageExists = prev.some(msg => msg._id === message._id);
                        if (messageExists) {
                            console.log('Message already exists, skipping:', message._id);
                            return prev;
                        }
                        console.log('Adding new message from other user:', message._id);
                        return [...prev, message];
                    });

                    // Confirm message delivery
                    socketService.confirmMessageDelivery(message._id, message.chat);
                } else {
                    console.log('Skipping message from current user to avoid duplicate');
                }
            }

            // Update message status for all messages
            setMessageStatuses(prev => new Map(prev.set(message._id, {
                sent: true,
                delivered: message.status?.delivered || false,
                read: message.status?.read || false
            })));

            // Update chat list locally and unread count
            const isFromOtherUser = message.sender._id !== user?.id && message.sender._id !== user?._id;

            setChats(prevChats => {
                return prevChats.map(chat => {
                    if (chat._id === message.chat) {
                        const newUnreadCount = isFromOtherUser
                            ? (chat.unreadCount || 0) + 1
                            : chat.unreadCount || 0;

                        return {
                            ...chat,
                            lastMessage: message,
                            updatedAt: message.timestamp,
                            unreadCount: newUnreadCount
                        };
                    }
                    return chat;
                });
            });

            // Update global unread count if message is from another user
            if (isFromOtherUser) {
                setUnreadCount(prev => prev + 1);
            }
        };        const handleMessageNotification = (notification) => {
            console.log('Message notification received:', notification);

            // Update unread count with the total from notification if available
            if (notification.totalUnreadCount !== undefined) {
                console.log('Setting total unread count from notification:', notification.totalUnreadCount);
                setUnreadCount(notification.totalUnreadCount);
            } else if (notification.unreadCount !== undefined) {
                console.log('Setting unread count from notification:', notification.unreadCount);
                setUnreadCount(notification.unreadCount);
            } else {
                console.log('Incrementing unread count');
                setUnreadCount(prev => {
                    const newCount = prev + 1;
                    console.log('New unread count:', newCount);
                    return newCount;
                });
            }

            // Show browser notification if supported and permission granted
            if ('Notification' in window && Notification.permission === 'granted' && notification.message) {
                new Notification(`New message from ${notification.message.sender.name}`, {
                    body: notification.message.content,
                    icon: '/favicon.ico',
                    tag: `chat_${notification.chatId}` // Prevent duplicate notifications
                });
            }

            // Update chat list locally instead of refetching
            if (notification.message) {
                setChats(prevChats => {
                    return prevChats.map(chat => {
                        if (chat._id === notification.message.chat) {
                            return {
                                ...chat,
                                lastMessage: notification.message,
                                updatedAt: notification.message.timestamp,
                                unreadCount: notification.unreadCount || (chat.unreadCount || 0) + 1
                            };
                        }
                        return chat;
                    });
                });
            }
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
            console.log('User came online:', data);
            if (data.userId) {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.add(data.userId);
                    console.log('Updated online users (add):', Array.from(newSet));
                    return newSet;
                });
            }
        };

        const handleUserOffline = (data) => {
            console.log('User went offline:', data);
            if (data.userId) {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId);
                    console.log('Updated online users (remove):', Array.from(newSet));
                    return newSet;
                });
            }
        };

        const handleOnlineUsersList = (data) => {
            console.log('Online users list received:', data);
            if (Array.isArray(data)) {
                const userIds = data.map(u => u.userId).filter(Boolean);
                setOnlineUsers(new Set(userIds));
                console.log('Set online users from list:', userIds);
            }
        };

        const handleMessageDelivered = (data) => {
            console.log('Message delivered:', data);
            setMessageStatuses(prev => {
                const newMap = new Map(prev);
                const currentStatus = newMap.get(data.messageId) || { sent: true };
                newMap.set(data.messageId, {
                    ...currentStatus,
                    delivered: true,
                    deliveredAt: data.deliveredAt
                });
                console.log('Updated message status (delivered):', data.messageId, newMap.get(data.messageId));
                return newMap;
            });
        };

        const handleMessageRead = (data) => {
            console.log('Message read:', data);
            setMessageStatuses(prev => {
                const newMap = new Map(prev);
                const currentStatus = newMap.get(data.messageId) || { sent: true, delivered: true };
                newMap.set(data.messageId, {
                    ...currentStatus,
                    read: true,
                    readAt: data.readAt
                });
                console.log('Updated message status (read):', data.messageId, newMap.get(data.messageId));
                return newMap;
            });
        };

        const handleMessageSent = (data) => {
            console.log('Message sent confirmation:', data);

            // Replace optimistic message with real message
            if (data.tempId) {
                setMessages(prev => prev.map(msg =>
                    msg._id === data.tempId ? { ...data, _id: data._id } : msg
                ));

                // Transfer status from temp ID to real ID
                setMessageStatuses(prev => {
                    const newMap = new Map(prev);
                    const tempStatus = newMap.get(data.tempId);
                    if (tempStatus) {
                        newMap.delete(data.tempId);
                        newMap.set(data._id, {
                            ...tempStatus,
                            sent: true,
                            sentAt: new Date()
                        });
                    }
                    return newMap;
                });
            } else {
                // For messages without tempId, add them if they don't exist
                setMessages(prev => {
                    const messageExists = prev.some(msg => msg._id === data._id);
                    if (!messageExists) {
                        return [...prev, data];
                    }
                    return prev;
                });

                // Set status for new message
                setMessageStatuses(prev => new Map(prev.set(data._id, {
                    sent: true,
                    delivered: false,
                    read: false,
                    sentAt: new Date()
                })));
            }
        };        const handleAuthenticated = (data) => {
            console.log('Socket authenticated in ChatContext:', data);
            setIsSocketConnected(true);
            
            // Set online users from authentication response
            if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
                const userIds = data.onlineUsers.map(u => u.userId).filter(Boolean);
                setOnlineUsers(new Set(userIds));
                console.log('Set online users from auth response:', userIds);
            }
            
            // Request online users list after authentication
            setTimeout(() => {
                socketService.requestOnlineUsers();
            }, 1000);
        };

        const handleAuthError = (error) => {
            console.error('Socket auth error in ChatContext:', error);
            setIsSocketConnected(false);
        };

        const handleConnect = () => {
            console.log('Socket connected in ChatContext');
            setIsSocketConnected(true);
        };

        const handleDisconnect = (reason) => {
            console.log('Socket disconnected in ChatContext:', reason);
            setIsSocketConnected(false);
        };

        const handleConnectError = (error) => {
            console.error('Socket connection error in ChatContext:', error);
            setIsSocketConnected(false);
        };

        const handleUnreadCountUpdated = (data) => {
            console.log('Unread count updated from server:', data);
            if (data.totalUnreadCount !== undefined) {
                setUnreadCount(data.totalUnreadCount);
            }
        };        // Register event listeners
        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);
        socketService.on('connect_error', handleConnectError);
        socketService.on('authenticated', handleAuthenticated);
        socketService.on('auth_error', handleAuthError);
        socketService.on('receive_message', handleNewMessage);
        socketService.on('message_sent', handleMessageSent);
        socketService.on('new_message_notification', handleMessageNotification);
        socketService.on('typing_status', handleTypingStatus);
        socketService.on('messages_read', handleMessagesRead);
        socketService.on('user_online', handleUserOnline);
        socketService.on('user_offline', handleUserOffline);
        socketService.on('online_users', handleOnlineUsersList);
        socketService.on('message_delivered', handleMessageDelivered);
        socketService.on('message_read', handleMessageRead);
        socketService.on('unread_count_updated', handleUnreadCountUpdated);

        return () => {
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
            socketService.off('connect_error', handleConnectError);
            socketService.off('authenticated', handleAuthenticated);
            socketService.off('auth_error', handleAuthError);
            socketService.off('receive_message', handleNewMessage);
            socketService.off('message_sent', handleMessageSent);
            socketService.off('new_message_notification', handleMessageNotification);
            socketService.off('typing_status', handleTypingStatus);
            socketService.off('messages_read', handleMessagesRead);
            socketService.off('user_online', handleUserOnline);
            socketService.off('user_offline', handleUserOffline);
            socketService.off('online_users', handleOnlineUsersList);
            socketService.off('message_delivered', handleMessageDelivered);
            socketService.off('message_read', handleMessageRead);
            socketService.off('unread_count_updated', handleUnreadCountUpdated);
        };
    }, [activeChat]);    // Join chat room when active chat changes
    useEffect(() => {
        if (activeChat && socketService.isSocketConnected()) {
            console.log('ChatContext: Joining chat room:', activeChat._id);
            socketService.joinChat(activeChat._id);
            fetchMessages(activeChat._id);

            // Clear typing users when switching chats
            setTypingUsers([]);
        }

        return () => {
            if (activeChat && socketService.isSocketConnected()) {
                console.log('ChatContext: Leaving chat room:', activeChat._id);
                socketService.leaveChat(activeChat._id);
            }
        };
    }, [activeChat, isSocketConnected]);    const fetchChats = useCallback(async (force = false) => {
        const now = Date.now();

        // Prevent rapid-fire calls (minimum 1 second between calls unless forced)
        if (!force && (now - lastFetchTime) < 1000) {
            console.log('fetchChats: Rate limited, skipping');
            return;
        }

        console.log('fetchChats called, user:', user, 'force:', force, 'current chats:', chats.length);
        if (!user) {
            console.log('fetchChats: No user, returning');
            return;
        }

        // Only skip if we have chats AND it's not forced AND we're not loading
        if (!force && chats.length > 0 && !loading) {
            console.log('fetchChats: Already have chats and not forced, skipping');
            return;
        }

        // Prevent multiple simultaneous requests
        if (loading) {
            console.log('fetchChats: Already loading, skipping');
            return;
        }

        setLastFetchTime(now);
        setLoading(true);
        setError(null); // Clear any previous errors
        try {
            console.log('fetchChats: Making API call...');
            const response = await ChatService.getChats();
            console.log('fetchChats: Response received:', response);

            if (response && response.data) {
                setChats(response.data);
                console.log('fetchChats: Chats set successfully:', response.data.length, 'chats');
            } else {
                console.log('fetchChats: No data in response');
                setChats([]);
            }
        } catch (err) {
            console.error('Error fetching chats:', err);
            setError('Failed to load chats');
            setChats([]); // Clear chats on error
        } finally {
            setLoading(false);
        }
    }, [user, loading, lastFetchTime]); // Removed chats.length to prevent infinite loop

    const fetchMessages = useCallback(async (chatId) => {
        setLoading(true);
        try {
            const response = await ChatService.getChatMessages(chatId);
            const fetchedMessages = response.data?.messages || [];

            // Remove duplicates based on message ID
            const uniqueMessages = fetchedMessages.filter((message, index, self) =>
                index === self.findIndex(m => m._id === message._id)
            );

            setMessages(uniqueMessages);
        } catch (err) {
            console.error(`Error fetching messages for chat ${chatId}:`, err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array since this function doesn't depend on any state

    const sendMessage = async (recipientId, content) => {
        try {
            // Generate temporary message ID for status tracking
            const tempMessageId = `temp_${Date.now()}_${Math.random()}`;

            // Send via socket for real-time delivery if connected
            if (activeChat && socketService.isSocketConnected()) {
                console.log('ChatContext: Sending message via socket');
                
                // Set initial status as sending
                setMessageStatuses(prev => new Map(prev.set(tempMessageId, {
                    sent: false,
                    delivered: false,
                    read: false
                })));

                // Create optimistic message for immediate UI update
                const optimisticMessage = {
                    _id: tempMessageId,
                    content,
                    sender: { _id: user?.id || user?._id, name: user?.name },
                    chat: activeChat._id,
                    timestamp: new Date(),
                    messageType: 'text'
                };

                // Add optimistic message to UI
                setMessages(prev => [...prev, optimisticMessage]);

                // Send via socket with temp ID for tracking
                socketService.sendMessage(activeChat._id, content, 'text', tempMessageId);

                // Mark as sent after a short delay (optimistic)
                setTimeout(() => {
                    setMessageStatuses(prev => {
                        const newMap = new Map(prev);
                        const currentStatus = newMap.get(tempMessageId) || {};
                        newMap.set(tempMessageId, {
                            ...currentStatus,
                            sent: true,
                            sentAt: new Date()
                        });
                        return newMap;
                    });
                }, 100);

            } else {
                console.log('ChatContext: Falling back to HTTP API');
                // Fallback to HTTP API
                const response = await ChatService.sendMessage(recipientId, content);

                // Set message status as sent
                if (response.data) {
                    setMessageStatuses(prev => new Map(prev.set(response.data._id, {
                        sent: true,
                        delivered: false,
                        read: false,
                        sentAt: new Date()
                    })));
                }

                // Update messages if this is for the active chat
                if (activeChat && response.data) {
                    setMessages(prevMessages => {
                        // Check if message already exists to prevent duplicates
                        const messageExists = prevMessages.some(msg => msg._id === response.data._id);
                        if (messageExists) {
                            return prevMessages;
                        }
                        return [...prevMessages, response.data];
                    });
                }

                // Update chat list locally instead of refetching
                setChats(prevChats => {
                    return prevChats.map(chat => {
                        if (chat.participants.some(p => p.user._id === recipientId || p.user.id === recipientId)) {
                            return {
                                ...chat,
                                lastMessage: response.data,
                                updatedAt: response.data.timestamp
                            };
                        }
                        return chat;
                    });
                });

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
            // Find the chat and get its unread count before updating
            const chat = chats.find(c => c._id === chatId);
            const chatUnreadCount = chat?.unreadCount || 0;

            console.log('Marking chat as read:', chatId, 'unread count:', chatUnreadCount);

            await ChatService.markChatAsRead(chatId);

            if (isSocketConnected) {
                socketService.markMessagesAsRead(chatId);
            }

            // Update local unread count
            if (chatUnreadCount > 0) {
                setUnreadCount(prev => {
                    const newCount = Math.max(0, prev - chatUnreadCount);
                    console.log('Updated global unread count:', prev, '->', newCount);
                    return newCount;
                });
            }

            // Update chat list locally instead of refetching
            setChats(prevChats => {
                return prevChats.map(chat => {
                    if (chat._id === chatId) {
                        return {
                            ...chat,
                            unreadCount: 0
                        };
                    }
                    return chat;
                });
            });

            // Refresh chat stats to ensure accuracy (only if context is active and on chat page)
            if (isActive && isOnChatPage()) {
                fetchChatStats();
            }
        } catch (err) {
            console.error(`Error marking chat ${chatId} as read:`, err);
        }
    };

    const fetchChatStats = useCallback(async () => {
        if (!user) {
            console.log('fetchChatStats: No user, skipping');
            return;
        }

        try {
            console.log('fetchChatStats: Making API call...');
            const response = await ChatService.getChatStats();
            setUnreadCount(response.data?.totalUnreadMessages || 0);
            console.log('fetchChatStats: Updated unread count:', response.data?.totalUnreadMessages || 0);
        } catch (err) {
            console.error('Error fetching chat stats:', err);
        }
    }, [user]);

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
        if (socketService.isSocketConnected()) {
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
        initialized,
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

// Custom hook to use the ChatContext
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
