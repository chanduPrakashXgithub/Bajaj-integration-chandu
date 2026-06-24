import { z } from "zod";

export const complaintSchema = z.object({
  assetId: z.string().min(1, "Select an appliance/asset"),
  priority: z.string().min(1, "Select a priority"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  audience: z.string().min(1, "Select an audience"),
  schedule: z.string().min(1, "Select a schedule"),
  zone: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.string().min(1, "Select a priority"),
  notes: z.string().optional(),
});

export const applianceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Enter a category"),
  zone: z.string().min(1, "Enter a zone"),
  brand: z.string().min(1, "Enter a brand"),
  serial: z.string().min(2, "Enter serial number"),
  model: z.string().optional(),
  purchaseCost: z.number().nonnegative("Cost must be non-negative").optional()
});

export const expenseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  vendor: z.string().optional(),
  description: z.string().optional(),
});

export const visitSchema = z.object({
  branchId: z.number().min(1, "Select a branch"),
  date: z.string().min(1, "Enter a date"),
  purpose: z.string().min(3, "Purpose must be at least 3 characters"),
  agenda: z.string().optional(),
});

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(1, "Select a role"),
});

export type ValidationResult = {
  success: boolean;
  errors: Record<string, string>;
};

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, errors: {} };
  }
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });
  return { success: false, errors };
}
