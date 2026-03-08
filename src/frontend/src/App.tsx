import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { SetupProfileModal } from "./components/SetupProfileModal";
import { UploadPostModal } from "./components/UploadPostModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { ExplorePage } from "./pages/ExplorePage";
import { FeedPage } from "./pages/FeedPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StoriesPage } from "./pages/StoriesPage";

type Page = "feed" | "explore" | "upload" | "stories" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("feed");
  const [uploadOpen, setUploadOpen] = useState(false);

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
    setCurrentPage(page);
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
      case "profile":
        return <ProfilePage onLogout={handleLogout} />;
      default:
        return <FeedPage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Main content */}
      <div className="max-w-lg mx-auto">{renderPage()}</div>

      {/* Bottom navigation */}
      <BottomNav current={currentPage} onNavigate={handleNavigate} />

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
