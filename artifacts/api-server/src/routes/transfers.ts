import { Router, type IRouter } from "express";
import { db, teachersTable, transferRequestsTable } from "@workspace/db";
import { eq, and, or, sql, desc } from "drizzle-orm";
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

async function enrichTransfer(transfer: typeof transferRequestsTable.$inferSelect) {
  const [requester, target] = await Promise.all([
    db.query.teachersTable.findFirst({ where: eq(teachersTable.id, transfer.requesterId) }),
    db.query.teachersTable.findFirst({ where: eq(teachersTable.id, transfer.targetId) }),
  ]);
  return {
    id: transfer.id,
    requesterId: transfer.requesterId,
    targetId: transfer.targetId,
    requester: requester ? teacherToJson(requester) : null,
    target: target ? teacherToJson(target) : null,
    status: transfer.status,
    message: transfer.message,
    createdAt: transfer.createdAt.toISOString(),
    updatedAt: transfer.updatedAt.toISOString(),
  };
}

// GET /api/transfers/stats
router.get("/transfers/stats", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const [sentAll, receivedAll, teacherCount, recentRaw] = await Promise.all([
    db.select().from(transferRequestsTable).where(eq(transferRequestsTable.requesterId, teacherId)),
    db.select().from(transferRequestsTable).where(eq(transferRequestsTable.targetId, teacherId)),
    db.select({ count: sql<number>`count(*)` }).from(teachersTable).where(eq(teachersTable.isProfileComplete, true)),
    db.select().from(transferRequestsTable)
      .where(or(eq(transferRequestsTable.requesterId, teacherId), eq(transferRequestsTable.targetId, teacherId)))
      .orderBy(desc(transferRequestsTable.updatedAt))
      .limit(5),
  ]);

  const pendingSent = sentAll.filter(t => t.status === "pending").length;
  const pendingReceived = receivedAll.filter(t => t.status === "pending").length;
  const accepted = [...sentAll, ...receivedAll].filter(t => t.status === "accepted").length;
  const rejected = sentAll.filter(t => t.status === "rejected").length + receivedAll.filter(t => t.status === "rejected").length;

  const recentActivity = await Promise.all(recentRaw.map(enrichTransfer));

  res.json({
    totalSent: sentAll.length,
    totalReceived: receivedAll.length,
    pendingSent,
    pendingReceived,
    accepted,
    rejected,
    totalTeachersRegistered: Number(teacherCount[0]?.count ?? 0),
    recentActivity,
  });
});

// GET /api/transfers
router.get("/transfers", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const { status, type } = req.query as { status?: string; type?: string };

  let where;
  if (type === "sent") {
    where = eq(transferRequestsTable.requesterId, teacherId);
  } else if (type === "received") {
    where = eq(transferRequestsTable.targetId, teacherId);
  } else {
    where = or(eq(transferRequestsTable.requesterId, teacherId), eq(transferRequestsTable.targetId, teacherId));
  }

  const transfers = await db.select().from(transferRequestsTable)
    .where(where)
    .orderBy(desc(transferRequestsTable.updatedAt));

  const filtered = status ? transfers.filter(t => t.status === status) : transfers;
  const enriched = await Promise.all(filtered.map(enrichTransfer));

  res.json(enriched);
});

// POST /api/transfers
router.post("/transfers", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const { targetTeacherId, message } = req.body;
  if (!targetTeacherId) {
    res.status(400).json({ error: "targetTeacherId required" });
    return;
  }

  // Check no existing pending request between these two
  const existing = await db.query.transferRequestsTable.findFirst({
    where: and(
      or(
        and(eq(transferRequestsTable.requesterId, teacherId), eq(transferRequestsTable.targetId, targetTeacherId)),
        and(eq(transferRequestsTable.requesterId, targetTeacherId), eq(transferRequestsTable.targetId, teacherId))
      ),
      eq(transferRequestsTable.status, "pending")
    ),
  });
  if (existing) {
    res.status(400).json({ error: "A pending request already exists between these teachers" });
    return;
  }

  const [transfer] = await db.insert(transferRequestsTable).values({
    requesterId: teacherId,
    targetId: targetTeacherId,
    message: message || null,
    status: "pending",
  }).returning();

  res.status(201).json(await enrichTransfer(transfer));
});

// GET /api/transfers/:id
router.get("/transfers/:id", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const transfer = await db.query.transferRequestsTable.findFirst({
    where: eq(transferRequestsTable.id, id),
  });
  if (!transfer) {
    res.status(404).json({ error: "Transfer not found" });
    return;
  }

  res.json(await enrichTransfer(transfer));
});

// PATCH /api/transfers/:id/accept
router.patch("/transfers/:id/accept", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const id = parseInt(req.params.id);
  const transfer = await db.query.transferRequestsTable.findFirst({
    where: and(eq(transferRequestsTable.id, id), eq(transferRequestsTable.targetId, teacherId), eq(transferRequestsTable.status, "pending")),
  });
  if (!transfer) {
    res.status(404).json({ error: "Transfer not found or not actionable" });
    return;
  }

  const [updated] = await db.update(transferRequestsTable)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(transferRequestsTable.id, id))
    .returning();

  res.json(await enrichTransfer(updated));
});

// PATCH /api/transfers/:id/reject
router.patch("/transfers/:id/reject", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const id = parseInt(req.params.id);
  const transfer = await db.query.transferRequestsTable.findFirst({
    where: and(eq(transferRequestsTable.id, id), eq(transferRequestsTable.targetId, teacherId), eq(transferRequestsTable.status, "pending")),
  });
  if (!transfer) {
    res.status(404).json({ error: "Transfer not found or not actionable" });
    return;
  }

  const [updated] = await db.update(transferRequestsTable)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(transferRequestsTable.id, id))
    .returning();

  res.json(await enrichTransfer(updated));
});

// PATCH /api/transfers/:id/cancel
router.patch("/transfers/:id/cancel", async (req, res) => {
  const teacherId = requireAuth(req, res);
  if (!teacherId) return;

  const id = parseInt(req.params.id);
  const transfer = await db.query.transferRequestsTable.findFirst({
    where: and(eq(transferRequestsTable.id, id), eq(transferRequestsTable.requesterId, teacherId), eq(transferRequestsTable.status, "pending")),
  });
  if (!transfer) {
    res.status(404).json({ error: "Transfer not found or not actionable" });
    return;
  }

  const [updated] = await db.update(transferRequestsTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(transferRequestsTable.id, id))
    .returning();

  res.json(await enrichTransfer(updated));
});

export default router;
