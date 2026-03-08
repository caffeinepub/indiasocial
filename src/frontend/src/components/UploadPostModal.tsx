import { ImagePlus, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { useCreatePost } from "../hooks/useQueries";

interface UploadPostModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadPostModal({ open, onClose }: UploadPostModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();
  const { uploadFile, isUploading, uploadProgress } = useBlobStorage();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setImageFile(null);
    setImagePreview(null);
    setCaption("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      const blobKey = await uploadFile(imageFile);
      await createPost.mutateAsync({ imageBlobKey: blobKey, caption });
      toast.success("पोस्ट हो गई! 🎉 Post shared successfully!");
      handleClose();
    } catch {
      toast.error("Failed to share post. Please try again.");
    }
  };

  const isPending = createPost.isPending || isUploading;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 bg-white w-full max-w-md sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-display font-bold text-lg text-foreground">
                नई पोस्ट • New Post
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-y-auto"
            >
              {/* Image area */}
              <div className="px-5 pt-4">
                {imagePreview ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    data-ocid="upload.image.upload_button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-saffron/40 flex flex-col items-center justify-center gap-3 hover:bg-accent transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center">
                      <ImagePlus className="w-7 h-7 text-saffron" />
                    </div>
                    <div className="text-center">
                      <p className="font-display font-semibold text-foreground">
                        फ़ोटो चुनें
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tap to select a photo
                      </p>
                    </div>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Caption */}
              <div className="px-5 pt-4 pb-2">
                <textarea
                  data-ocid="upload.caption.textarea"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="कैप्शन लिखें... Write a caption"
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-input rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-muted-foreground">
                    {caption.length}/500
                  </span>
                </div>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="px-5 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 bg-saffron rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="px-5 pb-6 pt-2">
                <button
                  data-ocid="upload.submit_button"
                  type="submit"
                  disabled={isPending || !imageFile}
                  className="w-full flex items-center justify-center gap-2 bg-saffron hover:bg-saffron-dark text-white font-display font-semibold py-3.5 rounded-xl transition-all shadow-saffron disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <span>शेयर करें • Share Post</span>
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
