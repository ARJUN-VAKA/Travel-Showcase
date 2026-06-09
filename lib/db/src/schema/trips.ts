import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tripsTable = pgTable("trips", {
  id: text("id").primaryKey(),
  place: text("place").notNull(),
  tagline: text("tagline").notNull().default(""),
  date: text("date").notNull().default(""),
  friendCount: integer("friend_count").notNull().default(0),
  coverImage: text("cover_image").notNull().default(""),
  color: text("color").notNull().default("#FFE500"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTripSchema = createInsertSchema(tripsTable).omit({ createdAt: true, updatedAt: true });
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type TripRow = typeof tripsTable.$inferSelect;
