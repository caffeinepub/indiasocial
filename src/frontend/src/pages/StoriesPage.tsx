import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { useCreateStory, useGetActiveStories } from "../hooks/useQueries";
import {
  POST_IMAGES,
  SAMPLE_PROFILES,
  SAMPLE_STORIES,
} from "../utils/sampleData";
import { relativeTimeEn } from "../utils/time";

interface StoryViewItem {
  username: string;
  imageUrl: string;
  timestamp: bigint;
}

function StoryViewer({
  stories,
  startIndex,
  onClose,
}: {
  stories: StoryViewItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const STORY_DURATION = 5000;

  const story = stories[current];

  useEffect(() => {
    setProgress(0);
    const start = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (current < stories.length - 1) {
          setCurrent((c) => c + 1);
        } else {
          onClose();
        }
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [current, stories.length, onClose]);

  return (
    <div
      data-ocid="story.view.panel"
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-4 pt-4 flex-shrink-0">
        {stories.map((_, storyBarIdx) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: Progress bars are positional
            key={storyBarIdx}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white rounded-full"
              style={{
                width:
                  storyBarIdx < current
                    ? "100%"
                    : storyBarIdx === current
                      ? `${progress}%`
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {story?.username.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {story?.username}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full bg-black/30"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Story image */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={story?.imageUrl}
            alt="Story"
            initial={{ opacity: 0.7, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Tap areas */}
        <button
          type="button"
          aria-label="Previous story"
          className="absolute left-0 top-0 w-1/3 h-full z-10"
          onClick={() => current > 0 && setCurrent((c) => c - 1)}
        />
        <button
          type="button"
          aria-label="Next story"
          className="absolute right-0 top-0 w-1/3 h-full z-10"
          onClick={() => {
            if (current < stories.length - 1) {
              setCurrent((c) => c + 1);
            } else {
              onClose();
            }
          }}
        />

        {/* Nav arrows */}
        {current > 0 && (
          <button
            type="button"
            onClick={() => setCurrent((c) => c - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        {current < stories.length - 1 && (
          <button
            type="button"
            onClick={() => setCurrent((c) => c + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

export function StoriesPage() {
  const [viewingStories, setViewingStories] = useState<StoryViewItem[] | null>(
    null,
  );
  const [uploadFileState, setUploadFileState] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: activeStories = [] } = useGetActiveStories();
  const createStory = useCreateStory();
  const { uploadFile: uploadBlob, isUploading } = useBlobStorage();

  const storyGroups = activeStories.length
    ? activeStories.map(([p, stories]) => ({
        principalStr: p.toString(),
        username:
          SAMPLE_PROFILES[p.toString() as keyof typeof SAMPLE_PROFILES]
            ?.username || p.toString().slice(0, 8),
        stories: stories.map((s) => ({
          username:
            SAMPLE_PROFILES[p.toString() as keyof typeof SAMPLE_PROFILES]
              ?.username || p.toString().slice(0, 8),
          imageUrl: POST_IMAGES[Number(s.id) % POST_IMAGES.length],
          timestamp: s.timestamp,
        })),
      }))
    : SAMPLE_STORIES.map((s) => ({
        principalStr: s.principalStr,
        username: s.username,
        stories: [
          {
            username: s.username,
            imageUrl: POST_IMAGES[s.imageIndex],
            timestamp: s.timestamp,
          },
        ],
      }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileState(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateStory = async () => {
    if (!uploadFileState) return;
    try {
      const key = await uploadBlob(uploadFileState);
      await createStory.mutateAsync(key);
      toast.success("स्टोरी शेयर हो गई! 🌟 Story shared!");
      setUploadFileState(null);
      setUploadPreview(null);
    } catch {
      toast.error("Failed to share story. Try again.");
    }
  };

  const isPending = createStory.isPending || isUploading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <h1 className="font-display text-xl font-bold text-foreground">
            Stories
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full pb-24">
        {/* Add story section */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-display font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Your Story
          </h2>
          <div className="flex flex-col gap-3">
            {uploadPreview ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                <img
                  src={uploadPreview}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUploadFileState(null);
                    setUploadPreview(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <button
                    type="button"
                    data-ocid="story.create.upload_button"
                    onClick={handleCreateStory}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-saffron text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-saffron disabled:opacity-60"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Share Story"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="story.create.upload_button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-saffron/40 hover:bg-accent transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center flex-shrink-0">
                  <ImagePlus className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">
                    Add to your story
                  </p>
                  <p className="text-xs text-muted-foreground">
                    अपनी स्टोरी जोड़ें • Visible for 24 hours
                  </p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Stories from others */}
        <div className="px-4 pt-4">
          <h2 className="text-sm font-display font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Recent Stories
          </h2>
          <div className="space-y-0.5">
            {storyGroups.map((group, i) => (
              <motion.button
                type="button"
                key={group.principalStr}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setViewingStories(group.stories)}
                className="flex items-center gap-3 w-full p-3 hover:bg-muted rounded-xl transition-colors text-left"
              >
                <div
                  className={`p-0.5 rounded-full ${
                    [
                      "story-ring-saffron",
                      "story-ring-green",
                      "story-ring-navy",
                    ][i % 3]
                  }`}
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-muted overflow-hidden">
                      <img
                        src={group.stories[0].imageUrl}
                        alt={group.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground">
                    {group.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {relativeTimeEn(group.stories[0].timestamp)} •{" "}
                    {group.stories.length} story
                    {group.stories.length > 1 ? "ies" : ""}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Story Viewer */}
      {viewingStories && (
        <StoryViewer
          stories={viewingStories}
          startIndex={0}
          onClose={() => setViewingStories(null)}
        />
      )}
    </div>
  );
}
