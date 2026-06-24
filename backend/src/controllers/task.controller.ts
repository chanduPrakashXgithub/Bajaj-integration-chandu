import { Response } from "express";
import { TaskStatus, RoleId, Priority, ApplianceStatus } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { uploadImageToCloudinary } from "../services/cloudinary.service";
import { sendPushNotification } from "../services/notification.service";
import { recalcBranchStats, recalcUserStats } from "../lib/stats";
import prisma from "../lib/prisma";

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userContext = req.user;
    if (!userContext) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status, branchId, assignedToId, limit = "10000", offset = "0" } = req.query;

    // Build query filters based on permissions
    const filters: any = {};

    if (userContext.role === RoleId.lc) {
      // LCs only see their own branch's tasks
      filters.branchId = userContext.branchId || "";
    } else if (userContext.role === RoleId.branchManager) {
      // BAMs see tasks for branches inside their branchScope
      if (branchId) {
        if (userContext.branchScope.includes(String(branchId))) {
          filters.branchId = String(branchId);
        } else {
          return res.status(403).json({ message: "Forbidden: branch out of scope" });
        }
      } else {
        filters.branchId = { in: userContext.branchScope };
      }
    } else if (userContext.role === RoleId.rm) {
      // RMs see everything
      if (branchId) {
        filters.branchId = String(branchId);
      }
    }

    if (status) {
      filters.status = status as TaskStatus;
    }
    if (assignedToId) {
      filters.assignedToId = String(assignedToId);
    }

    const checks = await prisma.check.findMany({
      where: filters,
      orderBy: { deadline: "asc" },
      take: Number(limit),
      skip: Number(offset),
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        completedBy: { select: { id: true, name: true, email: true, role: true } },
      }
    });

    const total = await prisma.check.count({ where: filters });

    return res.status(200).json({
      checks,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error: any) {
    console.error("Get tasks error: ", error);
    return res.status(500).json({
      message: "Server error retrieving tasks",
      error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred"
    });
  }
};

export const markComplete = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userContext = req.user;
    if (!userContext) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { checklistDone, notes } = req.body;

    const check = await prisma.check.findUnique({ where: { id } });
    if (!check) {
      return res.status(404).json({ message: "Check not found" });
    }

    // Verify ownership/permission (LC can only complete tasks in their branch)
    if (userContext.role === RoleId.lc && check.branchId !== userContext.branchId) {
      return res.status(403).json({ message: "Forbidden: Task is outside your branch scope" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedCheck = await tx.check.update({
        where: { id },
        data: {
          status: TaskStatus.Completed,
          checklistDone: checklistDone !== undefined ? Number(checklistDone) : check.checklistTotal,
          completedById: userContext.id,
          completedAt: new Date(),
          notes: notes || check.notes,
        }
      });

      // Update user stats
      await tx.user.update({
        where: { id: userContext.id },
        data: { tasksClosed: { increment: 1 } }
      });

      return updatedCheck;
    });

    recalcBranchStats(check.branchId).catch((err) => console.error("Failed to recalc branch stats after check completion:", err));
    recalcUserStats(userContext.id).catch((err) => console.error("Failed to recalc user stats after task completion:", err));

    return res.status(200).json({
      message: "Check completed successfully",
      check: result,
    });
  } catch (error: any) {
    console.error("Mark task complete error: ", error);
    return res.status(500).json({
      message: "Server error completing task",
      error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred"
    });
  }
};

export const submitProof = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userContext = req.user;
    if (!userContext) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const file = req.file;
    const { imageUrl: bodyImageUrl } = req.body;

    let imageUrl: string;

    if (file) {
      try {
        console.log(`Uploading proof image to Cloudinary for task ${id}...`);
        imageUrl = await uploadImageToCloudinary(file.buffer, "task_proofs");
        console.log(`Uploaded successfully: ${imageUrl}`);
      } catch (cloudErr) {
        console.error("Cloudinary upload failed, falling back to body imageUrl:", cloudErr);
        if (bodyImageUrl) {
          imageUrl = bodyImageUrl;
        } else {
          return res.status(400).json({ message: "Cloudinary upload failed and no fallback imageUrl provided" });
        }
      }
    } else if (bodyImageUrl) {
      imageUrl = bodyImageUrl;
    } else {
      return res.status(400).json({ message: "No image file or imageUrl provided" });
    }

    const check = await prisma.check.findUnique({ where: { id } });
    if (!check) {
      return res.status(404).json({ message: "Check not found" });
    }

    if (userContext.role === RoleId.lc && check.branchId !== userContext.branchId) {
      return res.status(403).json({ message: "Forbidden: Task is outside your branch scope" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedCheck = await tx.check.update({
        where: { id },
        data: {
          status: TaskStatus.Completed,
          proofUrl: imageUrl,
          checklistDone: check.checklistTotal,
          completedById: userContext.id,
          completedAt: new Date(),
          notes: req.body.notes ? `${check.notes}\nProof Remark: ${req.body.notes}` : check.notes,
        }
      });

      // Increment tasks closed
      await tx.user.update({
        where: { id: userContext.id },
        data: { tasksClosed: { increment: 1 } }
      });

      return updatedCheck;
    });

    recalcBranchStats(check.branchId).catch((err) => console.error("Failed to recalc branch stats after proof submit:", err));
    recalcUserStats(userContext.id).catch((err) => console.error("Failed to recalc user stats after proof submit:", err));

    return res.status(200).json({
      message: "Check proof submitted and verified",
      check: result,
    });
  } catch (error: any) {
    console.error("Submit proof error: ", error);
    return res.status(500).json({
      message: "Server error submitting task proof",
      error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred"
    });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userContext = req.user;
    if (!userContext) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, branchId, audience, schedule, priority, zone, deadline, assignedToId, proofRequired, proofLabel, notes, applianceId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Resolve branchId
    let resolvedBranchId = branchId;
    if (userContext.role === RoleId.lc) {
      resolvedBranchId = userContext.branchId;
    }

    if (!resolvedBranchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    // Verify branch scope/ownership
    if (userContext.role === RoleId.lc) {
      if (String(resolvedBranchId) !== String(userContext.branchId)) {
        return res.status(403).json({ message: "Forbidden: LCs can only create tasks for their own branch" });
      }
    } else if (userContext.role === RoleId.branchManager) {
      if (!userContext.branchScope.includes(String(resolvedBranchId))) {
        return res.status(403).json({ message: "Forbidden: branch out of scope" });
      }
    }

    // Safe deadline parser with defaults
    let parsedDeadline: Date;
    if (!deadline || String(deadline).trim() === "") {
      const optionsDate = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" } as const;
      const formatterDate = new Intl.DateTimeFormat("en-CA", optionsDate);
      const todayStr = formatterDate.format(new Date());
      parsedDeadline = new Date(`${todayStr}T23:59:59+05:30`);
    } else {
      parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        const optionsDate = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" } as const;
        const formatterDate = new Intl.DateTimeFormat("en-CA", optionsDate);
        const todayStr = formatterDate.format(new Date());
        parsedDeadline = new Date(`${todayStr}T23:59:59+05:30`);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const newCheck = await tx.check.create({
        data: {
          title,
          branchId: String(resolvedBranchId),
          audience: userContext.role === RoleId.lc ? RoleId.lc : ((audience as RoleId) || RoleId.lc),
          schedule: "Weekly",
          priority: (priority as Priority) || Priority.High,
          zone: zone || "Branch premises",
          deadline: parsedDeadline,
          assignedToId: userContext.role === RoleId.lc ? userContext.id : (assignedToId || null),
          assignedById: userContext.id,
          status: TaskStatus.Pending,
          checklistDone: 0,
          checklistTotal: 1,
          proofRequired: proofRequired === true || proofRequired === "true",
          proofLabel: proofLabel || "Photo proof",
          notes: notes || "",
          applianceId: applianceId || null,
        },
        include: {
          branch: { select: { name: true } }
        }
      });

      // Create system notification
      await tx.notification.create({
        data: {
          title: `New Check: ${title}`,
          detail: `New check assigned at ${newCheck.branch.name} branch for ${newCheck.audience}. Priority: ${newCheck.priority}`,
          scope: [newCheck.audience, RoleId.branchManager, RoleId.rm],
          branchId: String(resolvedBranchId),
          priority: newCheck.priority
        }
      });

      return newCheck;
    });

    // Notify assigned user if any (run outside transaction to avoid blocking DB if push server is slow)
    if (assignedToId) {
      await sendPushNotification(
        assignedToId,
        `New Check Assigned`,
        `Check "${title}" at ${result.branch.name} has been assigned to you. Deadline: ${parsedDeadline.toDateString()}`
      ).catch((err) => console.error("Failed to send push notification to LC:", err));
    } else {
      // Notify all LCs at the branch if audience is LC
      if (result.audience === RoleId.lc) {
        const lcs = await prisma.user.findMany({
          where: { branchId, role: RoleId.lc },
          select: { id: true }
        });
        const lcIds = lcs.map(u => u.id);
        if (lcIds.length > 0) {
          await sendPushNotification(
            lcIds,
            `New Branch Check`,
            `A new check "${title}" is available for ${result.branch.name} branch.`
          ).catch((err) => console.error("Failed to send push notifications to branch LCs:", err));
        }
      }
    }

    return res.status(201).json({
      message: "Check created successfully",
      check: result
    });
  } catch (error: any) {
    console.error("Create task error: ", error);
    return res.status(500).json({
      message: "Server error creating check",
      error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred"
    });
  }
};

export const revokeTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userContext = req.user;
    if (!userContext || userContext.role === RoleId.lc) {
      return res.status(403).json({ message: "Forbidden: LCs cannot revoke/re-open checks" });
    }

    const { id } = req.params;
    const { redoReason } = req.body;

    const check = await prisma.check.findUnique({ where: { id } });
    if (!check) {
      return res.status(404).json({ message: "Check not found" });
    }

    if (userContext.role === RoleId.branchManager && !userContext.branchScope.includes(check.branchId)) {
      return res.status(403).json({ message: "Forbidden: branch out of scope" });
    }

    const updatedCheck = await prisma.$transaction(async (tx) => {
      const result = await tx.check.update({
        where: { id },
        data: {
          status: TaskStatus.Revoked,
          redoReason: redoReason || "Revision requested on checklist items.",
          completedById: null,
          completedAt: null,
        },
        include: {
          branch: { select: { name: true } }
        }
      });

      // Decrement tasksClosed if the task was previously completed
      if (check.status === TaskStatus.Completed && check.completedById) {
        await tx.user.update({
          where: { id: check.completedById },
          data: { tasksClosed: { decrement: 1 } }
        });
      }

      return result;
    });

    // Notify assigned employee (outside transaction)
    if (check.assignedToId) {
      await sendPushNotification(
        check.assignedToId,
        `Check Sent Back for Revision`,
        `Your check "${check.title}" at ${updatedCheck.branch.name} was sent back for revision: "${redoReason || "Check notes"}"`
      ).catch((err) => console.error("Failed to send push notification to assigned employee:", err));
    }

    recalcBranchStats(check.branchId).catch((err) => console.error("Failed to recalc branch stats after check revoke:", err));
    if (check.completedById) {
      recalcUserStats(check.completedById).catch((err) => console.error("Failed to recalc user stats after check revoke:", err));
    }
    if (check.assignedToId) {
      recalcUserStats(check.assignedToId).catch((err) => console.error("Failed to recalc user stats for assignee after check revoke:", err));
    }

    return res.status(200).json({
      message: "Check revoked for revision successfully",
      check: updatedCheck
    });
  } catch (error: any) {
    console.error("Revoke task error: ", error);
    return res.status(500).json({
      message: "Server error revoking check",
      error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred"
    });
  }
};
