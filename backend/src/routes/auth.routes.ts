import { Router } from "express";
import { login, resetPassword } from "../controllers/auth.controller";
import { rateLimitLogin } from "../middlewares/security.middleware";

const router = Router();

router.post("/login", rateLimitLogin, login);
router.post("/reset-password", rateLimitLogin, resetPassword);

export default router;
