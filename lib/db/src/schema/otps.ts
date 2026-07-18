import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const otpsTable = pgTable("otps", {
  id: serial("id").primaryKey(),
  target: text("target").notNull(), // phone or email
  otp: text("otp").notNull(),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Otp = typeof otpsTable.$inferSelect;
