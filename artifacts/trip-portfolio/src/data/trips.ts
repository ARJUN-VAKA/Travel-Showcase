import goaCover from "../assets/images/goa-cover.png";
import manaliCover from "../assets/images/manali-cover.png";
import rishikeshCover from "../assets/images/rishikesh-cover.png";
import jaipurCover from "../assets/images/jaipur-cover.png";
import coorgCover from "../assets/images/coorg-cover.png";
import meghalayaCover from "../assets/images/meghalaya-cover.png";

import goa1 from "../assets/images/goa-1.png";
import goa2 from "../assets/images/goa-2.png";
import goa3 from "../assets/images/goa-3.png";
import goa4 from "../assets/images/goa-4.png";

import manali1 from "../assets/images/manali-1.png";
import manali2 from "../assets/images/manali-2.png";
import manali3 from "../assets/images/manali-3.png";
import manali4 from "../assets/images/manali-4.png";

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

export const TRIPS: Trip[] = [
  {
    id: "goa",
    place: "GOA",
    tagline: "WHERE THE SUN NEVER SETS",
    date: "April 2024",
    friendCount: 6,
    coverImage: goaCover,
    color: "hsl(var(--primary))",
    media: [
      { id: "g1", type: "photo", src: goa1, caption: "Arriving at the beach shack", orientation: "landscape", timestamp: "Day 1 - 4:00 PM" },
      { id: "g2", type: "photo", src: goa2, caption: "Streets of Fontainhas", orientation: "portrait", timestamp: "Day 2 - 10:30 AM" },
      { id: "g3", type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "Sunset vibes", orientation: "landscape", timestamp: "Day 2 - 6:45 PM" },
      { id: "g4", type: "photo", src: goa3, caption: "Seafood madness", orientation: "landscape", timestamp: "Day 3 - 1:00 PM" },
      { id: "g5", type: "photo", src: goa4, caption: "Scooter adventures", orientation: "portrait", timestamp: "Day 4 - 9:00 AM" },
    ]
  },
  {
    id: "manali",
    place: "MANALI",
    tagline: "COLD AIR, WARM HEARTS",
    date: "Jan 2024",
    friendCount: 4,
    coverImage: manaliCover,
    color: "hsl(var(--secondary))",
    media: [
      { id: "m1", type: "photo", src: manali1, caption: "First glimpse of snow", orientation: "landscape", timestamp: "Day 1 - 8:00 AM" },
      { id: "m2", type: "photo", src: manali2, caption: "Mall road madness", orientation: "portrait", timestamp: "Day 1 - 7:00 PM" },
      { id: "m3", type: "photo", src: manali3, caption: "Cafe hopping", orientation: "landscape", timestamp: "Day 2 - 12:00 PM" },
      { id: "m4", type: "photo", src: manali4, caption: "Flying high", orientation: "portrait", timestamp: "Day 3 - 10:00 AM" },
    ]
  },
  {
    id: "rishikesh",
    place: "RISHIKESH",
    tagline: "RIVER RAPIDS & CHANTS",
    date: "Oct 2023",
    friendCount: 5,
    coverImage: rishikeshCover,
    color: "hsl(var(--accent))",
    media: []
  },
  {
    id: "jaipur",
    place: "JAIPUR",
    tagline: "THE PINK CITY CHRONICLES",
    date: "Dec 2023",
    friendCount: 3,
    coverImage: jaipurCover,
    color: "#0000FF", // electric blue
    media: []
  },
  {
    id: "coorg",
    place: "COORG",
    tagline: "COFFEE & CLOUDS",
    date: "Aug 2023",
    friendCount: 8,
    coverImage: coorgCover,
    color: "hsl(var(--primary))",
    media: []
  },
  {
    id: "meghalaya",
    place: "MEGHALAYA",
    tagline: "ABOVE THE CLOUDS",
    date: "Nov 2023",
    friendCount: 4,
    coverImage: meghalayaCover,
    color: "hsl(var(--secondary))",
    media: []
  }
];
