import { Camera, Loader2, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { useSaveCallerUserProfile } from "../hooks/useQueries";
import { AshokaChakra } from "./AshokaChakra";

interface SetupProfileModalProps {
  open: boolean;
  onComplete: () => void;
}

export function SetupProfileModal({
  open,
  onComplete,
}: SetupProfileModalProps) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveProfile = useSaveCallerUserProfile();
  const { uploadFile, isUploading, uploadProgress } = useBlobStorage();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    try {
      let avatarBlobKey = "";
      if (avatarFile) {
        avatarBlobKey = await uploadFile(avatarFile);
      }

      await saveProfile.mutateAsync({
        username: username.trim(),
        bio: bio.trim(),
        avatarBlobKey,
      });

      toast.success("प्रोफ़ाइल बन गई! 🎉 Profile created!");
      onComplete();
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  const isPending = saveProfile.isPending || isUploading;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Tricolor top stripe */}
            <div className="h-1.5 tricolor-horizontal" />

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full tricolor-gradient flex items-center justify-center">
                  <AshokaChakra size={28} color="white" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  अपनी प्रोफ़ाइल बनाएं
                </h2>
                <p className="text-sm text-muted-foreground">
                  Set up your IndiaSocial profile
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    data-ocid="setup_profile.avatar.upload_button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-saffron flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-saffron rounded-full flex items-center justify-center">
                      <Camera className="w-3 h-3 text-white" />
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <span className="text-xs text-muted-foreground">
                    Add profile photo (optional)
                  </span>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="setup-username"
                    className="text-sm font-medium text-foreground"
                  >
                    Username *
                  </label>
                  <input
                    id="setup-username"
                    data-ocid="setup_profile.username.input"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      )
                    }
                    placeholder="your_username"
                    maxLength={30}
                    required
                    className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="setup-bio"
                    className="text-sm font-medium text-foreground"
                  >
                    Bio
                  </label>
                  <textarea
                    id="setup-bio"
                    data-ocid="setup_profile.bio.textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself... अपने बारे में बताएं"
                    maxLength={150}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                  />
                  <span className="text-xs text-muted-foreground text-right block">
                    {bio.length}/150
                  </span>
                </div>

                {isUploading && (
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 bg-saffron rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <button
                  data-ocid="setup_profile.submit_button"
                  type="submit"
                  disabled={isPending || !username.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-saffron hover:bg-saffron-dark text-white font-display font-semibold py-3 rounded-xl transition-all duration-200 shadow-saffron disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating profile...</span>
                    </>
                  ) : (
                    <span>प्रोफ़ाइल बनाएं • Create Profile</span>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
