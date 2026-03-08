import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Post } from "../backend.d";
import { PostDetailModal } from "../components/PostDetailModal";
import { Skeleton } from "../components/ui/skeleton";
import { useGetAllPosts } from "../hooks/useQueries";
import { POST_IMAGES, SAMPLE_POSTS } from "../utils/sampleData";

export function ExplorePage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [search, setSearch] = useState("");

  const { data: allPosts, isLoading } = useGetAllPosts();

  const posts: any[] = allPosts?.length ? allPosts : SAMPLE_POSTS;

  const filtered = search.trim()
    ? posts.filter((p: any) =>
        p.caption?.toLowerCase().includes(search.toLowerCase()),
      )
    : posts;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-display text-xl font-bold text-foreground mb-3">
            Explore
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="खोजें • Search posts..."
              className="w-full pl-9 pr-4 py-2.5 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="flex-1 pb-24">
        <div data-ocid="explore.grid.panel" className="max-w-lg mx-auto">
          {isLoading ? (
            <div
              data-ocid="explore.loading_state"
              className="grid grid-cols-3 gap-0.5"
            >
              {Array.from({ length: 9 }).map((_, skelIdx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders are positional
                <Skeleton key={skelIdx} className="aspect-square" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-5xl">🔍</p>
              <p className="font-display font-semibold text-foreground">
                कोई पोस्ट नहीं मिली
              </p>
              <p className="text-sm text-muted-foreground">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {filtered.map((post: any, i: number) => {
                const sampleIndex =
                  Number(post.id - BigInt(1)) % POST_IMAGES.length;
                const imageSrc = post.imageBlobKey?.startsWith("sha256:")
                  ? undefined
                  : POST_IMAGES[sampleIndex];

                return (
                  <motion.button
                    key={post.id.toString()}
                    data-ocid={
                      i === 0 ? "explore.post.item.1" : "explore.post.item"
                    }
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedPost(post)}
                    className="aspect-square bg-muted overflow-hidden relative group"
                  >
                    <img
                      src={imageSrc || POST_IMAGES[sampleIndex]}
                      alt={post.caption || "Post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
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
