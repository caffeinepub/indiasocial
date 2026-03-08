import type { Post, Story, UserProfile } from "../backend.d";

// Mock principal-like string
function mkPrincipal(id: string) {
  return { toString: () => id } as any;
}

// Now in nanoseconds
const NOW_NS = BigInt(Date.now()) * BigInt(1_000_000);
const HOUR_NS = BigInt(60 * 60 * 1_000_000_000);

export const SAMPLE_PROFILES: Record<string, UserProfile> = {
  "priya.india": {
    username: "priya_sharma",
    bio: "🌸 Photography lover | Exploring Incredible India | Chai enthusiast ☕",
    avatarBlobKey: "",
  },
  "rahul.india": {
    username: "rahul_dev",
    bio: "💻 Software Engineer | Travel 🌏 | Foodie 🍜 | India 🇮🇳",
    avatarBlobKey: "",
  },
  "ananya.india": {
    username: "ananya_arts",
    bio: "🎨 Artist & Designer | Bharatanatyam dancer 💃 | Mumbai",
    avatarBlobKey: "",
  },
  "vikram.india": {
    username: "vikram_travels",
    bio: "🚂 Traveled all 29 states | Nature photographer | Adventure seeker",
    avatarBlobKey: "",
  },
};

export const SAMPLE_POSTS: Array<
  Post & { likeCount: number; commentCount: number; ownerKey: string }
> = [
  {
    id: BigInt(1),
    imageBlobKey: "",
    author: mkPrincipal("priya.india"),
    timestamp: NOW_NS - HOUR_NS * BigInt(2),
    caption:
      "दिल्ली के मसाले बाज़ार में एक सुबह ✨ The colors, the aromas, the energy! Nothing like the markets of India 🌶️🧡 #IncredibleIndia #Delhi",
    likeCount: 342,
    commentCount: 28,
    ownerKey: "priya.india",
  },
  {
    id: BigInt(2),
    imageBlobKey: "",
    author: mkPrincipal("vikram.india"),
    timestamp: NOW_NS - HOUR_NS * BigInt(5),
    caption:
      "ताजमहल — प्रेम की अमर निशानी 🕌 Watched the sunrise paint this monument in shades of gold and rose. Still breathtaking after all these visits! #TajMahal #Agra",
    likeCount: 891,
    commentCount: 67,
    ownerKey: "vikram.india",
  },
  {
    id: BigInt(3),
    imageBlobKey: "",
    author: mkPrincipal("ananya.india"),
    timestamp: NOW_NS - HOUR_NS * BigInt(8),
    caption:
      "भरतनाट्यम — भारतीय शास्त्रीय नृत्य की आत्मा 💃 Performed at the Sangeet Natak Akademi last evening. Grateful for every stage! #BharataNatyam #ClassicalDance",
    likeCount: 523,
    commentCount: 45,
    ownerKey: "ananya.india",
  },
  {
    id: BigInt(4),
    imageBlobKey: "",
    author: mkPrincipal("rahul.india"),
    timestamp: NOW_NS - HOUR_NS * BigInt(14),
    caption:
      "होली है! 🎨 Playing Holi in Vrindavan this year was absolutely magical. Colors everywhere, smiles everywhere! #Holi #Vrindavan #FestivalOfColors",
    likeCount: 1204,
    commentCount: 98,
    ownerKey: "rahul.india",
  },
  {
    id: BigInt(5),
    imageBlobKey: "",
    author: mkPrincipal("vikram.india"),
    timestamp: NOW_NS - HOUR_NS * BigInt(20),
    caption:
      "Kerala ke backwaters 🌴 There's something magical about gliding through these serene waters as the sun sets. Pure bliss! #Kerala #Backwaters #GodOwnsCountry",
    likeCount: 678,
    commentCount: 52,
    ownerKey: "vikram.india",
  },
  {
    id: BigInt(6),
    imageBlobKey: "",
    author: mkPrincipal("priya.india"),
    timestamp: NOW_NS - HOUR_NS * BigInt(22),
    caption:
      "राजस्थान की हस्तकला — हर धागे में एक कहानी 🧵 Visited the Jaipur artisan cooperative today. These craftspeople are truly amazing! #Rajasthan #Handicrafts",
    likeCount: 415,
    commentCount: 33,
    ownerKey: "priya.india",
  },
];

export const POST_IMAGES = [
  "/assets/generated/sample-post-1.dim_600x600.jpg",
  "/assets/generated/sample-post-2.dim_600x600.jpg",
  "/assets/generated/sample-post-3.dim_600x600.jpg",
  "/assets/generated/sample-post-4.dim_600x600.jpg",
  "/assets/generated/sample-post-5.dim_600x600.jpg",
  "/assets/generated/sample-post-6.dim_600x600.jpg",
];

export const AVATAR_COLORS = [
  "bg-saffron",
  "bg-india-green",
  "bg-navy",
  "bg-primary",
];

export function getAvatarInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export const SAMPLE_STORIES: Array<{
  principalStr: string;
  username: string;
  imageIndex: number;
  timestamp: bigint;
}> = [
  {
    principalStr: "priya.india",
    username: "priya_sharma",
    imageIndex: 0,
    timestamp: NOW_NS - HOUR_NS * BigInt(1),
  },
  {
    principalStr: "rahul.india",
    username: "rahul_dev",
    imageIndex: 3,
    timestamp: NOW_NS - HOUR_NS * BigInt(3),
  },
  {
    principalStr: "ananya.india",
    username: "ananya_arts",
    imageIndex: 2,
    timestamp: NOW_NS - HOUR_NS * BigInt(6),
  },
  {
    principalStr: "vikram.india",
    username: "vikram_travels",
    imageIndex: 4,
    timestamp: NOW_NS - HOUR_NS * BigInt(10),
  },
];
