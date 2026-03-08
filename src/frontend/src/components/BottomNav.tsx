import { Clapperboard, Compass, Home, PlusSquare, User } from "lucide-react";
import { AshokaChakra } from "./AshokaChakra";

type Page = "feed" | "explore" | "upload" | "stories" | "profile";

interface BottomNavProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  {
    id: "feed" as Page,
    icon: Home,
    label: "Home",
    ocid: "nav.home.link",
  },
  {
    id: "explore" as Page,
    icon: Compass,
    label: "Explore",
    ocid: "nav.explore.link",
  },
  {
    id: "upload" as Page,
    icon: PlusSquare,
    label: "Post",
    ocid: "nav.upload.button",
    special: true,
  },
  {
    id: "stories" as Page,
    icon: Clapperboard,
    label: "Stories",
    ocid: "nav.stories.link",
  },
  {
    id: "profile" as Page,
    icon: User,
    label: "Profile",
    ocid: "nav.profile.link",
  },
];

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border bottom-nav safe-area-inset-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = current === item.id;
          const Icon = item.icon;

          if (item.special) {
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-0.5 px-3 py-2 relative"
              >
                <div className="w-11 h-11 rounded-xl bg-saffron flex items-center justify-center shadow-saffron hover:bg-saffron-dark transition-all active:scale-95">
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </button>
            );
          }

          return (
            <button
              type="button"
              key={item.id}
              data-ocid={item.ocid}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-[48px] transition-all ${
                isActive ? "text-navy" : "text-muted-foreground"
              }`}
            >
              {item.id === "feed" && isActive ? (
                <AshokaChakra size={24} color="oklch(0.28 0.16 265)" />
              ) : (
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.8} />
              )}
              <span
                className={`text-[10px] font-medium ${isActive ? "text-navy" : "text-muted-foreground"}`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-saffron" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
