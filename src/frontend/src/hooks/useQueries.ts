import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment, Post, Story, UserProfile } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── Profile ───────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useCreateOrUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      bio,
      avatarBlobKey,
    }: {
      username: string;
      bio: string;
      avatarBlobKey: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createOrUpdateProfile(username, bio, avatarBlobKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Posts ─────────────────────────────────────────────────────────────────

export function useGetFeed() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Post[]>({
    queryKey: ["feed", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getFeed();
      return [...posts].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 30000,
  });
}

export function useGetAllPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ["allPosts"],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getAllPosts();
      return [...posts].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useGetPostsByUser(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ["postsByUser", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const posts = await actor.getPostsByUser(principal);
      return [...posts].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageBlobKey,
      caption,
    }: {
      imageBlobKey: string;
      caption: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPost(imageBlobKey, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["postsByUser"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["postsByUser"] });
    },
  });
}

// ─── Likes ─────────────────────────────────────────────────────────────────

export function useGetPostLikeCount(postId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["postLikes", postId.toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getPostLikeCount(postId);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDidUserLikePost(
  principal: Principal | null,
  postId: bigint,
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["didLike", principal?.toString(), postId.toString()],
    queryFn: async () => {
      if (!actor || !principal) return false;
      return actor.didUserLikePost(principal, postId);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.likePost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({
        queryKey: ["postLikes", postId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "didLike",
          identity?.getPrincipal().toString(),
          postId.toString(),
        ],
      });
    },
  });
}

// ─── Comments ──────────────────────────────────────────────────────────────

export function useGetComments(postId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ["comments", postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const comments = await actor.getComments(postId);
      return [...comments].sort(
        (a, b) => Number(a.timestamp) - Number(b.timestamp),
      );
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      text,
    }: {
      postId: bigint;
      text: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addComment(postId, text);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId.toString()],
      });
    },
  });
}

// ─── Follow ─────────────────────────────────────────────────────────────────

export function useIsFollowing(target: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: [
      "isFollowing",
      identity?.getPrincipal().toString(),
      target?.toString(),
    ],
    queryFn: async () => {
      if (!actor || !target) return false;
      return actor.isFollowing(target);
    },
    enabled: !!actor && !actorFetching && !!target && !!identity,
  });
}

export function useGetFollowers(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["followers", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowers(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useGetFollowing(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["following", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowing(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.followUser(target);
    },
    onSuccess: (_, target) => {
      queryClient.invalidateQueries({
        queryKey: [
          "isFollowing",
          identity?.getPrincipal().toString(),
          target.toString(),
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["followers", target.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["following", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unfollowUser(target);
    },
    onSuccess: (_, target) => {
      queryClient.invalidateQueries({
        queryKey: [
          "isFollowing",
          identity?.getPrincipal().toString(),
          target.toString(),
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["followers", target.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["following", identity?.getPrincipal().toString()],
      });
    },
  });
}

// ─── Stories ───────────────────────────────────────────────────────────────

export function useGetActiveStories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, Array<Story>]>>({
    queryKey: ["activeStories"],
    queryFn: async () => {
      if (!actor) return [];
      const stories = await actor.getActiveStories();
      const now = BigInt(Date.now()) * BigInt(1_000_000);
      const twentyFourHoursNs = BigInt(24 * 60 * 60 * 1_000_000_000);
      return stories
        .map(([p, storyList]) => {
          const active = storyList.filter(
            (s) => now - s.timestamp < twentyFourHoursNs,
          );
          return [p, active] as [Principal, Story[]];
        })
        .filter(([, storyList]) => storyList.length > 0);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 60000,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageBlobKey: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createStory(imageBlobKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeStories"] });
    },
  });
}
