import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.isAuthenticated = false;
        this.eventHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.userId = null;
        this.token = null;
        this.isConnecting = false; // Prevent multiple connection attempts
    }    // Initialize socket connection
    connect(token) {
        if (this.socket && this.socket.connected && this.isAuthenticated) {
            return this.socket;
        }

        if (this.isConnecting) {
            console.log('Socket connection already in progress');
            return this.socket;
        }

        this.isConnecting = true;

        if (this.socket) {
            this.disconnect();
        }

        this.token = token; // Store token for reconnection
        this.reconnectAttempts = 0;

        // Store token in localStorage for page reload recovery
        if (token) {
            localStorage.setItem('socketToken', token);
        }

        const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://jobconnect-xwh3.onrender.com';

        this.socket = io(serverUrl, {
            transports: ['polling', 'websocket'],
            upgrade: true,
            timeout: 20000,
            forceNew: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            reconnectionDelayMax: 5000,
            maxReconnectionAttempts: this.maxReconnectAttempts,
            auth: {
                token: token // Send token with initial connection
            }
        });

        this.setupEventHandlers();
        return this.socket;
    }

    setupEventHandlers() {        // Handle connection events
        this.socket.on('connect', () => {
            this.isConnected = true;
            this.isConnecting = false;
            this.reconnectAttempts = 0;

            // Authenticate the socket connection
            if (this.token) {
                this.authenticate(this.token);
            }

            this.triggerHandler('connect');
        }); this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            this.isAuthenticated = false;
            this.isConnecting = false;
            this.triggerHandler('disconnect', reason);

            // Auto-reconnect for all disconnect reasons except manual disconnect
            if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    if (this.socket && this.token && !this.isConnected && !this.isConnecting) {
                        this.reconnectAttempts++;
                        this.socket.connect();
                    }
                }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
            }
        }); this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            this.isConnected = true;
            this.isConnecting = false;
            this.reconnectAttempts = 0;

            // Re-authenticate after reconnection
            if (this.token) {
                this.authenticate(this.token);
            }

            this.triggerHandler('reconnect', attemptNumber);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Socket reconnection attempt:', attemptNumber);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            this.isConnected = false;
            this.isAuthenticated = false;
        }); this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
            this.isAuthenticated = false;
            this.isConnecting = false;
            this.triggerHandler('connect_error', error);

            // Try to reconnect after a delay if not already reconnecting
            if (!this.socket.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    if (!this.isConnected && this.socket && this.token && !this.isConnecting) {
                        this.reconnectAttempts++;
                        this.socket.connect();
                    }
                }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
            }
        });

        // Handle authentication responses
        this.socket.on('authenticated', (data) => {
            this.userId = data.user?.id || data.user?._id;
            this.isConnected = true;
            this.isAuthenticated = true;

            // Emit user online status
            this.socket.emit('user_online', {
                userId: this.userId,
                userInfo: data.user
            });

            this.triggerHandler('authenticated', data);
        });

        this.socket.on('auth_error', (error) => {
            console.error('Socket auth error:', error);
            this.isConnected = false;
            this.isAuthenticated = false;

            // Try to get fresh token and reconnect
            const freshToken = localStorage.getItem('token');
            if (freshToken && freshToken !== this.token) {
                console.log('Trying with fresh token...');
                this.token = freshToken;
                setTimeout(() => {
                    this.authenticate(this.token);
                }, 1000);
            }

            this.triggerHandler('auth_error', error);
        });

        this.setupMessageHandlers();
        this.setupStatusHandlers();
    }

    setupMessageHandlers() {
        // Handle chat events
        this.socket.on('receive_message', (message) => {
            this.triggerHandler('receive_message', message);
        });

        this.socket.on('message_sent', (data) => {
            this.triggerHandler('message_sent', data);
        });

        this.socket.on('new_message_notification', (notification) => {
            this.triggerHandler('new_message_notification', notification);
        });

        this.socket.on('typing_status', (data) => {
            this.triggerHandler('typing_status', data);
        });

        this.socket.on('messages_read', (data) => {
            this.triggerHandler('messages_read', data);
        });

        this.socket.on('joined_chat', (data) => {
            this.triggerHandler('joined_chat', data);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.triggerHandler('error', error);
        });

        // Handle message delivery and read status
        this.socket.on('message_delivered', (data) => {
            this.triggerHandler('message_delivered', data);
        });

        this.socket.on('message_read', (data) => {
            this.triggerHandler('message_read', data);
        });

        this.socket.on('unread_count_updated', (data) => {
            this.triggerHandler('unread_count_updated', data);
        });
    }

    setupStatusHandlers() {
        // Handle online/offline status updates
        this.socket.on('user_online', (data) => {
            this.triggerHandler('user_online', data);
        });

        this.socket.on('user_offline', (data) => {
            this.triggerHandler('user_offline', data);
        });

        this.socket.on('online_users_list', (data) => {
            this.triggerHandler('online_users', data);
        });
    }    // Authenticate socket connection
    authenticate(token) {
        if (this.socket && this.isConnected) {
            console.log('Authenticating socket with token...');
            this.socket.emit('authenticate', token);
        }
    }    // Disconnect socket
    disconnect() {
        if (this.socket) {
            // Emit user offline status before disconnecting
            if (this.userId) {
                this.socket.emit('user_offline', { userId: this.userId });
            }

            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.isAuthenticated = false;
            this.isConnecting = false;
            this.userId = null;
            this.eventHandlers.clear();
        }
    }

    // Auto-reconnect using stored token
    autoReconnect() {
        const storedToken = localStorage.getItem('socketToken') || localStorage.getItem('token');
        if (storedToken && !this.isConnected) {
            console.log('Auto-reconnecting with stored token...');
            this.connect(storedToken);
            return true;
        }
        return false;
    }

    // Get connection status
    isSocketConnected() {
        return this.isConnected && this.isAuthenticated && this.socket && this.socket.connected;
    }    // Join a chat room
    joinChat(chatId) {
        if (this.socket && this.isSocketConnected()) {
            this.socket.emit('join_chat', chatId);
        }
    }

    // Leave a chat room
    leaveChat(chatId) {
        if (this.socket && this.isSocketConnected()) {
            this.socket.emit('leave_chat', chatId);
        }
    }

    // Send a message
    sendMessage(chatId, content, messageType = 'text', tempId = null) {
        if (this.socket && this.isSocketConnected()) {
            this.socket.emit('send_message', {
                chatId,
                content,
                messageType,
                tempId
            });
        } else {
            console.warn('Cannot send message: Socket not connected or authenticated');
        }
    }

    // Send typing status
    sendTypingStatus(chatId, isTyping) {
        if (this.socket && this.isSocketConnected()) {
            this.socket.emit('typing', {
                chatId,
                isTyping
            });
        }
    }

    // Mark messages as read
    markMessagesAsRead(chatId, messageIds = null) {
        if (this.socket && this.isSocketConnected()) {
            this.socket.emit('mark_read', {
                chatId,
                messageIds
            });
        }
    }

    // Event handler management
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Trigger event handlers
    triggerHandler(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error handler:`, error);
                }
            });
        }
    }    // Get connection status
    isSocketConnected() {
        return this.isConnected && this.isAuthenticated && this.socket && this.socket.connected;
    }

    // Get socket ID
    getSocketId() {
        return this.socket ? this.socket.id : null;
    }

    // Get current user ID
    getCurrentUserId() {
        return this.userId;
    }

    // Request online users
    requestOnlineUsers() {
        if (this.socket && this.isSocketConnected()) {
            this.socket.emit('get_online_users');
        }
    }

    // Send message delivery confirmation
    confirmMessageDelivery(messageId, chatId) {
        if (this.socket && this.isSocketConnected()) {
            this.socket.emit('message_delivered', {
                messageId,
                chatId,
                deliveredAt: new Date()
            });
        }
    }

    // Force reconnect
    forceReconnect() {
        if (this.socket) {
            this.disconnect();
        }

        const token = localStorage.getItem('token');
        if (token) {
            setTimeout(() => {
                this.connect(token);
            }, 1000);
        }
    }
}

// Create singleton instance
const socketService = new SocketService();

// Make available globally for testing
if (typeof window !== 'undefined') {
    window.socketService = socketService;
}

export default socketService;