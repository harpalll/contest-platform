import { Router } from "express";
import { validateData } from "../middleware/validation.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { allowedRoles } from "../middleware/role.middleware";
import {
  createContestSchema,
  createDsaSchema,
  createMcqSchema,
  submitMcqSchema,
} from "../schemas/contest.schema";
import {
  addDsaProblem,
  addMcqToContest,
  createContest,
  getContest,
  getContestLeaderboard,
  submitMcqAnswer,
} from "../controllers/contest.controller";

const router = Router();
router.post(
  "/",
  authMiddleware,
  allowedRoles(["creator"]),
  validateData(createContestSchema),
  createContest,
);

router.get("/:contestId", authMiddleware, getContest);

router.post(
  "/:contestId/mcq",
  authMiddleware,
  allowedRoles(["creator"]),
  validateData(createMcqSchema),
  addMcqToContest,
);

router.post(
  "/:contestId/mcq/:questionId/submit",
  authMiddleware,
  allowedRoles(["contestee"]),
  validateData(submitMcqSchema),
  submitMcqAnswer,
);

router.post(
  "/:contestId/dsa",
  authMiddleware,
  allowedRoles(["creator"]),
  validateData(createDsaSchema),
  addDsaProblem,
);

router.get("/:contestId/leaderboard", authMiddleware, getContestLeaderboard);

export default router;
