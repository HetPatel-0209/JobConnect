import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.eventHandlers = new Map();
    }

    // Initialize socket connection
    connect(token) {
        if (this.socket) {
            this.disconnect();
        }

        const serverUrl = import.meta.env.BACKEND_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

        this.socket = io(serverUrl, {
            transports: ['polling', 'websocket'],
            upgrade: true,
            timeout: 20000,
            forceNew: true,
            autoConnect: true
        });

        // Handle connection events
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;
            
            // Authenticate the socket connection
            if (token) {
                this.authenticate(token);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;

            // Auto-reconnect for certain disconnect reasons
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                setTimeout(() => {
                    if (this.socket) {
                        this.socket.connect();
                    }
                }, 1000);
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;

            // Try to reconnect after a delay
            setTimeout(() => {
                if (!this.isConnected && this.socket) {
                    console.log('Attempting to reconnect...');
                    this.socket.connect();
                }
            }, 5000);
        });

        // Handle authentication responses
        this.socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data);
            this.userId = data.user?.id;
            this.isConnected = true;

            // Emit user online status
            this.socket.emit('user_online', { userId: this.userId });

            this.triggerHandler('authenticated', data);
        });

        this.socket.on('auth_error', (error) => {
            console.error('Socket auth error:', error);
            this.triggerHandler('auth_error', error);
        });

        // Handle chat events
        this.socket.on('receive_message', (message) => {
            console.log('New message received:', message);
            this.triggerHandler('receive_message', message);
        });

        this.socket.on('new_message_notification', (notification) => {
            console.log('New message notification:', notification);
            this.triggerHandler('new_message_notification', notification);
        });

        this.socket.on('typing_status', (data) => {
            this.triggerHandler('typing_status', data);
        });

        this.socket.on('messages_read', (data) => {
            this.triggerHandler('messages_read', data);
        });

        this.socket.on('joined_chat', (data) => {
            console.log('Joined chat:', data);
            this.triggerHandler('joined_chat', data);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.triggerHandler('error', error);
        });

        // Handle online/offline status updates
        this.socket.on('user_online', (data) => {
            this.triggerHandler('user_online', data);
        });

        this.socket.on('user_offline', (data) => {
            this.triggerHandler('user_offline', data);
        });

        // Handle message delivery status
        this.socket.on('message_delivered', (data) => {
            this.triggerHandler('message_delivered', data);
        });

        this.socket.on('message_read', (data) => {
            this.triggerHandler('message_read', data);
        });

        return this.socket;
    }

    // Authenticate socket connection
    authenticate(token) {
        if (this.socket && this.isConnected) {
            this.socket.emit('authenticate', token);
        }
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            // Emit user offline status before disconnecting
            if (this.userId) {
                this.socket.emit('user_offline', { userId: this.userId });
            }

            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.userId = null;
            this.eventHandlers.clear();
        }
    }

    // Join a chat room
    joinChat(chatId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join_chat', chatId);
        }
    }

    // Leave a chat room
    leaveChat(chatId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave_chat', chatId);
        }
    }

    // Send a message
    sendMessage(chatId, content, messageType = 'text') {
        if (this.socket && this.isConnected) {
            this.socket.emit('send_message', {
                chatId,
                content,
                messageType
            });
        }
    }

    // Send typing status
    sendTypingStatus(chatId, isTyping) {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing', {
                chatId,
                isTyping
            });
        }
    }

    // Mark messages as read
    markMessagesAsRead(chatId, messageIds = null) {
        if (this.socket && this.isConnected) {
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
                    console.error(`Error in ${event} handler:`, error);
                }
            });
        }
    }

    // Get connection status
    isSocketConnected() {
        return this.isConnected && this.socket && this.socket.connected;
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
        if (this.socket && this.isConnected) {
            this.socket.emit('get_online_users');
        }
    }

    // Send message delivery confirmation
    confirmMessageDelivery(messageId, chatId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('message_delivered', {
                messageId,
                chatId,
                deliveredAt: new Date()
            });
        }
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;