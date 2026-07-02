import { describe, it, expect } from "vitest";
import { buildRecruiterSchema } from "@/lib/validation/recruiter";

const valid = {
  name: "Jane Doe",
  email: "jane@mavenjobs.in",
  password: "Passw0rd!",
  dailyDownloadLimit: 10,
  active: true,
};

describe("buildRecruiterSchema — create mode", () => {
  const schema = buildRecruiterSchema("create");

  it("accepts a fully valid payload", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("requires a name", () => {
    const res = schema.safeParse({ ...valid, name: "" });
    expect(res.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const res = schema.safeParse({ ...valid, email: "not-an-email" });
    expect(res.success).toBe(false);
  });

  it("requires password >= 8 chars in create mode", () => {
    const res = schema.safeParse({ ...valid, password: "short" });
    expect(res.success).toBe(false);
  });

  it("rejects a negative daily limit", () => {
    const res = schema.safeParse({ ...valid, dailyDownloadLimit: -1 });
    expect(res.success).toBe(false);
  });

  it("rejects a non-numeric limit (form parses via valueAsNumber)", () => {
    const res = schema.safeParse({ ...valid, dailyDownloadLimit: "25" });
    expect(res.success).toBe(false);
  });

  it("accepts a whole-number limit", () => {
    const res = schema.safeParse({ ...valid, dailyDownloadLimit: 25 });
    expect(res.success).toBe(true);
  });
});

describe("buildRecruiterSchema — edit mode", () => {
  const schema = buildRecruiterSchema("edit");

  it("allows a blank password (means unchanged)", () => {
    expect(schema.safeParse({ ...valid, password: "" }).success).toBe(true);
  });

  it("still rejects a too-short (non-blank) password", () => {
    expect(schema.safeParse({ ...valid, password: "abc" }).success).toBe(false);
  });
});
