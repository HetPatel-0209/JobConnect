# Chat Feature Documentation

## Overview
The chat feature enables real-time communication between jobseekers and recruiters in the JobConnect platform. It includes real-time messaging, online/offline indicators, typing indicators, and unread message notifications.

## Components

### ChatButton
A reusable button component for initiating chats between users.

**Props:**
- `recipientId` - ID of the user to chat with
- `recipientName` - Name of the recipient
- `recipientRole` - Role of the recipient ('recruiter' or 'jobseeker')
- `variant` - Button style ('primary', 'secondary', 'icon')
- `size` - Button size ('small', 'medium', 'large')
- `initialMessage` - Custom initial message to send

### ChatList
Displays a list of active conversations with unread counts and last message previews.

### ChatWindow
The main chat interface showing messages and input area.

### MessageBubble
Individual message component with timestamp and read status.

### ChatInput
Text input component with typing indicators and auto-resize.

## Features

### Real-time Messaging
- Uses Socket.IO for instant message delivery
- Automatic fallback to HTTP API if socket connection fails
- Message status indicators (sent, delivered, read)

### Online/Offline Indicators
- Shows user's last seen timestamp
- Real-time online status updates

### Typing Indicators
- Shows when other users are typing
- Automatic timeout after 1 second of inactivity

### Unread Message Notifications
- Red badge on navigation links showing unread count
- Per-chat unread message counts
- Automatic read marking when viewing messages

### Cross-talk Prevention
- Each chat is limited to exactly 2 participants
- Users cannot start chats with themselves
- Proper user role validation

## Usage

### Adding Chat Buttons
```jsx
import ChatButton from '../components/chat/ChatButton';

<ChatButton
  recipientId={user._id}
  recipientName={user.name}
  recipientRole="recruiter"
  variant="primary"
  initialMessage="Hi! I'm interested in this position."
/>
```

### Navigation
- Recruiters: `/chat`
- Jobseekers: `/user/chat`

## Backend Integration
- Uses `/api/chat/*` endpoints
- Socket.IO connection on same server
- Authentication required for all chat operations
- Message validation and sanitization

## Security Features
- All chat operations require authentication
- Users can only access their own chats
- Message content validation
- Cross-site scripting (XSS) protection

## File Structure
```
Frontend/src/components/chat/
├── ChatButton.jsx      # Chat initiation button
├── ChatInput.jsx       # Message input component
├── ChatList.jsx        # Chat list sidebar
├── ChatWindow.jsx      # Main chat interface
├── MessageBubble.jsx   # Individual message display
├── index.js           # Component exports
└── README.md          # This documentation

Frontend/src/pages/Chat/
└── ChatPage.jsx       # Main chat page

Frontend/src/services/
├── chat.service.js    # Chat API service
└── socket.service.js  # Socket.IO service

Frontend/src/contexts/
└── ChatContext.jsx    # Chat state management
```
