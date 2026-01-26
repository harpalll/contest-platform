import { Router } from "express";
import { login, me, signUp } from "../controllers/auth.controller";
import {
  userLoginSchema,
  userRegistrationSchema,
} from "../schemas/user.schema";
import { validateData } from "../middleware/validation.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", validateData(userRegistrationSchema), signUp);
router.post("/login", validateData(userLoginSchema), login);
router.get("/me", authMiddleware, me);

export default router;
