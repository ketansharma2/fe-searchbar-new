import { z } from "zod";

/**
 * Client-side recruiter form validation. Mirrors the backend Zod rules
 * (name required, valid email, password ≥ 8, non-negative integer limit)
 * so users get instant feedback; the server remains the source of truth.
 */
export const recruiterFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Please enter a valid email"),
  // Empty allowed only in edit mode (means "unchanged"); superRefine below.
  password: z.string(),
  dailyDownloadLimit: z
    .number({ error: "Daily limit must be a number" })
    .int("Daily limit must be a whole number")
    .min(0, "Daily limit cannot be negative"),
  active: z.boolean(),
});

export type RecruiterFormValues = z.infer<typeof recruiterFormSchema>;

/** Build a schema whose password rule depends on create vs. edit. */
export function buildRecruiterSchema(mode: "create" | "edit") {
  return recruiterFormSchema.superRefine((val, ctx) => {
    if (mode === "create" && val.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    }
    if (mode === "edit" && val.password.length > 0 && val.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    }
  });
}
