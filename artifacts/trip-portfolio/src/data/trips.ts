export type MediaItem = {
  id: string;
  type: "photo" | "video";
  src: string;
  caption: string;
  orientation: "landscape" | "portrait";
  timestamp: string;
}

export type Trip = {
  id: string;
  place: string;
  tagline: string;
  date: string;
  friendCount: number;
  coverImage: string;
  media: MediaItem[];
  color: string;
}

const placeholderImage = "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80";

export const TRIPS: Trip[] = [
  {
    id: "goa",
    place: "GOA",
    tagline: "WHERE THE SUN NEVER SETS",
    date: "April 2024",
    friendCount: 6,
    coverImage: placeholderImage,
    color: "hsl(var(--primary))",
    media: [
      { id: "g1", type: "photo", src: placeholderImage, caption: "Arriving at the beach shack", orientation: "landscape", timestamp: "Day 1 - 4:00 PM" },
      { id: "g2", type: "photo", src: placeholderImage, caption: "Streets of Fontainhas", orientation: "portrait", timestamp: "Day 2 - 10:30 AM" },
      { id: "g3", type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "Sunset vibes", orientation: "landscape", timestamp: "Day 2 - 6:45 PM" },
      { id: "g4", type: "photo", src: placeholderImage, caption: "Seafood madness", orientation: "landscape", timestamp: "Day 3 - 1:00 PM" },
      { id: "g5", type: "photo", src: placeholderImage, caption: "Scooter adventures", orientation: "portrait", timestamp: "Day 4 - 9:00 AM" },
    ]
  },
  {
    id: "manali",
    place: "MANALI",
    tagline: "COLD AIR, WARM HEARTS",
    date: "Jan 2024",
    friendCount: 4,
    coverImage: placeholderImage,
    color: "hsl(var(--secondary))",
    media: [
      { id: "m1", type: "photo", src: placeholderImage, caption: "First glimpse of snow", orientation: "landscape", timestamp: "Day 1 - 8:00 AM" },
      { id: "m2", type: "photo", src: placeholderImage, caption: "Mall road madness", orientation: "portrait", timestamp: "Day 1 - 7:00 PM" },
      { id: "m3", type: "photo", src: placeholderImage, caption: "Cafe hopping", orientation: "landscape", timestamp: "Day 2 - 12:00 PM" },
      { id: "m4", type: "photo", src: placeholderImage, caption: "Flying high", orientation: "portrait", timestamp: "Day 3 - 10:00 AM" },
    ]
  },
  {
    id: "rishikesh",
    place: "RISHIKESH",
    tagline: "RIVER RAPIDS & CHANTS",
    date: "Oct 2023",
    friendCount: 5,
    coverImage: placeholderImage,
    color: "hsl(var(--accent))",
    media: []
  },
  {
    id: "jaipur",
    place: "JAIPUR",
    tagline: "THE PINK CITY CHRONICLES",
    date: "Dec 2023",
    friendCount: 3,
    coverImage: placeholderImage,
    color: "#0000FF", // electric blue
    media: []
  },
  {
    id: "coorg",
    place: "COORG",
    tagline: "COFFEE & CLOUDS",
    date: "Aug 2023",
    friendCount: 8,
    coverImage: placeholderImage,
    color: "hsl(var(--primary))",
    media: []
  },
  {
    id: "meghalaya",
    place: "MEGHALAYA",
    tagline: "ABOVE THE CLOUDS",
    date: "Nov 2023",
    friendCount: 4,
    coverImage: placeholderImage,
    color: "hsl(var(--secondary))",
    media: []
  }
];
