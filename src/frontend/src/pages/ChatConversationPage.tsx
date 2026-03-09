import type { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetConversation,
  useGetUserProfile,
  useMarkMessagesRead,
  useSendMessage,
} from "../hooks/useQueries";

interface ChatConversationPageProps {
  otherUser: Principal;
  onBack: () => void;
}

function formatMessageTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const d = new Date(ms);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday) return time;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${time}`;
}

export function ChatConversationPage({
  otherUser,
  onBack,
}: ChatConversationPageProps) {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const { data: profile } = useGetUserProfile(otherUser);
  const { data: messages = [], isLoading } = useGetConversation(otherUser);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const username = profile?.username || `${otherUser.toString().slice(0, 10)}…`;
  const initials = username.slice(0, 2).toUpperCase();

  // Auto-scroll to bottom when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages array reference change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markReadMutate = markRead.mutate;
  // Mark as read when opening and when messages update
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when message count changes
  useEffect(() => {
    if (otherUser) {
      markReadMutate(otherUser);
    }
  }, [otherUser, messages.length, markReadMutate]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;
    setText("");
    sendMessage.mutate({ receiver: otherUser, text: trimmed });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-lg mx-auto px-3 h-14 flex items-center gap-3">
          <button
            type="button"
            data-ocid="chat.conversation.button"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center ring-2 ring-saffron/20 flex-shrink-0">
            <span className="text-white font-display font-bold text-xs">
              {initials}
            </span>
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm text-foreground truncate">
              {username}
            </p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-2 max-w-lg mx-auto w-full">
        {isLoading ? (
          <div
            data-ocid="chat.conversation.loading_state"
            className="space-y-3"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders are positional
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <Skeleton
                  className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div
            data-ocid="chat.conversation.empty_state"
            className="flex flex-col items-center justify-center h-full py-16 gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-saffron">
                {initials}
              </span>
            </div>
            <p className="font-display font-semibold text-foreground">
              {username}
            </p>
            <p className="text-sm text-muted-foreground text-center px-8">
              पहला message भेजें! 👋
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.sender.toString() === myPrincipal;
            const prevMsg = i > 0 ? messages[i - 1] : null;
            const showTime =
              !prevMsg ||
              Number(msg.timestamp - prevMsg.timestamp) / 1_000_000 >
                5 * 60 * 1000;

            return (
              <div key={msg.id.toString()}>
                {showTime && (
                  <p className="text-center text-[10px] text-muted-foreground py-1">
                    {formatMessageTime(msg.timestamp)}
                  </p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMine
                        ? "bg-saffron text-white rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                    {!showTime && (
                      <p
                        className={`text-[9px] mt-0.5 ${isMine ? "text-white/70 text-right" : "text-muted-foreground"}`}
                      >
                        {formatMessageTime(msg.timestamp)}
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-white border-t border-border safe-area-inset-bottom">
        <div className="max-w-lg mx-auto px-3 py-2 flex items-center gap-2">
          <Input
            ref={inputRef}
            data-ocid="chat.input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message लिखें…"
            className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-saffron/60 text-sm"
            disabled={sendMessage.isPending}
            autoComplete="off"
          />
          <Button
            type="button"
            data-ocid="chat.submit_button"
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
            className="w-10 h-10 rounded-full bg-saffron hover:bg-saffron-dark text-white p-0 flex items-center justify-center flex-shrink-0 shadow-saffron transition-all active:scale-95 disabled:opacity-50"
            aria-label="Send message"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
