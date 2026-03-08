import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { AshokaChakra } from "../components/AshokaChakra";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();

  useEffect(() => {
    if (identity) {
      onLogin();
    }
  }, [identity, onLogin]);

  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = () => {
    if (isLoggingIn) return;
    login();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-white">
      {/* Tricolor background strips */}
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 bg-saffron opacity-10" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-india-green opacity-10" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-saffron opacity-5 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-india-green opacity-5 -translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-navy opacity-3" />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 px-8 w-full max-w-sm"
      >
        {/* Logo area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          {/* Chakra Logo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full tricolor-gradient flex items-center justify-center shadow-card">
              <AshokaChakra size={56} color="white" />
            </div>
          </div>

          {/* App Name */}
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-navy tracking-tight">
              India<span className="text-saffron">Social</span>
            </h1>
            <div className="flex items-center gap-1 justify-center mt-1">
              <div className="h-0.5 w-8 bg-saffron rounded-full" />
              <div className="h-0.5 w-8 bg-white border border-gray-200 rounded-full" />
              <div className="h-0.5 w-8 bg-india-green rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center space-y-1"
        >
          <p className="font-display text-lg text-navy font-semibold">
            भारत की अपनी सोशल दुनिया
          </p>
          <p className="text-muted-foreground text-sm font-body">
            India's own social world — share your moments
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full bg-white rounded-2xl shadow-card-hover border border-border p-6 space-y-5"
        >
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold text-foreground">
              स्वागत है! 🙏
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Login to share your India story
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { emoji: "📸", label: "Photos" },
              { emoji: "🌟", label: "Stories" },
              { emoji: "🤝", label: "Connect" },
            ].map(({ emoji, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 py-2 rounded-xl bg-accent"
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Login button */}
          <button
            type="button"
            data-ocid="auth.login.button"
            onClick={handleLogin}
            disabled={isLoggingIn || isInitializing}
            className="w-full flex items-center justify-center gap-3 bg-saffron hover:bg-saffron-dark text-white font-display font-semibold text-base py-3.5 rounded-xl transition-all duration-200 shadow-saffron hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>लॉगिन हो रहा है...</span>
              </>
            ) : (
              <>
                <AshokaChakra size={20} color="white" />
                <span>Login with Internet Identity</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Powered by Internet Computer • Secure & Private
          </p>
        </motion.div>

        {/* Tricolor divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="flex gap-0 w-32 h-1 rounded-full overflow-hidden"
        >
          <div className="flex-1 bg-saffron" />
          <div className="flex-1 bg-white border-y border-gray-100" />
          <div className="flex-1 bg-india-green" />
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-xs text-muted-foreground z-10"
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline underline-offset-2 hover:text-saffron transition-colors"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </motion.p>
    </div>
  );
}
