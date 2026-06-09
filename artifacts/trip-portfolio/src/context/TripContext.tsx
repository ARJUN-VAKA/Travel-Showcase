import { createContext, useContext, useRef, useCallback, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTrips,
  getGetTripsQueryKey,
  getGetTripsQueryOptions,
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
  useAddMedia,
  useUpdateMedia,
  useDeleteMedia,
  useReorderMedia,
  useImportTrips,
} from "@workspace/api-client-react";
import type { Trip, MediaItem } from "@workspace/api-client-react";
import { TRIPS } from "../data/trips";

export type { Trip, MediaItem };

const QUERY_KEY = getGetTripsQueryKey();

type TripContextValue = {
  trips: Trip[];
  isLoading: boolean;
  updateTrip: (id: string, updates: Partial<Omit<Trip, "id" | "media">>) => void;
  addTrip: () => string;
  deleteTrip: (id: string) => void;
  addMedia: (tripId: string, item: Omit<MediaItem, "tripId" | "sortOrder">) => void;
  updateMedia: (tripId: string, mediaId: string, updates: Partial<Omit<MediaItem, "id" | "tripId" | "sortOrder">>) => void;
  deleteMedia: (tripId: string, mediaId: string) => void;
  reorderMedia: (tripId: string, fromIndex: number, toIndex: number) => void;
  resetToDefaults: () => void;
  exportData: () => void;
  importData: (json: string) => string | null;
};

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const debounceMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const { data: trips = [], isLoading } = useQuery({
    ...getGetTripsQueryOptions(),
    queryKey: QUERY_KEY,
    staleTime: 0,
  });

  // Auto-seed database with default trips on first load (empty DB)
  const importMutation = useImportTrips();
  const seededRef = useRef(false);
  useEffect(() => {
    if (!isLoading && trips.length === 0 && !seededRef.current) {
      seededRef.current = true;
      const defaultTrips = TRIPS.map((t, i) => ({
        id: t.id,
        place: t.place,
        tagline: t.tagline,
        date: t.date,
        friendCount: t.friendCount,
        coverImage: t.coverImage,
        color: t.color,
        sortOrder: i,
        media: t.media.map((m, j) => ({
          id: m.id,
          tripId: t.id,
          type: m.type,
          src: m.src,
          caption: m.caption,
          orientation: m.orientation,
          timestamp: m.timestamp,
          sortOrder: j,
        })),
      }));
      importMutation.mutate(
        { data: { trips: defaultTrips } },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }) }
      );
    }
  }, [isLoading, trips.length]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  // Debounced optimistic update helper
  const debouncedUpdate = useCallback(
    (debounceKey: string, optimisticFn: (prev: Trip[]) => Trip[], apiFn: () => void, delay = 600) => {
      // Apply optimistic update immediately
      queryClient.setQueryData<Trip[]>(QUERY_KEY, (prev) => (prev ? optimisticFn(prev) : prev));
      // Debounce the API call
      const existing = debounceMap.current.get(debounceKey);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        apiFn();
        debounceMap.current.delete(debounceKey);
      }, delay);
      debounceMap.current.set(debounceKey, timer);
    },
    [queryClient]
  );

  const updateTripMutation = useUpdateTrip({ mutation: { onSuccess: invalidate } });
  const createTripMutation = useCreateTrip({ mutation: { onSuccess: invalidate } });
  const deleteTripMutation = useDeleteTrip({ mutation: { onSuccess: invalidate } });
  const addMediaMutation = useAddMedia({ mutation: { onSuccess: invalidate } });
  const updateMediaMutation = useUpdateMedia({ mutation: { onSuccess: invalidate } });
  const deleteMediaMutation = useDeleteMedia({ mutation: { onSuccess: invalidate } });
  const reorderMediaMutation = useReorderMedia({ mutation: { onSuccess: invalidate } });
  const importTripsMutation = useImportTrips({ mutation: { onSuccess: invalidate } });

  const updateTrip = useCallback(
    (id: string, updates: Partial<Omit<Trip, "id" | "media">>) => {
      debouncedUpdate(
        `trip:${id}`,
        (prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        () => updateTripMutation.mutate({ id, data: updates })
      );
    },
    [debouncedUpdate, updateTripMutation]
  );

  const addTrip = useCallback(() => {
    const id = `trip-${Date.now()}`;
    const newTrip = {
      id, place: "NEW PLACE", tagline: "YOUR TAGLINE HERE",
      date: "2024", friendCount: 4, coverImage: "", color: "#FFE500",
      sortOrder: trips.length,
    };
    createTripMutation.mutate({ data: newTrip });
    return id;
  }, [createTripMutation, trips.length]);

  const deleteTrip = useCallback((id: string) => {
    deleteTripMutation.mutate({ id });
  }, [deleteTripMutation]);

  const addMedia = useCallback(
    (tripId: string, item: Omit<MediaItem, "tripId" | "sortOrder">) => {
      addMediaMutation.mutate({ id: tripId, data: item });
    },
    [addMediaMutation]
  );

  const updateMedia = useCallback(
    (tripId: string, mediaId: string, updates: Partial<Omit<MediaItem, "id" | "tripId" | "sortOrder">>) => {
      debouncedUpdate(
        `media:${mediaId}`,
        (prev) =>
          prev.map((t) =>
            t.id === tripId
              ? { ...t, media: t.media.map((m) => (m.id === mediaId ? { ...m, ...updates } : m)) }
              : t
          ),
        () => updateMediaMutation.mutate({ id: tripId, mediaId, data: updates })
      );
    },
    [debouncedUpdate, updateMediaMutation]
  );

  const deleteMedia = useCallback(
    (tripId: string, mediaId: string) => {
      deleteMediaMutation.mutate({ id: tripId, mediaId });
    },
    [deleteMediaMutation]
  );

  const reorderMedia = useCallback(
    (tripId: string, fromIndex: number, toIndex: number) => {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) return;
      const reordered = [...trip.media];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      const orderedIds = reordered.map((m) => m.id);

      // Optimistic update
      queryClient.setQueryData<Trip[]>(QUERY_KEY, (prev) =>
        prev
          ? prev.map((t) => (t.id === tripId ? { ...t, media: reordered } : t))
          : prev
      );
      reorderMediaMutation.mutate({ id: tripId, data: { orderedIds } });
    },
    [trips, queryClient, reorderMediaMutation]
  );

  const resetToDefaults = useCallback(() => {
    const defaultTrips = TRIPS.map((t, i) => ({
      id: t.id, place: t.place, tagline: t.tagline, date: t.date,
      friendCount: t.friendCount, coverImage: t.coverImage, color: t.color,
      sortOrder: i,
      media: t.media.map((m, j) => ({
        id: m.id, tripId: t.id, type: m.type, src: m.src,
        caption: m.caption, orientation: m.orientation, timestamp: m.timestamp,
        sortOrder: j,
      })),
    }));
    importTripsMutation.mutate({ data: { trips: defaultTrips } });
  }, [importTripsMutation]);

  const exportData = useCallback(() => {
    const json = JSON.stringify(trips, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trip-portfolio-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [trips]);

  const importData = useCallback(
    (json: string): string | null => {
      try {
        const raw = JSON.parse(json);
        // Accept both: a plain Trip[] array OR a wrapped { trips: Trip[] } object
        let tripsArray: Trip[];
        if (Array.isArray(raw)) {
          tripsArray = raw;
        } else if (raw && Array.isArray(raw.trips)) {
          tripsArray = raw.trips;
        } else {
          return "Invalid file: expected an array of trips or { trips: [...] }.";
        }
        if (tripsArray.length === 0) return "File contains no trips.";
        importTripsMutation.mutate(
          { data: { trips: tripsArray } },
          {
            onSuccess: () => {
              // Force-invalidate so all clients (and other devices on next poll) get fresh data
              queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            },
          }
        );
        return null;
      } catch {
        return "Could not parse the file. Make sure it's a valid JSON export.";
      }
    },
    [importTripsMutation, queryClient]
  );

  return (
    <TripContext.Provider
      value={{
        trips, isLoading,
        updateTrip, addTrip, deleteTrip,
        addMedia, updateMedia, deleteMedia, reorderMedia,
        resetToDefaults, exportData, importData,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrips must be used within TripProvider");
  return ctx;
}

// Re-export for direct use
export { getTrips, getGetTripsQueryKey };
