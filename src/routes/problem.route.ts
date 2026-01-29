import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { allowedRoles } from "../middleware/role.middleware";
import {
  getDsaProblemDetails,
  submitDsaAnswer,
} from "../controllers/problem.controller";
import { validateData } from "../middleware/validation.middleware";
import { problemSubmitSchema } from "../schemas/problem.schema";

const router = Router();

router.get("/:problemId", authMiddleware, getDsaProblemDetails);

router.post(
  "/:problemId/submit",
  authMiddleware,
  allowedRoles(["contestee"]),
  validateData(problemSubmitSchema),
  submitDsaAnswer,
);

export default router;
