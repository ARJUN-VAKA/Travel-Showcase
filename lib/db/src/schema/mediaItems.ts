import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tripsTable } from "./trips";

export const mediaItemsTable = pgTable("media_items", {
  id: text("id").primaryKey(),
  tripId: text("trip_id").notNull().references(() => tripsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("photo"),
  src: text("src").notNull().default(""),
  caption: text("caption").notNull().default(""),
  orientation: text("orientation").notNull().default("landscape"),
  timestamp: text("timestamp").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMediaItemSchema = createInsertSchema(mediaItemsTable).omit({ createdAt: true });
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type MediaItemRow = typeof mediaItemsTable.$inferSelect;
