import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { allowedRoles } from "../middleware/role.middleware";
import {
  getDsaProblemDetails,
  submitDsaAnswer,
} from "../controllers/problem.controller";

const router = Router();

router.get("/:problemId", authMiddleware, getDsaProblemDetails);

router.post("/:problemId/submit", authMiddleware, submitDsaAnswer);
