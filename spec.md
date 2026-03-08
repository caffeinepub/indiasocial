# IndiaSocial

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication (login/signup via Internet Identity)
- User profile: username, bio, avatar, post count, followers count, following count
- Photo upload and sharing (posts with images and captions)
- Stories UI (horizontal scrollable story circles at top of feed)
- Feed: scrollable list of posts from followed users and all users
- Follow/unfollow users
- Like posts
- Comments on posts
- Explore page: grid view of all public posts
- Profile page: user's own posts in a grid
- Tricolor (Indian flag) design: saffron (#FF9933), white, green (#138808), navy blue (#000080) with Ashoka Chakra motif

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User profile management: create profile, get profile, update profile (username, bio, avatar blob key)
- Posts: create post (image blob key, caption), get all posts, get posts by user, delete post
- Social graph: follow user, unfollow user, get followers, get following, check if following
- Likes: like post, unlike post, get likes count, check if liked
- Comments: add comment, get comments for post
- Stories: create story (image blob key), get stories (all users), stories expire logic (24h timestamp)
- Feed: get feed posts (posts from followed users + own posts, sorted by time)

### Frontend (React)
- Bottom navigation bar: Home, Explore, Upload, Stories, Profile
- Home feed: story row at top, then scrollable post cards with like/comment actions
- Story viewer: full-screen overlay with progress bar
- Post creation: image upload dialog with caption input
- Explore page: 3-column photo grid
- User profile page: avatar, stats, photo grid, follow/unfollow button
- Comments sheet/modal per post
- Login page: Internet Identity connect button
- Tricolor design system: saffron/white/green palette, Ashoka Chakra accent in navy blue
- Responsive, mobile-first layout
