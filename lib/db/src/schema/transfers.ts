import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { teachersTable } from "./teachers";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transferRequestsTable = pgTable("transfer_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => teachersTable.id),
  targetId: integer("target_id").notNull().references(() => teachersTable.id),
  status: text("status", { enum: ["pending", "accepted", "rejected", "cancelled"] }).notNull().default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTransferSchema = createInsertSchema(transferRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type TransferRequest = typeof transferRequestsTable.$inferSelect;
