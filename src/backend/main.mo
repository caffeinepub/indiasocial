import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type UserProfile = {
    username : Text;
    bio : Text;
    avatarBlobKey : Text;
  };

  type Post = {
    id : Nat;
    author : Principal;
    imageBlobKey : Text;
    caption : Text;
    timestamp : Int;
  };

  type Comment = {
    postId : Nat;
    author : Principal;
    text : Text;
    timestamp : Int;
  };

  type Story = {
    id : Nat;
    author : Principal;
    imageBlobKey : Text;
    timestamp : Int;
  };

  var nextPostId = 0;
  var nextStoryId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Nat, Post>();
  let comments = List.empty<Comment>();
  let followers = Map.empty<Principal, Set.Set<Principal>>();
  let following = Map.empty<Principal, Set.Set<Principal>>();
  let postLikes = Map.empty<Nat, Set.Set<Principal>>();
  let stories = Map.empty<Principal, List.List<Story>>();

  func comparePostsByTimestamp(p1 : Post, p2 : Post) : Order.Order {
    Int.compare(p2.timestamp, p1.timestamp); // Newest first
  };

  // User Profiles
  public shared ({ caller }) func createOrUpdateProfile(username : Text, bio : Text, avatarBlobKey : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };

    let profile : UserProfile = {
      username;
      bio;
      avatarBlobKey;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  // Posts
  public shared ({ caller }) func createPost(imageBlobKey : Text, caption : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let post : Post = {
      id = nextPostId;
      author = caller;
      imageBlobKey;
      caption;
      timestamp = Time.now();
    };

    posts.add(nextPostId, post);
    postLikes.add(nextPostId, Set.empty<Principal>());
    nextPostId += 1;
    post.id;
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    posts.values().toArray().sort(comparePostsByTimestamp);
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    let userPosts = posts.values().toArray().filter(func(p) { p.author == user });
    userPosts.sort(comparePostsByTimestamp);
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (post.author != caller) {
          Runtime.trap("Unauthorized: Can only delete own posts");
        };
        posts.remove(postId);
        postLikes.remove(postId);
      };
    };
  };

  // Followers
  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == target) {
      Runtime.trap("Cannot follow yourself");
    };

    let targetFollowers = switch (followers.get(target)) {
      case (null) { Set.empty<Principal>() };
      case (?set) { set };
    };

    if (targetFollowers.contains(caller)) {
      Runtime.trap("Already following this user");
    };

    targetFollowers.add(caller);
    followers.add(target, targetFollowers);

    // Update following for caller
    let callerFollowing = switch (following.get(caller)) {
      case (null) { Set.empty<Principal>() };
      case (?set) { set };
    };
    callerFollowing.add(target);
    following.add(caller, callerFollowing);
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    let targetFollowers = switch (followers.get(target)) {
      case (null) { Set.empty<Principal>() };
      case (?set) { set };
    };

    if (not (targetFollowers.contains(caller))) {
      Runtime.trap("Not currently following");
    };

    targetFollowers.remove(caller);
    followers.add(target, targetFollowers);

    // Update following for caller
    let callerFollowing = switch (following.get(caller)) {
      case (null) { Set.empty<Principal>() };
      case (?set) { set };
    };
    callerFollowing.remove(target);
    following.add(caller, callerFollowing);
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view followers");
    };
    switch (followers.get(user)) {
      case (null) { [] };
      case (?set) { set.toArray() };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view following list");
    };
    switch (following.get(user)) {
      case (null) { [] };
      case (?set) { set.toArray() };
    };
  };

  public query ({ caller }) func isFollowing(target : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check following status");
    };
    switch (following.get(caller)) {
      case (null) { false };
      case (?set) { set.contains(target) };
    };
  };

  // Likes
  public shared ({ caller }) func likePost(postId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    switch (postLikes.get(postId)) {
      case (null) { false };
      case (?set) {
        if (set.contains(caller)) {
          set.remove(caller);
          false;
        } else {
          set.add(caller);
          true;
        };
      };
    };
  };

  public query ({ caller }) func getPostLikeCount(postId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view like counts");
    };
    switch (postLikes.get(postId)) {
      case (null) { 0 };
      case (?set) { set.size() };
    };
  };

  public query ({ caller }) func didUserLikePost(user : Principal, postId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check like status");
    };
    switch (postLikes.get(postId)) {
      case (null) { false };
      case (?set) { set.contains(user) };
    };
  };

  // Comments
  public shared ({ caller }) func addComment(postId : Nat, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let comment : Comment = {
      postId;
      author = caller;
      text;
      timestamp = Time.now();
    };

    comments.add(comment);
  };

  public query ({ caller }) func getComments(postId : Nat) : async [Comment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };
    comments.toArray().filter<Comment>(func(c) { c.postId == postId });
  };

  // Stories
  public shared ({ caller }) func createStory(imageBlobKey : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };

    let story : Story = {
      id = nextStoryId;
      author = caller;
      imageBlobKey;
      timestamp = Time.now();
    };

    let userStories = switch (stories.get(caller)) {
      case (null) { List.empty<Story>() };
      case (?list) { list };
    };

    userStories.add(story);
    stories.add(caller, userStories);
    nextStoryId += 1;
  };

  public query ({ caller }) func getActiveStories() : async [(Principal, [Story])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };
    let currentTime = Time.now();
    let validStories = stories.entries().toArray().map(
      func((author, storyList)) {
        (
          author,
          storyList.toArray().filter(
            func(s) { currentTime - s.timestamp < 86400000000000 },
          ),
        );
      }
    );
    validStories.filter<(Principal, [Story])>(func((_, s)) { s.size() > 0 });
  };

  // Feed
  public query ({ caller }) func getFeed() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view feed");
    };
    let followingList = switch (following.get(caller)) {
      case (null) { Set.empty<Principal>() };
      case (?set) { set };
    };

    let allPosts = posts.values().toArray();

    let feedPosts = allPosts.filter(
      func(p) { p.author == caller or followingList.contains(p.author) }
    );

    feedPosts.sort(comparePostsByTimestamp);
  };
};
