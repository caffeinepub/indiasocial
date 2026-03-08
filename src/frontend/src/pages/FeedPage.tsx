import { motion } from "motion/react";
import { useState } from "react";
import type { Post } from "../backend.d";
import { AshokaChakra } from "../components/AshokaChakra";
import { PostCard } from "../components/PostCard";
import { PostDetailModal } from "../components/PostDetailModal";
import { StoryCircle } from "../components/StoryCircle";
import { Skeleton } from "../components/ui/skeleton";
import {
  useDeletePost,
  useGetActiveStories,
  useGetAllPosts,
  useGetFeed,
  useLikePost,
} from "../hooks/useQueries";
import {
  POST_IMAGES,
  SAMPLE_POSTS,
  SAMPLE_PROFILES,
  SAMPLE_STORIES,
} from "../utils/sampleData";

function PostSkeleton() {
  return (
    <div className="bg-white border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="w-full aspect-square" />
      <div className="px-4 py-3 space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function FeedPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: feedPosts, isLoading: feedLoading } = useGetFeed();
  const { data: allPosts, isLoading: allLoading } = useGetAllPosts();
  const { data: activeStories = [] } = useGetActiveStories();
  const likePost = useLikePost();
  const deletePost = useDeletePost();

  // Use feed posts if available, fall back to all posts, then sample data
  // biome-ignore lint/suspicious/noExplicitAny: sample data type is compatible
  const posts = feedPosts?.length
    ? feedPosts
    : allPosts?.length
      ? allPosts
      : (SAMPLE_POSTS as any);

  const isLoading = feedLoading || allLoading;

  // Stories: use real + sample
  const storyItems = [
    // "Add story" circle for own user
    {
      principalStr: "own",
      username: "Your Story",
      imageIndex: -1,
      isOwn: true,
      ringVariant: "saffron" as const,
    },
    // Real stories from backend
    ...activeStories.map(([p, storyList], i) => ({
      principalStr: p.toString(),
      username:
        SAMPLE_PROFILES[p.toString() as keyof typeof SAMPLE_PROFILES]
          ?.username || p.toString().slice(0, 8),
      imageIndex: i % POST_IMAGES.length,
      isOwn: false,
      ringVariant: (["saffron", "green", "navy"] as const)[i % 3],
      _storyList: storyList,
    })),
    // Sample stories if no real ones
    ...(!activeStories.length
      ? SAMPLE_STORIES.map((s, i) => ({
          ...s,
          isOwn: false,
          ringVariant: (["saffron", "green", "navy", "saffron"] as const)[
            i % 4
          ],
        }))
      : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <h1 className="font-display text-2xl font-bold">
            India<span className="text-saffron">Social</span>
          </h1>
          <div className="flex items-center gap-2">
            <AshokaChakra size={28} color="oklch(0.28 0.16 265)" />
          </div>
        </div>
      </header>

      {/* Stories strip */}
      <div
        data-ocid="feed.stories.panel"
        className="bg-white border-b border-border"
      >
        <div className="max-w-lg mx-auto">
          <div className="flex gap-4 px-4 py-4 overflow-x-auto scrollbar-hide">
            {storyItems.map((story, i) => (
              <StoryCircle
                key={`${story.principalStr}-${i}`}
                username={story.username}
                initials={story.username.slice(0, 2).toUpperCase()}
                imageUrl={
                  !story.isOwn && story.imageIndex >= 0
                    ? POST_IMAGES[story.imageIndex]
                    : undefined
                }
                hasStory={!story.isOwn}
                isOwn={story.isOwn}
                ringVariant={story.ringVariant}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <main className="flex-1 max-w-lg mx-auto w-full pb-24">
        {isLoading ? (
          <div data-ocid="feed.loading_state">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
            <AshokaChakra size={56} color="oklch(0.73 0.19 55)" />
            <div className="text-center">
              <h3 className="font-display font-semibold text-lg text-foreground">
                अभी कोई पोस्ट नहीं
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Follow people or create your first post!
              </p>
            </div>
          </div>
        ) : (
          <div>
            {posts.map((post: any, i: number) => (
              <motion.div
                key={post.id.toString()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <PostCard
                  post={post}
                  index={i + 1}
                  onLike={(id) => likePost.mutate(id)}
                  onDelete={(id) => deletePost.mutate(id)}
                  onOpenComments={setSelectedPost}
                  likeCount={post.likeCount ?? 0}
                  avatarInitials={
                    SAMPLE_PROFILES[
                      post.author.toString() as keyof typeof SAMPLE_PROFILES
                    ]?.username
                      ?.slice(0, 2)
                      .toUpperCase() ||
                    post.author.toString().slice(0, 2).toUpperCase()
                  }
                  avatarColor={
                    ["bg-saffron", "bg-india-green", "bg-navy"][
                      post.id ? Number(post.id) % 3 : 0
                    ]
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Post detail modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
