import type { Principal } from "@icp-sdk/core/principal";
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "../components/ui/skeleton";
import { useGetConversations, useGetUserProfile } from "../hooks/useQueries";

interface ChatListPageProps {
  onOpenConversation: (userId: Principal) => void;
}

// Formats timestamp into human-readable Hindi/English relative time
function formatTime(timestamp: bigint): string {
  const msTimestamp = Number(timestamp) / 1_000_000;
  const now = Date.now();
  const diffMs = now - msTimestamp;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "अभी";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(msTimestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

interface ConversationRowProps {
  principal: Principal;
  lastMessage: {
    text: string;
    isRead: boolean;
    timestamp: bigint;
    sender: Principal;
  };
  myPrincipal: string;
  index: number;
  onClick: () => void;
}

function ConversationRow({
  principal,
  lastMessage,
  myPrincipal,
  index,
  onClick,
}: ConversationRowProps) {
  const { data: profile } = useGetUserProfile(principal);
  const username = profile?.username || `${principal.toString().slice(0, 8)}…`;
  const initials = username.slice(0, 2).toUpperCase();
  const isUnread =
    !lastMessage.isRead && lastMessage.sender.toString() !== myPrincipal;
  const ocid =
    index === 0
      ? "chat.item.1"
      : index === 1
        ? "chat.item.2"
        : index === 2
          ? "chat.item.3"
          : "chat.item";

  return (
    <motion.button
      type="button"
      data-ocid={ocid}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors text-left active:bg-accent/50"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-saffron flex items-center justify-center ring-2 ring-saffron/20">
          <span className="text-white font-display font-bold text-sm">
            {initials}
          </span>
        </div>
        {isUnread && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-destructive rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-display text-sm truncate ${isUnread ? "font-bold text-foreground" : "font-semibold text-foreground"}`}
          >
            {username}
          </span>
          <span
            className={`text-xs flex-shrink-0 ${isUnread ? "text-saffron font-semibold" : "text-muted-foreground"}`}
          >
            {formatTime(lastMessage.timestamp)}
          </span>
        </div>
        <p
          className={`text-xs truncate mt-0.5 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}
        >
          {lastMessage.sender.toString() === myPrincipal ? "आपने: " : ""}
          {lastMessage.text}
        </p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-saffron" />
      )}
    </motion.button>
  );
}

export function ChatListPage({ onOpenConversation }: ChatListPageProps) {
  const { data: conversations = [], isLoading } = useGetConversations();
  // Get my principal from the identity via the first conversation if available
  const myPrincipal = "";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">
            Messages
          </h1>
          <div className="flex items-center gap-1">
            <div className="flex h-5 gap-0.5">
              <div className="w-1.5 rounded-full bg-saffron" />
              <div className="w-1.5 rounded-full bg-white border border-gray-200" />
              <div className="w-1.5 rounded-full bg-india-green" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full pb-24">
        {isLoading ? (
          <div data-ocid="chat.loading_state" className="px-4 py-3 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div
            data-ocid="chat.empty_state"
            className="flex flex-col items-center justify-center py-20 gap-4 px-8"
          >
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <MessageCircle
                className="w-8 h-8 text-saffron"
                strokeWidth={1.5}
              />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-foreground">
                कोई chat नहीं
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                अभी कोई chat नहीं है। किसी user की profile पर जाकर message करें।
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {conversations.map(([principal, lastMsg], index) => (
              <ConversationRow
                key={principal.toString()}
                principal={principal}
                lastMessage={lastMsg}
                myPrincipal={myPrincipal}
                index={index}
                onClick={() => onOpenConversation(principal)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
