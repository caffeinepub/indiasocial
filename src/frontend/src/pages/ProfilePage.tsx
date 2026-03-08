import { Principal } from "@dfinity/principal";
import { Edit2, Grid, Loader2, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Post } from "../backend.d";
import { AshokaChakra } from "../components/AshokaChakra";
import { EditProfileModal } from "../components/EditProfileModal";
import { PostDetailModal } from "../components/PostDetailModal";
import { Skeleton } from "../components/ui/skeleton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  useGetAllPosts,
  useGetCallerUserProfile,
  useGetFollowers,
  useGetFollowing,
  useGetPostsByUser,
  useGetUserProfile,
  useIsFollowing,
  useUnfollowUser,
} from "../hooks/useQueries";
import {
  POST_IMAGES,
  SAMPLE_POSTS,
  SAMPLE_PROFILES,
} from "../utils/sampleData";

interface ProfilePageProps {
  userId?: string; // Principal string for viewing another user's profile
  onLogout?: () => void;
}

export function ProfilePage({ userId, onLogout }: ProfilePageProps) {
  const { identity } = useInternetIdentity();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const isOwnProfile =
    !userId || userId === identity?.getPrincipal().toString();

  const targetPrincipal = (() => {
    if (isOwnProfile) return identity?.getPrincipal() || null;
    try {
      return Principal.fromText(userId!);
    } catch {
      return null;
    }
  })();

  const { data: ownProfile, isLoading: ownLoading } = useGetCallerUserProfile();
  const { data: otherProfile, isLoading: otherLoading } = useGetUserProfile(
    isOwnProfile ? null : targetPrincipal,
  );

  const profile = isOwnProfile ? ownProfile : otherProfile;
  const profileLoading = isOwnProfile ? ownLoading : otherLoading;

  const { data: userPosts = [], isLoading: postsLoading } =
    useGetPostsByUser(targetPrincipal);
  const { data: allPosts = [] } = useGetAllPosts();
  const { data: followers = [] } = useGetFollowers(targetPrincipal);
  const { data: following = [] } = useGetFollowing(targetPrincipal);
  const { data: isFollowingTarget = false } = useIsFollowing(
    isOwnProfile ? null : targetPrincipal,
  );
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Use real posts or sample
  const posts = userPosts.length
    ? userPosts
    : isOwnProfile
      ? allPosts.filter(
          (p) => p.author.toString() === identity?.getPrincipal().toString(),
        )
      : [];

  // Display posts - use sample if own profile and no posts yet
  const displayPosts: any[] = posts.length
    ? posts
    : isOwnProfile
      ? SAMPLE_POSTS.slice(0, 6)
      : [];

  const displayUsername =
    profile?.username ||
    (userId &&
      SAMPLE_PROFILES[userId as keyof typeof SAMPLE_PROFILES]?.username) ||
    (isOwnProfile ? "Your Profile" : "User");

  const displayBio =
    profile?.bio ||
    (userId && SAMPLE_PROFILES[userId as keyof typeof SAMPLE_PROFILES]?.bio) ||
    "";

  const handleFollowToggle = () => {
    if (!targetPrincipal) return;
    if (isFollowingTarget) {
      unfollowUser.mutate(targetPrincipal);
    } else {
      followUser.mutate(targetPrincipal);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">
            {displayUsername}
          </h1>
          {isOwnProfile && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Logout"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full pb-24">
        {profileLoading ? (
          <div
            data-ocid="profile.loading_state"
            className="px-4 pt-6 space-y-4"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Profile info */}
            <div className="px-4 pt-5 pb-4">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-saffron flex items-center justify-center ring-2 ring-saffron ring-offset-2">
                    <span className="text-white font-display font-bold text-2xl">
                      {displayUsername.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1">
                  <div className="flex gap-4">
                    {[
                      { label: "Posts", value: displayPosts.length },
                      { label: "Followers", value: followers.length },
                      { label: "Following", value: following.length },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="font-display font-bold text-lg text-foreground leading-none">
                          {value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name & Bio */}
              <div className="mt-3 space-y-1">
                <p className="font-display font-semibold text-sm text-foreground">
                  {displayUsername}
                </p>
                {displayBio && (
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {displayBio}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                {isOwnProfile ? (
                  <>
                    <button
                      type="button"
                      data-ocid="profile.edit_button"
                      onClick={() => setEditOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm py-2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    data-ocid={
                      isFollowingTarget
                        ? "profile.unfollow.button"
                        : "profile.follow.button"
                    }
                    onClick={handleFollowToggle}
                    disabled={followUser.isPending || unfollowUser.isPending}
                    className={`flex-1 flex items-center justify-center gap-1.5 font-display font-semibold text-sm py-2 rounded-lg transition-all ${
                      isFollowingTarget
                        ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
                        : "bg-saffron hover:bg-saffron-dark text-white shadow-saffron"
                    }`}
                  >
                    {followUser.isPending || unfollowUser.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowingTarget ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Tricolor divider */}
            <div className="flex h-0.5 mx-4 mb-0.5 rounded-full overflow-hidden">
              <div className="flex-1 bg-saffron" />
              <div className="flex-1 bg-white border-y border-gray-100" />
              <div className="flex-1 bg-india-green" />
            </div>

            {/* Posts tab header */}
            <div className="flex border-b border-border">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-b-2 border-navy text-navy"
              >
                <Grid className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Posts
                </span>
              </button>
            </div>

            {/* Posts grid */}
            <div data-ocid="profile.posts.panel">
              {postsLoading ? (
                <div
                  data-ocid="profile.loading_state"
                  className="grid grid-cols-3 gap-0.5"
                >
                  {Array.from({ length: 6 }).map((_, skelIdx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders are positional
                    <Skeleton key={skelIdx} className="aspect-square" />
                  ))}
                </div>
              ) : displayPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <AshokaChakra size={48} color="oklch(0.73 0.19 55 / 0.4)" />
                  <p className="text-muted-foreground text-sm">
                    कोई पोस्ट नहीं • No posts yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5">
                  {displayPosts.map((post: any, i: number) => {
                    const sampleIndex =
                      Number(post.id - BigInt(1)) % POST_IMAGES.length;
                    return (
                      <motion.button
                        key={post.id.toString()}
                        data-ocid={
                          i === 0 ? "profile.post.item.1" : "profile.post.item"
                        }
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedPost(post)}
                        className="aspect-square bg-muted overflow-hidden relative group"
                      >
                        <img
                          src={POST_IMAGES[sampleIndex]}
                          alt={post.caption || "Post"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Post detail modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Edit profile modal */}
      <EditProfileModal
        open={editOpen}
        currentProfile={ownProfile || null}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
