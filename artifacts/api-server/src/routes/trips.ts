import { Router } from "express";
import { db, tripsTable, mediaItemsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

async function fetchTripWithMedia(tripId: string) {
  const trip = await db.query.tripsTable.findFirst({
    where: eq(tripsTable.id, tripId),
  });
  if (!trip) return null;
  const media = await db
    .select()
    .from(mediaItemsTable)
    .where(eq(mediaItemsTable.tripId, tripId))
    .orderBy(asc(mediaItemsTable.sortOrder));
  return { ...trip, media };
}

// GET /api/trips
router.get("/", async (req, res) => {
  const trips = await db.select().from(tripsTable).orderBy(asc(tripsTable.sortOrder));
  const tripsWithMedia = await Promise.all(
    trips.map(async (trip) => {
      const media = await db
        .select()
        .from(mediaItemsTable)
        .where(eq(mediaItemsTable.tripId, trip.id))
        .orderBy(asc(mediaItemsTable.sortOrder));
      return { ...trip, media };
    })
  );
  res.json(tripsWithMedia);
});

// POST /api/trips
router.post("/", async (req, res) => {
  const { id, place, tagline = "", date = "", friendCount = 0, coverImage = "", color = "#FFE500", sortOrder = 0 } = req.body;
  if (!id || !place) {
    res.status(400).json({ error: "id and place are required" });
    return;
  }
  await db.insert(tripsTable).values({ id, place, tagline, date, friendCount, coverImage, color, sortOrder });
  const trip = await fetchTripWithMedia(id);
  res.status(201).json(trip);
});

// POST /api/trips/import  (must be before /:id routes)
router.post("/import", async (req, res) => {
  const { trips } = req.body as { trips: Array<{
    id: string; place: string; tagline: string; date: string;
    friendCount: number; coverImage: string; color: string; sortOrder?: number;
    media: Array<{ id: string; type: string; src: string; caption: string; orientation: string; timestamp: string; sortOrder?: number }>;
  }> };

  if (!Array.isArray(trips)) {
    res.status(400).json({ error: "trips must be an array" });
    return;
  }

  // Replace everything
  await db.delete(tripsTable);

  for (let i = 0; i < trips.length; i++) {
    const t = trips[i];
    await db.insert(tripsTable).values({
      id: t.id, place: t.place, tagline: t.tagline ?? "",
      date: t.date ?? "", friendCount: t.friendCount ?? 0,
      coverImage: t.coverImage ?? "", color: t.color ?? "#FFE500",
      sortOrder: t.sortOrder ?? i,
    });
    for (let j = 0; j < (t.media ?? []).length; j++) {
      const m = t.media[j];
      await db.insert(mediaItemsTable).values({
        id: m.id, tripId: t.id, type: m.type ?? "photo", src: m.src ?? "",
        caption: m.caption ?? "", orientation: m.orientation ?? "landscape",
        timestamp: m.timestamp ?? "", sortOrder: m.sortOrder ?? j,
      });
    }
  }

  const result = await db.select().from(tripsTable).orderBy(asc(tripsTable.sortOrder));
  const withMedia = await Promise.all(
    result.map(async (trip) => {
      const media = await db.select().from(mediaItemsTable)
        .where(eq(mediaItemsTable.tripId, trip.id)).orderBy(asc(mediaItemsTable.sortOrder));
      return { ...trip, media };
    })
  );
  res.json(withMedia);
});

// PATCH /api/trips/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { place, tagline, date, friendCount, coverImage, color, sortOrder } = req.body;
  const updates: Record<string, unknown> = {};
  if (place !== undefined) updates.place = place;
  if (tagline !== undefined) updates.tagline = tagline;
  if (date !== undefined) updates.date = date;
  if (friendCount !== undefined) updates.friendCount = friendCount;
  if (coverImage !== undefined) updates.coverImage = coverImage;
  if (color !== undefined) updates.color = color;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;

  const rows = await db.update(tripsTable).set(updates).where(eq(tripsTable.id, id)).returning();
  if (!rows.length) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const trip = await fetchTripWithMedia(id);
  res.json(trip);
});

// DELETE /api/trips/:id
router.delete("/:id", async (req, res) => {
  await db.delete(tripsTable).where(eq(tripsTable.id, req.params.id));
  res.status(204).send();
});

// POST /api/trips/:id/media
router.post("/:id/media", async (req, res) => {
  const { id } = req.params;
  const { id: mediaId, type = "photo", src = "", caption = "", orientation = "landscape", timestamp = "" } = req.body;
  if (!mediaId) {
    res.status(400).json({ error: "media id is required" });
    return;
  }
  const currentMedia = await db.select().from(mediaItemsTable)
    .where(eq(mediaItemsTable.tripId, id)).orderBy(asc(mediaItemsTable.sortOrder));
  const sortOrder = currentMedia.length;
  await db.insert(mediaItemsTable).values({ id: mediaId, tripId: id, type, src, caption, orientation, timestamp, sortOrder });
  const item = await db.query.mediaItemsTable.findFirst({ where: eq(mediaItemsTable.id, mediaId) });
  res.status(201).json(item);
});

// PUT /api/trips/:id/media  (reorder)
router.put("/:id/media", async (req, res) => {
  const { id } = req.params;
  const { orderedIds } = req.body as { orderedIds: string[] };
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ error: "orderedIds must be an array" });
    return;
  }
  await Promise.all(
    orderedIds.map((mediaId, index) =>
      db.update(mediaItemsTable).set({ sortOrder: index }).where(eq(mediaItemsTable.id, mediaId))
    )
  );
  const media = await db.select().from(mediaItemsTable)
    .where(eq(mediaItemsTable.tripId, id)).orderBy(asc(mediaItemsTable.sortOrder));
  res.json(media);
});

// PATCH /api/trips/:id/media/:mediaId
router.patch("/:id/media/:mediaId", async (req, res) => {
  const { mediaId } = req.params;
  const { type, src, caption, orientation, timestamp } = req.body;
  const updates: Record<string, unknown> = {};
  if (type !== undefined) updates.type = type;
  if (src !== undefined) updates.src = src;
  if (caption !== undefined) updates.caption = caption;
  if (orientation !== undefined) updates.orientation = orientation;
  if (timestamp !== undefined) updates.timestamp = timestamp;

  const rows = await db.update(mediaItemsTable).set(updates)
    .where(eq(mediaItemsTable.id, mediaId)).returning();
  if (!rows.length) {
    res.status(404).json({ error: "Media item not found" });
    return;
  }
  res.json(rows[0]);
});

// DELETE /api/trips/:id/media/:mediaId
router.delete("/:id/media/:mediaId", async (req, res) => {
  await db.delete(mediaItemsTable).where(eq(mediaItemsTable.id, req.params.mediaId));
  res.status(204).send();
});

export default router;
