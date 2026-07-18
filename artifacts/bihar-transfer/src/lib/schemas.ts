import { z } from "zod";

export const mobileLoginSchema = z.object({
  phone: z.string().length(10, { message: "Mobile number must be exactly 10 digits" }).regex(/^\d+$/, { message: "Must contain only numbers" }),
});

export const mobileVerifySchema = z.object({
  phone: z.string().length(10),
  otp: z.string().length(6, { message: "OTP must be 6 digits" }).regex(/^\d+$/, { message: "Must contain only numbers" }),
});

export const emailLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const emailVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, { message: "OTP must be 6 digits" }).regex(/^\d+$/, { message: "Must contain only numbers" }),
});

export const TEACHER_CATEGORIES = [
  "BPSC TRE",
  "BPSC HM",
  "Niyojit",
  "Sakshamta Passed (Vishesh Shikshak)",
  "Regular",
  "Regular HM",
] as const;

export const CASTE_CATEGORIES = [
  "UR (General)",
  "EBC (अत्यंत पिछड़ा वर्ग)",
  "BC (पिछड़ा वर्ग)",
  "SC (अनुसूचित जाति)",
  "ST (अनुसूचित जनजाति)",
  "EWS (आर्थिक रूप से कमजोर वर्ग)",
] as const;

export const DESIGNATIONS = [
  "Primary Teacher (1-5)",
  "Middle School Teacher (6-8)",
  "High School Teacher (9-10)",
  "Higher Secondary Teacher (11-12)",
] as const;

export const profileSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  phone: z.string().length(10, { message: "Mobile number must be 10 digits" }).regex(/^\d+$/, { message: "Must contain only numbers" }).optional().nullable(),
  designation: z.enum(DESIGNATIONS, { message: "Please select a designation" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  teacherCategory: z.enum(TEACHER_CATEGORIES, { message: "Please select a teacher category" }),
  casteCategory: z.enum(CASTE_CATEGORIES, { message: "Please select a caste category" }),
  district: z.string().min(2, { message: "District is required" }),
  block: z.string().min(2, { message: "Block is required" }),
  panchayat: z.string().min(1, { message: "Panchayat is required" }),
  school: z.string().min(2, { message: "School name is required" }),
  schoolCode: z.string().optional().nullable(),
  serviceYears: z.coerce.number().min(0).max(50).optional().nullable(),
});

export const transferRequestSchema = z.object({
  targetTeacherId: z.number(),
  message: z.string().max(500, "Message is too long").optional(),
});
