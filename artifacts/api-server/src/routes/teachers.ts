import { Router, type IRouter } from "express";
import { db, teachersTable } from "@workspace/db";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { teacherToJson } from "./auth";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const teacherId = req.session?.teacherId;
  if (!teacherId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return teacherId;
}

// GET /api/teachers/me
router.get("/teachers/me", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const teacher = await db.query.teachersTable.findFirst({
    where: eq(teachersTable.id, teacherId),
  });
  if (!teacher) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(teacherToJson(teacher));
});

// PUT /api/teachers/me
router.put("/teachers/me", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const { name, employeeId, designation, subject, district, block, school, schoolCode, serviceYears } = req.body;

  const isProfileComplete = !!(name && employeeId && designation && district && block && school);

  const [updated] = await db.update(teachersTable)
    .set({
      ...(name !== undefined && { name }),
      ...(employeeId !== undefined && { employeeId }),
      ...(designation !== undefined && { designation }),
      ...(subject !== undefined && { subject }),
      ...(district !== undefined && { district }),
      ...(block !== undefined && { block }),
      ...(school !== undefined && { school }),
      ...(schoolCode !== undefined && { schoolCode }),
      ...(serviceYears !== undefined && { serviceYears }),
      isProfileComplete,
      updatedAt: new Date(),
    })
    .where(eq(teachersTable.id, teacherId))
    .returning();

  res.json(teacherToJson(updated));
});

// GET /api/teachers
router.get("/teachers", async (req, res) => {
  const { district, subject, designation, block, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions: any[] = [eq(teachersTable.isProfileComplete, true)];

  // Exclude the current user from listings
  const teacherId = (req.session as any)?.teacherId;
  if (teacherId) {
    conditions.push(sql`${teachersTable.id} != ${teacherId}`);
  }

  if (district) conditions.push(eq(teachersTable.district, district));
  if (subject) conditions.push(eq(teachersTable.subject, subject));
  if (designation) conditions.push(eq(teachersTable.designation, designation));
  if (block) conditions.push(eq(teachersTable.block, block));
  if (search) {
    conditions.push(
      or(
        ilike(teachersTable.name, `%${search}%`),
        ilike(teachersTable.school, `%${search}%`),
        ilike(teachersTable.employeeId, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [teachers, countResult] = await Promise.all([
    db.select().from(teachersTable).where(where).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(teachersTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    teachers: teachers.map(teacherToJson),
    total,
    page: pageNum,
    totalPages,
  });
});

// GET /api/teachers/:id
router.get("/teachers/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const teacher = await db.query.teachersTable.findFirst({
    where: eq(teachersTable.id, id),
  });
  if (!teacher) {
    res.status(404).json({ error: "Teacher not found" });
    return;
  }
  res.json(teacherToJson(teacher));
});

export default router;
