import { Router } from "express";
import { login, signUp } from "../controllers/auth.controller";
import { userRegistrationSchema } from "../schemas/user.schema";
import { validateData } from "../middleware/validation.middleware";

const router = Router();

router.post("/signup", validateData(userRegistrationSchema), signUp);
router.post("/login", login);

export default router;
