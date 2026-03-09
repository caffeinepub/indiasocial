import { Toaster } from "@/components/ui/sonner";
import type { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { SetupProfileModal } from "./components/SetupProfileModal";
import { UploadPostModal } from "./components/UploadPostModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { ChatConversationPage } from "./pages/ChatConversationPage";
import { ChatListPage } from "./pages/ChatListPage";
import { ExplorePage } from "./pages/ExplorePage";
import { FeedPage } from "./pages/FeedPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StoriesPage } from "./pages/StoriesPage";

type Page = "feed" | "explore" | "upload" | "stories" | "chat" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("feed");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState<Principal | null>(null);

  const { identity, clear, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show setup modal when authenticated but no profile exists
  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setCurrentPage("feed");
  };

  const handleNavigate = (page: Page) => {
    if (page === "upload") {
      setUploadOpen(true);
      return;
    }
    // Reset chat user when navigating away from chat via nav
    if (page !== "chat") {
      setChatUserId(null);
    }
    setCurrentPage(page);
  };

  const handleOpenConversation = (userId: Principal) => {
    setChatUserId(userId);
    setCurrentPage("chat");
  };

  const handleChatBack = () => {
    if (chatUserId !== null) {
      setChatUserId(null);
      // Stay on chat list
    } else {
      setCurrentPage("feed");
    }
  };

  // Show loading while initializing auth
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full tricolor-gradient flex items-center justify-center animate-pulse">
            <span className="text-2xl">🇮🇳</span>
          </div>
          <p className="font-display text-muted-foreground text-sm">
            Loading IndiaSocial...
          </p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={() => setCurrentPage("feed")} />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "feed":
        return <FeedPage />;
      case "explore":
        return <ExplorePage />;
      case "stories":
        return <StoriesPage />;
      case "chat":
        if (chatUserId !== null) {
          return (
            <ChatConversationPage
              otherUser={chatUserId}
              onBack={handleChatBack}
            />
          );
        }
        return <ChatListPage onOpenConversation={handleOpenConversation} />;
      case "profile":
        return (
          <ProfilePage
            onLogout={handleLogout}
            onStartChat={handleOpenConversation}
          />
        );
      default:
        return <FeedPage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Main content */}
      <div className="max-w-lg mx-auto">{renderPage()}</div>

      {/* Bottom navigation — hide when in active conversation */}
      {!(currentPage === "chat" && chatUserId !== null) && (
        <BottomNav current={currentPage} onNavigate={handleNavigate} />
      )}

      {/* Upload post modal */}
      <UploadPostModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* Profile setup modal (shown after first login) */}
      <SetupProfileModal
        open={showProfileSetup}
        onComplete={() => {
          // Profile was saved, the query will auto-refetch
        }}
      />

      <Toaster richColors position="top-center" />
    </div>
  );
}
