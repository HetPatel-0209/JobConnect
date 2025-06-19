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

        const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            upgrade: true,
            timeout: 20000,
            forceNew: true
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
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
        });

        // Handle authentication responses
        this.socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data);
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
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
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
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;