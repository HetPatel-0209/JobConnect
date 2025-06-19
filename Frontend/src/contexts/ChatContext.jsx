import React, { createContext, useState, useContext, useEffect } from 'react';
import { ChatService } from '../services/chat.service';
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

    // Fetch chats when user changes
    useEffect(() => {
        if (user) {
            fetchChats();
            fetchUnreadCount();
        } else {
            setChats([]);
            setActiveChat(null);
            setMessages([]);
            setUnreadCount(0);
        }
    }, [user]);

    // Fetch messages when active chat changes
    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.id);
        }
    }, [activeChat]);

    const fetchChats = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const data = await ChatService.getChats();
            setChats(data);
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
            const data = await ChatService.getChatMessages(chatId);
            setMessages(data);
        } catch (err) {
            console.error(`Error fetching messages for chat ${chatId}:`, err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (recipientId, content) => {
        setLoading(true);
        try {
            const newMessage = await ChatService.sendMessage(recipientId, content);
            
            // Update messages if this is for the active chat
            if (activeChat && activeChat.id === newMessage.chatId) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
            
            // Refresh chat list to update latest message preview
            fetchChats();
            
            return newMessage;
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const initiateChat = async (userId) => {
        setLoading(true);
        try {
            const newChat = await ChatService.initiateChat(userId);
            
            // Add to chat list
            setChats(prevChats => {
                // Check if chat already exists
                const exists = prevChats.some(chat => chat.id === newChat.id);
                if (exists) {
                    return prevChats;
                }
                return [newChat, ...prevChats];
            });
            
            // Set as active chat
            setActiveChat(newChat);
            
            return newChat;
        } catch (err) {
            console.error(`Error initiating chat with user ${userId}:`, err);
            setError('Failed to create chat');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await ChatService.markAsRead(messageId);
            
            // Update message status locally
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg.id === messageId ? { ...msg, read: true } : msg
                )
            );
            
            // Update unread count
            fetchUnreadCount();
        } catch (err) {
            console.error(`Error marking message ${messageId} as read:`, err);
        }
    };

    const fetchUnreadCount = async () => {
        if (!user) return;
        
        try {
            const data = await ChatService.getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const value = {
        chats,
        activeChat,
        messages,
        unreadCount,
        loading,
        error,
        setActiveChat,
        fetchChats,
        fetchMessages,
        sendMessage,
        initiateChat,
        markAsRead
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
