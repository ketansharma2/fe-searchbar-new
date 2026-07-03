import { describe, it, expect } from "vitest";
import { candidateFormSchema } from "@/lib/validation/candidate";

const valid = {
  name: "Devyani Garg",
  email: "devyani@example.com",
  mobile: "9876543210",
  location: "Panipat",
  qualification: "B.Com",
  designation: "CRM",
  topSkills: ["Communication"],
  skillsAll: [],
  companyNamesAll: [],
  education: [],
};

describe("candidateFormSchema", () => {
  it("accepts a valid payload", () => {
    expect(candidateFormSchema.safeParse(valid).success).toBe(true);
  });

  it("requires name/location/qualification/designation", () => {
    for (const field of ["name", "location", "qualification", "designation"] as const) {
      expect(candidateFormSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false);
    }
  });

  it("rejects an invalid email", () => {
    expect(candidateFormSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("enforces a 10-digit mobile", () => {
    expect(candidateFormSchema.safeParse({ ...valid, mobile: "123" }).success).toBe(false);
    expect(candidateFormSchema.safeParse({ ...valid, mobile: "98765432100" }).success).toBe(false);
  });

  it("allows blank resumeUrl but rejects an invalid one", () => {
    expect(candidateFormSchema.safeParse({ ...valid, resumeUrl: "" }).success).toBe(true);
    expect(candidateFormSchema.safeParse({ ...valid, resumeUrl: "not-a-url" }).success).toBe(false);
  });
});
