import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware";
import {
  amDashboard,
  amAttendance,
  amFinance,
  amUsers,
  amAnalytics,
  amTasks,
  amFinanceExport,
  amUpdateUserStatus,
} from "../../controllers/role/am.controller";

const router = Router();

// All RM routes require authentication
router.use(authenticateToken);

/** GET /api/am/dashboard — branches + complaints + approvals + notifications */
router.get("/dashboard", amDashboard);

/** GET /api/am/attendance — all attendance + all users (RM scope) */
router.get("/attendance", amAttendance);

/** GET /api/am/finance — approvals financial data + branch budget summary */
router.get("/finance", amFinance);

/** GET /api/am/finance/export — download CSV of all approvals + branch budgets */
router.get("/finance/export", amFinanceExport);

/** GET /api/am/users — all users + branches for user management screen */
router.get("/users", amUsers);

/** PATCH /api/am/users/:id/status — lock or unlock a user account */
router.patch("/users/:id/status", amUpdateUserStatus);

/** GET /api/am/analytics — per-branch KPI aggregates */
router.get("/analytics", amAnalytics);

/** GET /api/am/tasks — all tasks (RM scope) with lean fields */
router.get("/tasks", amTasks);

export default router;
