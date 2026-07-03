import { Router } from "express";
import { getNotifications, toggleRead, toggleBookmark, acknowledgeAlert, escalateAlert, broadcastNotification } from "../controllers/notification.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getNotifications);
router.post("/:id/read", authenticateToken, toggleRead);
router.post("/:id/bookmark", authenticateToken, toggleBookmark);
router.post("/:id/acknowledge", authenticateToken, acknowledgeAlert);
router.post("/:id/escalate", authenticateToken, escalateAlert);
router.post("/broadcast", authenticateToken, broadcastNotification);

export default router;
