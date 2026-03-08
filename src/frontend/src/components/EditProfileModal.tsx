import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface EditProfileModalProps {
  open: boolean;
  currentProfile: UserProfile | null;
  onClose: () => void;
}

export function EditProfileModal({
  open,
  currentProfile,
  onClose,
}: EditProfileModalProps) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (currentProfile) {
      setUsername(currentProfile.username);
      setBio(currentProfile.bio);
    }
  }, [currentProfile]);

  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        username: username.trim(),
        bio: bio.trim(),
        avatarBlobKey: currentProfile?.avatarBlobKey || "",
      });
      toast.success("प्रोफ़ाइल अपडेट हो गई! Profile updated!");
      onClose();
    } catch {
      toast.error("Failed to update profile. Try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative z-10 bg-white w-full max-w-sm rounded-2xl overflow-hidden"
          >
            <div className="h-1 tricolor-horizontal" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-display font-bold text-lg">Edit Profile</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="edit-username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  id="edit-username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    )
                  }
                  maxLength={30}
                  required
                  className="w-full px-3 py-2.5 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="edit-bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  rows={3}
                  placeholder="अपने बारे में लिखें..."
                  className="w-full px-3 py-2.5 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <span className="text-xs text-muted-foreground text-right block">
                  {bio.length}/150
                </span>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  data-ocid="profile.edit_button"
                  type="submit"
                  disabled={saveProfile.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-saffron text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saveProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
