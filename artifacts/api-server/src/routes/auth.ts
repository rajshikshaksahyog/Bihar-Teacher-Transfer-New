import { Router, type IRouter } from "express";
import { db, teachersTable, otpsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

const router: IRouter = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function teacherToJson(teacher: typeof teachersTable.$inferSelect) {
  return {
    id: teacher.id,
    name: teacher.name,
    employeeId: teacher.employeeId,
    phone: teacher.phone,
    email: teacher.email,
    designation: teacher.designation,
    subject: teacher.subject,
    district: teacher.district,
    block: teacher.block,
    school: teacher.school,
    schoolCode: teacher.schoolCode,
    serviceYears: teacher.serviceYears,
    isProfileComplete: teacher.isProfileComplete,
    createdAt: teacher.createdAt.toISOString(),
  };
}

// POST /api/auth/send-otp
router.post("/auth/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^\d{10}$/.test(phone)) {
    res.status(400).json({ error: "Valid 10-digit phone number required" });
    return;
  }
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate old OTPs for this target
  await db.update(otpsTable).set({ used: true }).where(eq(otpsTable.target, phone));

  await db.insert(otpsTable).values({ target: phone, otp, expiresAt });

  // In production, send SMS. For now, log it.
  req.log.info({ phone, otp }, "OTP generated for mobile");

  res.json({ message: `OTP sent to ${phone}`, expiresIn: 600, otp }); // returning otp for demo
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    res.status(400).json({ error: "Phone and OTP required" });
    return;
  }

  const record = await db.query.otpsTable.findFirst({
    where: and(
      eq(otpsTable.target, phone),
      eq(otpsTable.otp, otp),
      eq(otpsTable.used, false),
      gt(otpsTable.expiresAt, new Date())
    ),
  });

  if (!record) {
    res.status(401).json({ error: "Invalid or expired OTP" });
    return;
  }

  await db.update(otpsTable).set({ used: true }).where(eq(otpsTable.id, record.id));

  // Find or create teacher by phone
  let teacher = await db.query.teachersTable.findFirst({
    where: eq(teachersTable.phone, phone),
  });
  const isNewUser = !teacher;
  if (!teacher) {
    const empId = `EMP${Date.now()}`;
    const [created] = await db.insert(teachersTable).values({
      phone,
      employeeId: empId,
      name: "",
      designation: "Primary Teacher",
      district: "",
      block: "",
      school: "",
      isProfileComplete: false,
    }).returning();
    teacher = created;
  }

  (req.session as any).teacherId = teacher.id;
  res.json({ teacher: teacherToJson(teacher), isNewUser });
});

// POST /api/auth/send-email-otp
router.post("/auth/send-email-otp", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email required" });
    return;
  }
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.update(otpsTable).set({ used: true }).where(eq(otpsTable.target, email));
  await db.insert(otpsTable).values({ target: email, otp, expiresAt });

  req.log.info({ email, otp }, "OTP generated for email");

  res.json({ message: `OTP sent to ${email}`, expiresIn: 600, otp }); // returning otp for demo
});

// POST /api/auth/verify-email-otp
router.post("/auth/verify-email-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP required" });
    return;
  }

  const record = await db.query.otpsTable.findFirst({
    where: and(
      eq(otpsTable.target, email),
      eq(otpsTable.otp, otp),
      eq(otpsTable.used, false),
      gt(otpsTable.expiresAt, new Date())
    ),
  });

  if (!record) {
    res.status(401).json({ error: "Invalid or expired OTP" });
    return;
  }

  await db.update(otpsTable).set({ used: true }).where(eq(otpsTable.id, record.id));

  let teacher = await db.query.teachersTable.findFirst({
    where: eq(teachersTable.email, email),
  });
  const isNewUser = !teacher;
  if (!teacher) {
    const empId = `EMP${Date.now()}`;
    const [created] = await db.insert(teachersTable).values({
      email,
      employeeId: empId,
      name: "",
      designation: "Primary Teacher",
      district: "",
      block: "",
      school: "",
      isProfileComplete: false,
    }).returning();
    teacher = created;
  }

  (req.session as any).teacherId = teacher.id;
  res.json({ teacher: teacherToJson(teacher), isNewUser });
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  const teacherId = (req.session as any)?.teacherId;
  if (!teacherId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const teacher = await db.query.teachersTable.findFirst({
    where: eq(teachersTable.id, teacherId),
  });
  if (!teacher) {
    res.status(401).json({ error: "Teacher not found" });
    return;
  }
  res.json(teacherToJson(teacher));
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export { teacherToJson };
export default router;
