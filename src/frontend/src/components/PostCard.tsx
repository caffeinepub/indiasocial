import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Post } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { POST_IMAGES, SAMPLE_PROFILES } from "../utils/sampleData";
import { relativeTimeEn } from "../utils/time";
import { BlobImage } from "./BlobImage";

interface PostCardProps {
  post: Post & { likeCount?: number; commentCount?: number; ownerKey?: string };
  index: number;
  onLike?: (postId: bigint) => void;
  onDelete?: (postId: bigint) => void;
  onOpenComments?: (post: Post) => void;
  liked?: boolean;
  likeCount?: number;
  username?: string;
  avatarInitials?: string;
  avatarColor?: string;
}

export function PostCard({
  post,
  index,
  onLike,
  onDelete,
  onOpenComments,
  liked = false,
  likeCount = 0,
  username,
  avatarInitials = "??",
  avatarColor = "bg-saffron",
}: PostCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isLikedLocal, setIsLikedLocal] = useState(liked);
  const [likeCountLocal, setLikeCountLocal] = useState(likeCount);
  const [heartAnim, setHeartAnim] = useState(false);
  const { identity } = useInternetIdentity();

  const isOwner =
    identity?.getPrincipal().toString() === post.author.toString();

  // Determine image source
  const sampleIndex = Number(post.id - BigInt(1)) % POST_IMAGES.length;
  const imageSrc = post.imageBlobKey?.startsWith("sha256:")
    ? null
    : POST_IMAGES[sampleIndex];

  const handleLike = () => {
    if (!onLike) return;
    setIsLikedLocal((p) => !p);
    setLikeCountLocal((c) => (isLikedLocal ? c - 1 : c + 1));
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    onLike(post.id);
  };

  const displayUsername =
    username ||
    SAMPLE_PROFILES[post.author.toString() as keyof typeof SAMPLE_PROFILES]
      ?.username ||
    `user_${post.author.toString().slice(0, 6)}`;

  const ocidBase = index <= 2 ? `feed.post.item.${index}` : "feed.post.item";

  return (
    <article data-ocid={ocidBase} className="bg-white border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-display font-bold text-sm ring-2 ring-offset-1 ring-saffron`}
          >
            {avatarInitials}
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-foreground leading-none">
              {displayUsername}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {relativeTimeEn(post.timestamp)}
            </p>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowActions((p) => !p)}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="absolute right-0 top-8 bg-white rounded-xl shadow-card-hover border border-border z-10 overflow-hidden min-w-[120px]"
              >
                {isOwner && onDelete && (
                  <button
                    type="button"
                    data-ocid="post.delete_button"
                    onClick={() => {
                      setShowActions(false);
                      onDelete(post.id);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowActions(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-muted overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={post.caption}
            className="w-full h-full object-cover"
            loading="lazy"
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

      {/* Actions */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-4">
          {/* Like */}
          <motion.button
            type="button"
            data-ocid="post.like.button"
            onClick={handleLike}
            whileTap={{ scale: 0.8 }}
            className="flex items-center gap-1.5 group"
          >
            <motion.div
              animate={heartAnim ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLikedLocal
                    ? "fill-red-500 text-red-500"
                    : "text-foreground group-hover:text-red-400"
                }`}
              />
            </motion.div>
          </motion.button>

          {/* Comment */}
          <button
            type="button"
            data-ocid="post.comment.button"
            onClick={() => onOpenComments?.(post)}
            className="flex items-center gap-1.5 group"
          >
            <MessageCircle className="w-6 h-6 text-foreground group-hover:text-navy transition-colors" />
          </button>
        </div>

        {/* Like count */}
        {likeCountLocal > 0 && (
          <p className="font-display font-semibold text-sm text-foreground">
            {likeCountLocal.toLocaleString()} like
            {likeCountLocal !== 1 ? "s" : ""}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-foreground">
            <span className="font-display font-semibold mr-1">
              {displayUsername}
            </span>
            {post.caption}
          </p>
        )}

        {/* View comments */}
        <button
          type="button"
          onClick={() => onOpenComments?.(post)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View comments
        </button>
      </div>
    </article>
  );
}
