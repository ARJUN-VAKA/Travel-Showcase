import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TRIPS, Trip, MediaItem } from "../data/trips";

const STORAGE_KEY = "trip-portfolio-data";

function loadFromStorage(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Trip[];
  } catch {
    // ignore
  }
  return TRIPS;
}

function saveToStorage(trips: Trip[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // ignore (e.g. storage quota exceeded for large base64 images)
  }
}

interface TripContextValue {
  trips: Trip[];
  updateTrip: (id: string, updates: Partial<Omit<Trip, "id" | "media">>) => void;
  addTrip: () => void;
  deleteTrip: (id: string) => void;
  addMedia: (tripId: string, item: MediaItem) => void;
  updateMedia: (tripId: string, mediaId: string, updates: Partial<MediaItem>) => void;
  deleteMedia: (tripId: string, mediaId: string) => void;
  reorderMedia: (tripId: string, fromIndex: number, toIndex: number) => void;
  resetToDefaults: () => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(loadFromStorage);

  const persist = useCallback((updated: Trip[]) => {
    setTrips(updated);
    saveToStorage(updated);
  }, []);

  const updateTrip = useCallback((id: string, updates: Partial<Omit<Trip, "id" | "media">>) => {
    setTrips(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addTrip = useCallback(() => {
    const id = `trip-${Date.now()}`;
    const newTrip: Trip = {
      id,
      place: "NEW PLACE",
      tagline: "YOUR TAGLINE HERE",
      date: "2024",
      friendCount: 4,
      coverImage: "",
      color: "#FFE500",
      media: [],
    };
    setTrips(prev => {
      const updated = [...prev, newTrip];
      saveToStorage(updated);
      return updated;
    });
    return id;
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addMedia = useCallback((tripId: string, item: MediaItem) => {
    setTrips(prev => {
      const updated = prev.map(t =>
        t.id === tripId ? { ...t, media: [...t.media, item] } : t
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateMedia = useCallback((tripId: string, mediaId: string, updates: Partial<MediaItem>) => {
    setTrips(prev => {
      const updated = prev.map(t =>
        t.id === tripId
          ? { ...t, media: t.media.map(m => m.id === mediaId ? { ...m, ...updates } : m) }
          : t
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteMedia = useCallback((tripId: string, mediaId: string) => {
    setTrips(prev => {
      const updated = prev.map(t =>
        t.id === tripId ? { ...t, media: t.media.filter(m => m.id !== mediaId) } : t
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const reorderMedia = useCallback((tripId: string, fromIndex: number, toIndex: number) => {
    setTrips(prev => {
      const updated = prev.map(t => {
        if (t.id !== tripId) return t;
        const media = [...t.media];
        const [moved] = media.splice(fromIndex, 1);
        media.splice(toIndex, 0, moved);
        return { ...t, media };
      });
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    persist(TRIPS);
  }, [persist]);

  return (
    <TripContext.Provider value={{
      trips, updateTrip, addTrip, deleteTrip,
      addMedia, updateMedia, deleteMedia, reorderMedia, resetToDefaults,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrips must be used within TripProvider");
  return ctx;
}
