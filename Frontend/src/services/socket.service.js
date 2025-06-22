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
        this.token = token; // Store token for authentication

        if (this.socket) {
            this.disconnect();
        }

        this.token = token; // Store token for reconnection
        this.reconnectAttempts = 0;

        // Store token in localStorage for page reload recovery
        if (token) {
            localStorage.setItem('socketToken', token);
        }

        // Use the base URL without /api for Socket.IO connection
        const baseUrl = import.meta.env.VITE_BACKEND_API_URL || 'https://jobconnect-xwh3.onrender.com';
        const serverUrl = baseUrl;

        // Debug logging for socket connection
        console.log('🔌 Socket Service Debug:');
        console.log('VITE_BACKEND_API_BASE_URL:', import.meta.env.VITE_BACKEND_API_BASE_URL);
        console.log('VITE_BACKEND_API_URL:', import.meta.env.VITE_BACKEND_API_URL);
        console.log('Socket Server URL:', serverUrl);

        this.socket = io(serverUrl, {
            // Use polling first for better compatibility with Render
            transports: ['polling', 'websocket'],
            upgrade: true,
            timeout: 30000, // Increased timeout for Render
            forceNew: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            reconnectionDelayMax: 10000, // Increased for Render
            maxReconnectionAttempts: this.maxReconnectAttempts,
            // Configure for cross-origin requests to Render
            withCredentials: true, // Enable credentials for CORS
            // Ensure proper Socket.IO path for Render deployment
            path: '/socket.io/',
            // Additional options for Render compatibility
            rememberUpgrade: false,
            // Disable auto-connect initially to handle connection manually
            autoConnect: false
        });

        this.setupEventHandlers();

        // Manually connect since autoConnect is disabled
        console.log('🚀 Attempting to connect to Render backend...');
        this.socket.connect();

        // Add a timeout for initial connection to handle Render cold starts
        const connectionTimeout = setTimeout(() => {
            if (!this.isConnected && this.socket && !this.socket.connected) {
                console.warn('⚠️ Initial connection timeout - Render backend might be cold starting. Retrying...');
                this.socket.disconnect();
                setTimeout(() => {
                    if (this.socket) {
                        this.socket.connect();
                    }
                }, 5000);
            }
        }, 15000); // 15 second timeout for Render cold start

        // Clear timeout if connection succeeds
        this.socket.once('connect', () => {
            clearTimeout(connectionTimeout);
        });

        return this.socket;
    }

    setupEventHandlers() {        // Handle connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket connected successfully to Render backend:', this.socket.id);
            this.isConnected = true;
            this.isConnecting = false;
            this.reconnectAttempts = 0;

            // Authenticate the socket connection after successful connection
            if (this.token) {
                console.log('🔐 Authenticating socket after connection...');
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
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
            this.isAuthenticated = false;
            this.isConnecting = false;
            this.triggerHandler('connect_error', error);

            // Handle specific errors for Render deployment
            if (error.message && (
                error.message.includes('Invalid namespace') ||
                error.message.includes('xhr poll error') ||
                error.message.includes('websocket error') ||
                error.type === 'TransportError'
            )) {
                console.warn('Connection error detected (possibly Render-related), attempting to reconnect...', error.message);
                // Force a complete reconnection with fresh socket instance
                setTimeout(() => {
                    this.forceReconnect();
                }, 3000); // Longer delay for Render
                return;
            }

            // Try to reconnect after a delay if not already reconnecting
            if (!this.socket.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    if (!this.isConnected && this.socket && this.token && !this.isConnecting) {
                        this.reconnectAttempts++;
                        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                        this.socket.connect();
                    }
                }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
            }
        });

        // Handle authentication responses
        this.socket.on('authenticated', (data) => {
            this.userId = data.user?.id;
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

            // Handle various connection errors for Render deployment
            if (error.message && (
                error.message.includes('Invalid namespace') ||
                error.message.includes('xhr poll error') ||
                error.message.includes('websocket error') ||
                error.type === 'TransportError'
            )) {
                console.warn('Socket communication error (possibly Render-related), attempting reconnection...', error.message);
                setTimeout(() => {
                    this.forceReconnect();
                }, 2000);
                return;
            }

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

    // Check connection health and attempt recovery if needed
    checkConnectionHealth() {
        if (!this.socket || !this.socket.connected) {
            console.log('Socket not connected, attempting auto-reconnect...');
            return this.autoReconnect();
        }

        if (this.isConnected && !this.isAuthenticated) {
            console.log('Socket connected but not authenticated, re-authenticating...');
            const token = localStorage.getItem('token');
            if (token) {
                this.authenticate(token);
                return true;
            }
        }

        return this.isSocketConnected();
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
        console.log('Force reconnecting socket...');

        // Reset all connection states
        this.isConnected = false;
        this.isAuthenticated = false;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        if (this.socket) {
            this.disconnect();
        }

        const token = localStorage.getItem('token');
        if (token) {
            setTimeout(() => {
                console.log('Attempting fresh connection after force reconnect...');
                this.connect(token);
            }, 1000);
        } else {
            console.warn('No token found for reconnection');
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