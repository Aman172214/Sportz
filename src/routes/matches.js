import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches";
import { db } from "../db/db";
import { getMatchStatus } from "../utils/match-status";
import { matches } from "../db/schema";
import { desc } from "drizzle-orm";

const matchesRouter = Router();

matchesRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({
      error: "Invalid Query",
      details: parsed.error.issues,
    });

  const limit = Math.min(parsed.data.limit ?? 50, 100);
  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch matches",
      details: error.message,
    });
  }
});

matchesRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      error: "Invalid Payload",
      details: parsed.error.issues,
    });

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(parsed.data.startTime),
        endTime: new Date(parsed.data.endTime),
        homeScore: parsed.data.homeScore ?? 0,
        awayScore: parsed.data.awayScore ?? 0,
        status: getMatchStatus(parsed.data.startTime, parsed.data.endTime),
      })
      .returning();

    if (res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(event);
    }

    res.status(201).json({ data: event });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create match",
      details: error.message,
    });
  }
});

export default matchesRouter;
