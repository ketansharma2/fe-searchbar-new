import { z } from "zod";

/**
 * Manual-add form validation (data fields only; the PDF file is validated
 * separately as it isn't a serialisable form value). Mirrors the backend
 * Zod rules so users get instant feedback.
 */
export const educationSchema = z.object({
  degree: z.string().trim().optional().or(z.literal("")),
  institute: z.string().trim().optional().or(z.literal("")),
  passingYear: z.string().trim().optional().or(z.literal("")),
  score: z.string().trim().optional().or(z.literal("")),
});

export const candidateFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  mobile: z.string().trim().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  location: z.string().trim().min(1, "Location is required"),
  qualification: z.string().trim().min(1, "Qualification is required"),
  designation: z.string().trim().min(1, "Designation is required"),

  gender: z.string().optional(),
  recentCompany: z.string().optional(),
  experience: z.string().optional(),
  relevantExp: z.string().optional(), // free text; coerced on submit
  portal: z.string().optional(),
  portalDate: z.string().optional(),
  applyDate: z.string().optional(),
  callingDate: z.string().optional(),
  currCTC: z.string().optional(),
  expCTC: z.string().optional(),
  feedback: z.string().optional(),
  jdBrief: z.string().optional(),
  resumeUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  topSkills: z.array(z.string()),
  skillsAll: z.array(z.string()),
  companyNamesAll: z.array(z.string()),
  education: z.array(educationSchema),
});

export type CandidateFormValues = z.infer<typeof candidateFormSchema>;
