import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Comment {
    text: string;
    author: Principal;
    timestamp: bigint;
    postId: bigint;
}
export interface Post {
    id: bigint;
    imageBlobKey: string;
    author: Principal;
    timestamp: bigint;
    caption: string;
}
export interface Story {
    id: bigint;
    imageBlobKey: string;
    author: Principal;
    timestamp: bigint;
}
export interface ChatMessage {
    id: bigint;
    text: string;
    isRead: boolean;
    sender: Principal;
    timestamp: bigint;
    receiver: Principal;
}
export interface UserProfile {
    bio: string;
    username: string;
    avatarBlobKey: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, text: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(username: string, bio: string, avatarBlobKey: string): Promise<void>;
    createPost(imageBlobKey: string, caption: string): Promise<bigint>;
    createStory(imageBlobKey: string): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    didUserLikePost(user: Principal, postId: bigint): Promise<boolean>;
    followUser(target: Principal): Promise<void>;
    getActiveStories(): Promise<Array<[Principal, Array<Story>]>>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: bigint): Promise<Array<Comment>>;
    getConversation(otherUser: Principal): Promise<Array<ChatMessage>>;
    getConversations(): Promise<Array<[Principal, ChatMessage]>>;
    getFeed(): Promise<Array<Post>>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getPostLikeCount(postId: bigint): Promise<bigint>;
    getPostsByUser(user: Principal): Promise<Array<Post>>;
    getUnreadCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isFollowing(target: Principal): Promise<boolean>;
    likePost(postId: bigint): Promise<boolean>;
    markMessagesRead(otherUser: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, text: string): Promise<bigint>;
    unfollowUser(target: Principal): Promise<void>;
}
