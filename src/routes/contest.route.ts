import { Router } from "express";
import { validateData } from "../middleware/validation.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { allowedRoles } from "../middleware/role.middleware";
import {
  createContestSchema,
  createMcqSchema,
} from "../schemas/contest.schema";
import {
  addMcqToContest,
  createContest,
  getContest,
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
);

export default router;
