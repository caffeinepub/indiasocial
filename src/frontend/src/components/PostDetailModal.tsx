import { Principal } from "@dfinity/principal";
import { Heart, Loader2, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Post } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddComment,
  useDidUserLikePost,
  useGetComments,
  useGetPostLikeCount,
  useGetUserProfile,
  useLikePost,
} from "../hooks/useQueries";
import { POST_IMAGES, SAMPLE_PROFILES } from "../utils/sampleData";
import { relativeTimeEn } from "../utils/time";
import { BlobImage } from "./BlobImage";

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
}

function CommentItem({
  authorPrincipal,
  text,
  timestamp,
}: {
  authorPrincipal: string;
  text: string;
  timestamp: bigint;
}) {
  let principal: Principal | null = null;
  try {
    principal = Principal.fromText(authorPrincipal);
  } catch {
    // ignore
  }
  const { data: profile } = useGetUserProfile(principal);
  const displayName =
    profile?.username ||
    SAMPLE_PROFILES[authorPrincipal as keyof typeof SAMPLE_PROFILES]
      ?.username ||
    authorPrincipal.slice(0, 8);

  return (
    <div className="flex gap-2 px-4 py-2">
      <div className="w-7 h-7 rounded-full bg-saffron flex-shrink-0 flex items-center justify-center">
        <span className="text-white font-bold text-xs">
          {displayName.slice(0, 1).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-display font-semibold mr-1">{displayName}</span>
          {text}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {relativeTimeEn(timestamp)}
        </p>
      </div>
    </div>
  );
}

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const [commentText, setCommentText] = useState("");
  const { identity } = useInternetIdentity();

  const { data: comments = [], isLoading: commentsLoading } = useGetComments(
    post?.id ?? BigInt(0),
  );
  const { data: likeCount = BigInt(0) } = useGetPostLikeCount(
    post?.id ?? BigInt(0),
  );
  const { data: didLike = false } = useDidUserLikePost(
    identity?.getPrincipal() || null,
    post?.id ?? BigInt(0),
  );
  const likePost = useLikePost();
  const addComment = useAddComment();

  if (!post) return null;

  const sampleIndex = Number(post.id - BigInt(1)) % POST_IMAGES.length;
  const imageSrc = post.imageBlobKey?.startsWith("sha256:")
    ? null
    : POST_IMAGES[sampleIndex];

  const displayUsername =
    SAMPLE_PROFILES[post.author.toString() as keyof typeof SAMPLE_PROFILES]
      ?.username || `user_${post.author.toString().slice(0, 6)}`;

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || addComment.isPending) return;
    await addComment.mutateAsync({ postId: post.id, text: commentText.trim() });
    setCommentText("");
  };

  return (
    <AnimatePresence>
      <div
        data-ocid="post_detail.modal"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 bg-white w-full max-w-lg sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {displayUsername.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-display font-semibold text-sm">
                {displayUsername}
              </span>
            </div>
            <button
              type="button"
              data-ocid="post_detail.close_button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Image */}
          <div className="w-full aspect-square bg-muted flex-shrink-0">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            ) : (
              <BlobImage
                blobKey={post.imageBlobKey}
                alt={post.caption}
                className="w-full h-full object-cover"
                fallback={POST_IMAGES[sampleIndex]}
              />
            )}
          </div>

          {/* Likes & Caption */}
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => likePost.mutate(post.id)}
                className="flex items-center gap-1.5"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    didLike ? "fill-red-500 text-red-500" : "text-foreground"
                  }`}
                />
              </button>
              <span className="font-display font-semibold text-sm">
                {Number(likeCount).toLocaleString()} likes
              </span>
            </div>
            {post.caption && (
              <p className="text-sm text-foreground">
                <span className="font-display font-semibold mr-1">
                  {displayUsername}
                </span>
                {post.caption}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-saffron" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-sm">
                  पहले comment करें! Be the first to comment.
                </p>
              </div>
            ) : (
              comments.map((c, commentIdx) => (
                <CommentItem
                  // biome-ignore lint/suspicious/noArrayIndexKey: Comments don't have unique IDs
                  key={commentIdx}
                  authorPrincipal={c.author.toString()}
                  text={c.text}
                  timestamp={c.timestamp}
                />
              ))
            )}
          </div>

          {/* Comment input */}
          <form
            onSubmit={handleComment}
            className="flex items-center gap-2 px-4 py-3 border-t border-border flex-shrink-0"
          >
            <div className="w-7 h-7 rounded-full bg-india-green flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {identity
                  ?.getPrincipal()
                  .toString()
                  .slice(0, 1)
                  .toUpperCase() || "?"}
              </span>
            </div>
            <input
              data-ocid="comment.input"
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="टिप्पणी करें... Add a comment"
              className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <button
              data-ocid="comment.submit_button"
              type="submit"
              disabled={!commentText.trim() || addComment.isPending}
              className="p-2 rounded-full bg-saffron text-white disabled:opacity-40 transition-all hover:bg-saffron-dark active:scale-90"
            >
              {addComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
