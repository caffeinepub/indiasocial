# IndiaSocial

## Current State
IndiaSocial एक Instagram-जैसा सोशल मीडिया ऐप है जिसमें ये features हैं:
- User profiles (username, bio, avatar)
- Photo posts with captions, likes, comments
- Stories (24-hour expiry) with music support
- Follow/unfollow system
- Feed (following users के posts)
- Explore page (all posts grid)
- Internet Identity login

Backend में chat का कोई API नहीं है। Frontend में Chat page नहीं है।

## Requested Changes (Diff)

### Add
- Backend: `ChatMessage` type (id, sender, receiver, text, timestamp)
- Backend: `sendMessage(receiver: Principal, text: Text)` - message भेजें
- Backend: `getConversation(otherUser: Principal)` - दो users के बीच messages
- Backend: `getConversations()` - caller की सभी conversations की list (latest message per user)
- Backend: `markMessagesRead(otherUser: Principal)` - messages read करें
- Backend: `getUnreadCount()` - unread messages की count
- Frontend: `/chat` route - Chat list page (सभी conversations)
- Frontend: `/chat/:userId` route - Individual conversation page with real-time polling
- Frontend: Bottom navigation में chat icon

### Modify
- Backend: `main.mo` में chat data structures और functions जोड़ें
- Frontend: `App.tsx` में chat routes जोड़ें
- Frontend: Bottom navigation में chat tab जोड़ें

### Remove
- कुछ नहीं

## Implementation Plan
1. `main.mo` में ChatMessage type और chat functions जोड़ें
2. Frontend में `ChatListPage.tsx` बनाएं - सभी conversations दिखाए
3. Frontend में `ChatConversationPage.tsx` बनाएं - individual chat with polling
4. `App.tsx` में routes जोड़ें
5. Navigation में chat icon/tab जोड़ें
