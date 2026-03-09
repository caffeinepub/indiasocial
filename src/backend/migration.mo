import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";

module {
  // Types from old actor
  type OldUserProfile = {
    username : Text;
    bio : Text;
    avatarBlobKey : Text;
  };

  type OldPost = {
    id : Nat;
    author : Principal;
    imageBlobKey : Text;
    caption : Text;
    timestamp : Int;
  };

  type OldComment = {
    postId : Nat;
    author : Principal;
    text : Text;
    timestamp : Int;
  };

  type OldStory = {
    id : Nat;
    author : Principal;
    imageBlobKey : Text;
    timestamp : Int;
  };

  type OldActor = {
    nextPostId : Nat;
    nextStoryId : Nat;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    posts : Map.Map<Nat, OldPost>;
    comments : List.List<OldComment>;
    followers : Map.Map<Principal, Set.Set<Principal>>;
    following : Map.Map<Principal, Set.Set<Principal>>;
    postLikes : Map.Map<Nat, Set.Set<Principal>>;
    stories : Map.Map<Principal, List.List<OldStory>>;
    accessControlState : AccessControl.AccessControlState;
  };

  // Types for new actor
  type ChatMessage = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    text : Text;
    timestamp : Int;
    isRead : Bool;
  };

  type NewActor = {
    nextPostId : Nat;
    nextStoryId : Nat;
    nextMessageId : Nat;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    posts : Map.Map<Nat, OldPost>;
    comments : List.List<OldComment>;
    followers : Map.Map<Principal, Set.Set<Principal>>;
    following : Map.Map<Principal, Set.Set<Principal>>;
    postLikes : Map.Map<Nat, Set.Set<Principal>>;
    stories : Map.Map<Principal, List.List<OldStory>>;
    messages : List.List<ChatMessage>;
    accessControlState : AccessControl.AccessControlState;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    {
      old with
      nextMessageId = 0;
      messages = List.empty<ChatMessage>();
    };
  };
};
