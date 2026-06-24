import { Router } from "express";
import {
  getComplaints,
  getComplaintDetail,
  createComplaint,
  updateComplaintStatus,
  raiseToVendor,
  closeComplaint,
  resolveComplaint,
  getComplaintDashboardStats,
  requestUpdate,
  escalateComplaint,
  addVendorRemark,
} from "../controllers/complaint.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Dashboard stats (must be before /:id to avoid route conflict)
router.get("/dashboard/stats", authenticateToken, getComplaintDashboardStats);

// CRUD
router.get("/", authenticateToken, getComplaints);
router.get("/:id", authenticateToken, getComplaintDetail);
router.post("/", authenticateToken, createComplaint);

// Actions
router.patch("/:id/status", authenticateToken, updateComplaintStatus);
router.post("/:id/raise-to-vendor", authenticateToken, raiseToVendor);
router.post("/:id/close", authenticateToken, closeComplaint);
router.patch("/:id/resolve", authenticateToken, resolveComplaint);
router.post("/:id/request-update", authenticateToken, requestUpdate);
router.post("/:id/escalate", authenticateToken, escalateComplaint);
router.post("/:id/vendorRemarks", authenticateToken, addVendorRemark);

export default router;
