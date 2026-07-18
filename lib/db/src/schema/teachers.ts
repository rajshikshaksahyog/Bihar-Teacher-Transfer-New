import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teachersTable = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  employeeId: text("employee_id").notNull().unique(),
  phone: text("phone"),
  email: text("email"),
  designation: text("designation").notNull().default("Primary Teacher"),
  subject: text("subject"),
  district: text("district").notNull().default(""),
  block: text("block").notNull().default(""),
  school: text("school").notNull().default(""),
  schoolCode: text("school_code"),
  panchayat: text("panchayat"),
  teacherCategory: text("teacher_category"),
  casteCategory: text("caste_category"),
  serviceYears: integer("service_years"),
  isProfileComplete: boolean("is_profile_complete").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTeacherSchema = createInsertSchema(teachersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachersTable.$inferSelect;
