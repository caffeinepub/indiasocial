interface StoryCircleProps {
  username: string;
  initials: string;
  imageUrl?: string;
  hasStory?: boolean;
  isOwn?: boolean;
  onClick?: () => void;
  ringVariant?: "saffron" | "green" | "navy";
}

const RING_CLASSES = {
  saffron: "story-ring-saffron",
  green: "story-ring-green",
  navy: "story-ring-navy",
};

const AVATAR_COLORS = ["bg-saffron", "bg-india-green", "bg-navy", "bg-primary"];

export function StoryCircle({
  username,
  initials,
  imageUrl,
  hasStory = true,
  isOwn = false,
  onClick,
  ringVariant = "saffron",
}: StoryCircleProps) {
  const ringClass = RING_CLASSES[ringVariant];
  const colorIdx = username.charCodeAt(0) % AVATAR_COLORS.length;
  const avatarBg = AVATAR_COLORS[colorIdx];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 min-w-[68px]"
    >
      <div
        className={`w-[68px] h-[68px] rounded-full p-[2.5px] ${hasStory ? ringClass : "bg-muted"}`}
      >
        <div className="w-full h-full rounded-full bg-white p-[2px]">
          <div
            className={`w-full h-full rounded-full overflow-hidden ${imageUrl ? "" : avatarBg} flex items-center justify-center`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-display font-bold text-sm">
                {initials.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
      <span className="text-xs text-foreground font-medium max-w-[68px] truncate text-center">
        {isOwn ? "Your Story" : username.split("_")[0]}
      </span>
    </button>
  );
}
